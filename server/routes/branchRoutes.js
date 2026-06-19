const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all branches/schools (Super Admin sees everything, others see within group)
router.get('/', authenticate, async (req, res) => {
    const { includeArchived } = req.query;
    try {
        const filterStatus = includeArchived === 'true' ? {} : { status: 'active' };

        // Super Admins with no groupId can see the entire ecosystem
        if (req.user.role === 'SUPER_ADMIN' && !req.user.groupId) {
            const schools = await prisma.school.findMany({
                where: filterStatus,
                orderBy: { name: 'asc' },
                include: { group: true }
            });
            return res.json(schools);
        }

        if (!req.user.groupId) {
            // If user has no group and isn't super admin, just return their current school
            const school = await prisma.school.findUnique({
                where: { id: req.schoolId }
            });
            // Still respect archive status for non-super admins
            if (school && school.status !== 'active' && includeArchived !== 'true') return res.json([]);
            return res.json(school ? [school] : []);
        }

        const schools = await prisma.school.findMany({
            where: { 
                ...filterStatus,
                groupId: req.user.groupId 
            },
            orderBy: { name: 'asc' }
        });
        res.json(schools);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new branch (Allowed for SUPER_ADMIN or SCHOOL_ADMIN)
router.post('/', authenticate, async (req, res) => {
    const { name, address, phone, email, groupId } = req.body;
    
    // Check if the user is authorized
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'SCHOOL_ADMIN') {
        return res.status(403).json({ error: 'Administrative authority required' });
    }

    // Role-based restrictions on groupId
    if (req.user.role !== 'SUPER_ADMIN' && !req.user.groupId) {
        return res.status(400).json({ error: 'User must belong to an organization to create branches' });
    }

    try {
        const school = await prisma.school.create({
            data: {
                name,
                address,
                phone,
                email,
                status: 'active',
                // Super admin can specify a groupId in the body, otherwise it uses their own or remains null
                groupId: req.user.role === 'SUPER_ADMIN' ? (groupId ? parseInt(groupId) : req.user.groupId) : req.user.groupId
            }
        });
        res.json(school);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Soft Archive / Restore Branch
router.patch('/:id/archive', authenticate, async (req, res) => {
    const schoolId = parseInt(req.params.id);
    const { archive } = req.body; // true to archive, false to restore
    
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Super Admin authority required for state transition' });
    }

    try {
        const school = await prisma.school.update({
            where: { id: schoolId },
            data: { status: archive ? 'archived' : 'active' }
        });

        res.json({ 
            message: `Branch "${school.name}" successfully ${archive ? 'archived' : 'restored'}.`,
            branch: school 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Delete a school branch (cascading - Super Admin only)
router.delete('/:id', authenticate, async (req, res) => {
    const schoolId = parseInt(req.params.id);
    
    // Strict authorization
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Root administrative authority required for branch decommissioning' });
    }

    try {
        // Find the school and ensure access (if groupId exists, must match)
        const school = await prisma.school.findFirst({
            where: req.user.groupId ? { id: schoolId, groupId: req.user.groupId } : { id: schoolId }
        });

        if (!school) {
            return res.status(404).json({ error: 'School node not found or access denied within current scope' });
        }

        // --- CASCADING DECOMMISSIONING PROTOCOL ---
        // We delete dependent records in reverse order of reference to maintain integrity
        await prisma.$transaction(async (tx) => {
            // 1. Clear Financial Flux
            await tx.feePayment.deleteMany({ where: { schoolId } });
            await tx.miscellaneousPayment.deleteMany({ where: { schoolId } });

            // 2. Dissolve Fee Structures
            await tx.feeRecord.deleteMany({ where: { schoolId } });
            await tx.classFeeStructure.deleteMany({ where: { schoolId } });
            await tx.miscellaneousFee.deleteMany({ where: { schoolId } });

            // 3. Revoke Certifications
            await tx.scholarshipCertificate.deleteMany({ where: { schoolId } });

            // 4. Extract and Purge Student Nodes
            const students = await tx.student.findMany({ where: { schoolId }, select: { userId: true } });
            await tx.student.deleteMany({ where: { schoolId } });

            // 5. Terminate Payroll & Vouchers
            const vouchers = await tx.staffVoucher.findMany({ where: { schoolId }, select: { id: true } });
            if (vouchers.length > 0) {
                await tx.voucherItem.deleteMany({ where: { voucherId: { in: vouchers.map(v => v.id) } } });
            }
            await tx.staffVoucher.deleteMany({ where: { schoolId } });

            // 6. Dissolve Staff Infrastructure
            const staffIds = await tx.staff.findMany({ where: { schoolId }, select: { id: true } });
            if (staffIds.length > 0) {
                await tx.staffComplaint.deleteMany({ where: { staffId: { in: staffIds.map(s => s.id) } } });
            }
            await tx.staff.deleteMany({ where: { schoolId } });

            // 7. Wipe Academic Periods
            await tx.term.deleteMany({ where: { schoolId } });
            await tx.academicSession.deleteMany({ where: { schoolId } });
            await tx.class.deleteMany({ where: { schoolId } });

            // 8. Purge Logs & Notifications
            await tx.notification.deleteMany({ where: { schoolId } });
            await tx.auditLog.deleteMany({ where: { schoolId } });

            // 9. Decommission Associated User Accounts
            // Delete branch admins/staff
            await tx.user.deleteMany({ where: { schoolId } });
            // Delete student user profiles
            if (students.length > 0) {
                const studentUserIds = students.map(s => s.userId);
                await tx.user.deleteMany({ where: { id: { in: studentUserIds } } });
            }

            // 10. Final Node Dismantle
            await tx.school.delete({ where: { id: schoolId } });
        });

        res.json({ message: `Institutional node "${school.name}" has been permanently decommissioned and all associated data purged.` });
    } catch (error) {
        console.error('[BRANCH DELETION ERROR]', error);
        res.status(500).json({ error: `Node decommissioning failure: ${error.message}` });
    }
});

// Update Branch Branding (White-labeling)
router.patch('/:id/branding', authenticate, async (req, res) => {
    const schoolId = parseInt(req.params.id);
    const { primaryColor, secondaryColor, receiptHeader, receiptFooter } = req.body;
    
    // Authorization: Only Super Admin or School Admin of that specific school
    if (req.user.role !== 'SUPER_ADMIN' && req.schoolId !== schoolId) {
        return res.status(403).json({ error: 'Personalized branding authority required' });
    }

    try {
        const school = await prisma.school.update({
            where: { id: schoolId },
            data: { 
                primaryColor: primaryColor || undefined,
                secondaryColor: secondaryColor || undefined,
                receiptHeader: receiptHeader || undefined,
                receiptFooter: receiptFooter || undefined
            }
        });

        res.json({ message: 'Branding vectors updated successfully', school });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
