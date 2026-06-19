const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');
const { generateFingerprint } = require('../utils/security');
const { sendNotification } = require('../services/notificationService');
const XLSX = require('xlsx');

// --- STAFF DIRECTORY ---

// Get all staff
router.get('/staff', authenticate, authorize(['admin', 'principal']), async (req, res) => {
    try {
        const staff = await prisma.staff.findMany({
            where: { schoolId: req.schoolId },
            include: { complaints: { where: { status: 'OPEN' } } }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Register staff
router.post('/staff', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { firstName, lastName, phone, role, bankDetails, baseSalary } = req.body;
        const staff = await prisma.staff.create({
            data: {
                schoolId: req.schoolId,
                firstName,
                lastName,
                phone,
                role,
                bankDetails,
                baseSalary: parseFloat(baseSalary || 0)
            }
        });
        res.json(staff);
        logAction({ schoolId: req.schoolId, userId: req.user.id, action: 'CREATE', resource: 'STAFF', details: { staffId: staff.id } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update staff
router.patch('/staff/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const staffId = parseInt(req.params.id);
        const { firstName, lastName, phone, role, bankDetails, baseSalary, isActive } = req.body;
        const staff = await prisma.staff.update({
            where: { id: staffId, schoolId: req.schoolId },
            data: {
                firstName, lastName, phone, role, bankDetails, 
                baseSalary: baseSalary ? parseFloat(baseSalary) : undefined,
                isActive
            }
        });
        res.json(staff);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Download staff bulk upload template
router.get('/staff/template', authenticate, authorize(['admin']), (req, res) => {
    const data = [{
        firstName: 'John',
        lastName: 'Doe',
        phone: '2348000000000',
        role: 'TEACHER',
        bankDetails: 'BankName - 0000000000',
        baseSalary: 50000
    }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff_Template");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=Staff_Bulk_Template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// Bulk upload staff
router.post('/staff/bulk', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { staffList } = req.body;
        if (!Array.isArray(staffList)) return res.status(400).json({ error: 'Staff list must be an array' });

        const results = await prisma.staff.createMany({
            data: staffList.map(s => ({
                schoolId: req.schoolId,
                firstName: s.firstName,
                lastName: s.lastName,
                phone: s.phone?.toString(),
                role: s.role || 'TEACHER',
                bankDetails: s.bankDetails,
                baseSalary: parseFloat(s.baseSalary || 0)
            }))
        });

        res.json({ message: `Successfully inducted ${results.count} personnel entities`, count: results.count });
        logAction({ schoolId: req.schoolId, userId: req.user.id, action: 'CREATE_BULK', resource: 'STAFF', details: { count: results.count } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PAYROLL & VOUCHERS ---

// Generate monthly vouchers for all active staff
router.post('/generate-vouchers', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
    try {
        const { month, year } = req.body;
        
        // Find current academic period
        const activeSession = await prisma.academicSession.findFirst({ where: { schoolId: req.schoolId, isCurrent: true } });
        const activeTerm = activeSession ? await prisma.term.findFirst({ where: { academicSessionId: activeSession.id, isCurrent: true } }) : null;

        const staffList = await prisma.staff.findMany({ where: { schoolId: req.schoolId, isActive: true } });

        const results = [];
        for (const staff of staffList) {
            // Check if voucher already exists
            const existing = await prisma.staffVoucher.findFirst({
                where: { staffId: staff.id, month: parseInt(month), year: parseInt(year) }
            });

            if (existing) continue;

            const voucher = await prisma.staffVoucher.create({
                data: {
                    schoolId: req.schoolId,
                    staffId: staff.id,
                    academicSessionId: activeSession?.id,
                    termId: activeTerm?.id,
                    month: parseInt(month),
                    year: parseInt(year),
                    totalEarnings: staff.baseSalary,
                    totalDeductions: 0,
                    netAmount: staff.baseSalary,
                    items: {
                        create: [
                            { name: 'Basic Salary', amount: staff.baseSalary, type: 'ADDITION', explanation: 'Standard monthly compensation' }
                        ]
                    }
                }
            });
            results.push(voucher);
        }

        res.json({ message: `Successfully generated ${results.length} vouchers for ${month}/${year}`, count: results.length });
    } catch (error) {
        res.json({ error: 'DB migration required for new period tracking' });
    }
});

// Get payment schedule for a month
router.get('/schedule', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
    try {
        const { month, year } = req.query;
        const vouchers = await prisma.staffVoucher.findMany({
            where: { schoolId: req.schoolId, month: parseInt(month), year: parseInt(year) },
            include: { staff: true, items: true }
        });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a specific deduction (e.g. Defaulting)
router.post('/vouchers/:id/item', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
    try {
        const voucherId = parseInt(req.params.id);
        const { name, amount, type, explanation } = req.body;
        
        const item = await prisma.voucherItem.create({
            data: { voucherId, name, amount: parseFloat(amount), type, explanation }
        });

        // Update voucher totals
        const voucher = await prisma.staffVoucher.findUnique({ where: { id: voucherId }, include: { items: true } });
        const totalEarnings = voucher.items.filter(i => i.type === 'ADDITION').reduce((acc, i) => acc + i.amount, 0);
        const totalDeductions = voucher.items.filter(i => i.type === 'DEDUCTION').reduce((acc, i) => acc + i.amount, 0);

        await prisma.staffVoucher.update({
            where: { id: voucherId },
            data: { totalEarnings, totalDeductions, netAmount: totalEarnings - totalDeductions }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark voucher as PAID and generate WhatsApp link
router.patch('/vouchers/:id/pay', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
    try {
        const voucherId = parseInt(req.params.id);
        const voucher = await prisma.staffVoucher.update({
            where: { id: voucherId },
            data: { 
                status: 'PAID', 
                paidAt: new Date(),
                fingerprint: generateFingerprint({
                    schoolId: req.schoolId,
                    staffId: voucherId, // Using voucher ID as a seed
                    netAmount: (await prisma.staffVoucher.findUnique({ where: { id: voucherId } })).netAmount,
                    timestamp: Date.now()
                })
            },
            include: { staff: true, items: true }
        });

        // TRIGGER COMMUNICATION HUB NOTIFICATION (SALARY ALERT)
        sendNotification({
            schoolId: req.schoolId,
            recipient: voucher.staff.phone || 'Staff Device',
            body: `SALARY ALERT: ₦${voucher.netAmount.toLocaleString()} has been disbursed for ${voucher.month}/${voucher.year}. Ref: ${voucher.fingerprint}`,
            type: 'WHATSAPP'
        });

        const waLink = `https://wa.me/${voucher.staff.phone?.replace('+', '')}?text=${encodeURIComponent(`Hello ${voucher.staff.firstName}, your salary for ${voucher.month}/${voucher.year} has been processed. Net Amount: ₦${voucher.netAmount.toLocaleString()}. Thank you.`)}`;

        res.json({ message: 'Voucher marked as PAID', voucher, waLink });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- COMPLAINTS ---

// Submit a simulated WhatsApp complaint
router.post('/complaint', authenticate, async (req, res) => {
    try {
        const { staffId, message } = req.body;
        const complaint = await prisma.staffComplaint.create({
            data: { staffId: parseInt(staffId), message }
        });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all complaints for the school
router.get('/complaints', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const complaints = await prisma.staffComplaint.findMany({
            where: { 
                staff: {
                    is: { schoolId: req.schoolId }
                }
            },
            include: { staff: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ANALYTICS & EXPORTS ---

// Get salary analytics by month and year
router.get('/analytics', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const vouchers = await prisma.staffVoucher.findMany({
            where: { schoolId: req.schoolId, status: 'PAID' },
            orderBy: [{ year: 'asc' }, { month: 'asc' }]
        });

        const analytics = vouchers.reduce((acc, v) => {
            const key = `${v.month}/${v.year}`;
            if (!acc[key]) acc[key] = { month: v.month, year: v.year, total: 0 };
            acc[key].total += v.netAmount;
            return acc;
        }, {});

        res.json(Object.values(analytics));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export structured salary schedule to Excel
router.get('/export', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
    try {
        const { month, year } = req.query;
        const vouchers = await prisma.staffVoucher.findMany({
            where: { 
                schoolId: req.schoolId, 
                ...(month && { month: parseInt(month) }), 
                ...(year && { year: parseInt(year) }) 
            },
            include: { staff: true, items: true }
        });

        const data = vouchers.map(v => {
            const additions = v.items.filter(i => i.type === 'ADDITION' && i.name !== 'Basic Salary').reduce((acc, i) => acc + i.amount, 0);
            const deductions = v.items.filter(i => i.type === 'DEDUCTION').reduce((acc, i) => acc + i.amount, 0);
            
            return {
                'Staff Identity': `${v.staff.firstName} ${v.staff.lastName}`,
                'Corporate Role': v.staff.role,
                'Bank Details': v.staff.bankDetails || 'N/A',
                'Basic Salary (₦)': v.totalEarnings - additions,
                'Allowances (₦)': additions,
                'Deductions (₦)': deductions,
                'Net Payable (₦)': v.netAmount,
                'Security Fingerprint': v.fingerprint || 'PENDING',
                'Disbursement Date': v.paidAt ? new Date(v.paidAt).toLocaleDateString() : 'UNPAID'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Schedule");
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename=Salary_Schedule_${month}_${year}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
        logAction({ schoolId: req.schoolId, userId: req.user.id, action: 'EXPORT', resource: 'PAYROLL', details: { month, year } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
