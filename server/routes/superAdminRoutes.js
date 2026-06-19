const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const superAdminOnly = authorize(['SUPER_ADMIN']);

// Register a new School Organization (SchoolGroup) and its primary administrator
router.post('/organizations', authenticate, superAdminOnly, async (req, res) => {
    const { orgName, adminFirstName, adminLastName, adminUsername, adminPassword } = req.body;
    const bcrypt = require('bcryptjs');
    
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Group
            const group = await tx.schoolGroup.create({
                data: { name: orgName }
            });
 
            // 2. Create the Head Administrator for this specific group
            const tempPassword = adminPassword || 'welcome2026';
            const passwordHash = await bcrypt.hash(tempPassword, 10);
 
            const admin = await tx.user.create({
                data: {
                    username: adminUsername,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    role: 'SCHOOL_ADMIN',
                    passwordHash,
                    groupId: group.id,
                    schoolId: null // Head admins manage the entire group
                }
            });

            // 3. Automatically create a default branch so the group is immediately accessible
            const defaultSchool = await tx.school.create({
                data: {
                    name: `${orgName} (Main Campus)`,
                    groupId: group.id,
                    address: 'Main Campus Headquarters',
                    phone: '',
                    email: ''
                }
            });
 
            return { group, admin, tempPassword, defaultSchool };
        });
 
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get ecosystem summary (Global visibility for Root Super Admin)
router.get('/summary', authenticate, superAdminOnly, async (req, res) => {
    try {
        const groups = await prisma.schoolGroup.findMany({
            include: {
                schools: {
                    select: {
                        id: true,
                        name: true,
                        _count: { select: { students: true } }
                    }
                }
            }
        });

        // Batch aggregate all financial metrics for the entire ecosystem
        const [paymentsAgg, recordsAgg] = await prisma.$transaction([
            prisma.feePayment.aggregate({ 
                _sum: { amount: true } 
            }),
            prisma.feeRecord.aggregate({ 
                _sum: { balance: true, expectedAmount: true } 
            })
        ]);

        // Aggregate per-school totals to distribute back to groups
        const schoolPayments = await prisma.feePayment.groupBy({
            by: ['schoolId'],
            _sum: { amount: true }
        });

        const schoolRecords = await prisma.feeRecord.groupBy({
            by: ['schoolId'],
            _sum: { balance: true, expectedAmount: true }
        });

        // Map aggregates for quick lookup
        const paymentMap = {};
        schoolPayments.forEach(p => paymentMap[p.schoolId] = p._sum.amount || 0);

        const recordMap = {};
        schoolRecords.forEach(r => recordMap[r.schoolId] = { 
            balance: r._sum.balance || 0, 
            expected: r._sum.expectedAmount || 0 
        });

        const totalSchools = groups.reduce((acc, g) => acc + g.schools.length, 0);
        
        const formattedGroups = groups.map(g => {
            let groupStudents = 0;
            let groupRevenue = 0;
            const schoolsWithStats = g.schools.map(s => {
                groupStudents += s._count.students;
                const rev = paymentMap[s.id] || 0;
                groupRevenue += rev;
                return {
                    ...s,
                    revenue: rev,
                    debt: recordMap[s.id]?.balance || 0
                };
            });
            return {
                ...g,
                schools: schoolsWithStats,
                studentCount: groupStudents,
                totalRevenue: groupRevenue
            };
        });

        res.json({
            organizationCount: groups.length,
            totalSchools,
            globalStats: {
                totalCollected: paymentsAgg._sum.amount || 0,
                totalOwed: recordsAgg._sum.balance || 0,
                totalTarget: recordsAgg._sum.expectedAmount || 0
            },
            organizations: formattedGroups
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get all administrative users in the ecosystem
router.get('/users', authenticate, superAdminOnly, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { 
                role: { in: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] } 
            },
            include: {
                group: true,
                student: {
                    include: { classModel: true }
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Register a new user globally
router.post('/users', authenticate, superAdminOnly, async (req, res) => {
    const { username, firstName, lastName, role, password, schoolId, admissionNumber, classId } = req.body;
    const bcrypt = require('bcryptjs');
    
    try {
        const passwordHash = await bcrypt.hash(password || 'password123', 10);
        
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    username,
                    firstName,
                    lastName,
                    role,
                    passwordHash,
                    groupId: req.user.groupId,
                    schoolId: schoolId ? parseInt(schoolId) : null
                }
            });

            if (role === 'STUDENT') {
                await tx.student.create({
                    data: {
                        userId: newUser.id,
                        schoolId: parseInt(schoolId),
                        admissionNumber: admissionNumber || `ADM-${Date.now()}`,
                        classId: classId ? parseInt(classId) : null,
                        firstName,
                        lastName
                    }
                });
            }

            return newUser;
        });

        res.json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a school branch (cascading)
router.delete('/schools/:id', authenticate, superAdminOnly, async (req, res) => {
    const schoolId = parseInt(req.params.id);
    try {
        // Ensure the school belongs to the admin's group
        const school = await prisma.school.findFirst({
            where: { id: schoolId, groupId: req.user.groupId }
        });

        if (!school) {
            return res.status(404).json({ error: 'School not found or access denied' });
        }

        // Cascade delete all dependent records in correct order within a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete payment-level records
            await tx.feePayment.deleteMany({ where: { schoolId } });
            await tx.miscellaneousPayment.deleteMany({ where: { schoolId } });

            // 2. Delete fee records & structures
            await tx.feeRecord.deleteMany({ where: { schoolId } });
            await tx.classFeeStructure.deleteMany({ where: { schoolId } });
            await tx.miscellaneousFee.deleteMany({ where: { schoolId } });

            // 3. Delete scholarship certificates
            await tx.scholarshipCertificate.deleteMany({ where: { schoolId } });

            // 4. Delete students (get IDs first to clean user links)
            const students = await tx.student.findMany({ where: { schoolId }, select: { userId: true } });
            await tx.student.deleteMany({ where: { schoolId } });

            // 5. Delete payroll records
            // VoucherItems reference StaffVoucher, so delete items first
            const vouchers = await tx.staffVoucher.findMany({ where: { schoolId }, select: { id: true } });
            if (vouchers.length > 0) {
                await tx.voucherItem.deleteMany({ where: { voucherId: { in: vouchers.map(v => v.id) } } });
            }
            await tx.staffVoucher.deleteMany({ where: { schoolId } });

            // 6. Delete staff complaints then staff
            const staffIds = await tx.staff.findMany({ where: { schoolId }, select: { id: true } });
            if (staffIds.length > 0) {
                await tx.staffComplaint.deleteMany({ where: { staffId: { in: staffIds.map(s => s.id) } } });
            }
            await tx.staff.deleteMany({ where: { schoolId } });

            // 7. Delete academic structure
            await tx.term.deleteMany({ where: { schoolId } });
            await tx.academicSession.deleteMany({ where: { schoolId } });
            await tx.class.deleteMany({ where: { schoolId } });

            // 8. Delete notifications & audit logs
            await tx.notification.deleteMany({ where: { schoolId } });
            await tx.auditLog.deleteMany({ where: { schoolId } });

            // 9. Delete users linked to this school (admins/bursars created for this branch)
            await tx.user.deleteMany({ where: { schoolId } });

            // 10. Also delete student user accounts
            if (students.length > 0) {
                await tx.user.deleteMany({ where: { id: { in: students.map(s => s.userId) } } });
            }

            // 11. Finally delete the school itself
            await tx.school.delete({ where: { id: schoolId } });
        });
        
        res.json({ message: `School branch "${school.name}" and all its records have been permanently deleted.` });
    } catch (error) {
        console.error('[DELETE SCHOOL ERROR]', error);
        res.status(400).json({ 
            error: `Failed to delete school: ${error.message}` 
        });
    }
});

// Regenerate/Reset user credentials
router.post('/users/:id/reset-password', authenticate, superAdminOnly, async (req, res) => {
    const { id } = req.params;
    const bcrypt = require('bcryptjs');
    const tempPassword = 'reset' + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    try {
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        
        const user = await prisma.user.update({
            where: { id: parseInt(id), groupId: req.user.groupId },
            data: { passwordHash }
        });

        res.json({ 
            message: 'Credentials regenerated successfully', 
            username: user.username,
            tempPassword 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Academic Periods management
router.get('/academic-periods', authenticate, async (req, res) => {
    const schoolId = parseInt(req.query.schoolId);
    if (!schoolId) return res.status(400).json({ error: 'School ID required' });
    try {
        const sessions = await prisma.academicSession.findMany({
            where: { schoolId },
            include: { terms: true }
        });
        res.json(sessions);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/academic-periods/sessions', authenticate, superAdminOnly, async (req, res) => {
    const { schoolId, name } = req.body;
    try {
        const session = await prisma.academicSession.create({
            data: { schoolId: parseInt(schoolId), name, isCurrent: false }
        });
        res.json(session);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.post('/academic-periods/terms', authenticate, superAdminOnly, async (req, res) => {
    const { schoolId, sessionId, name } = req.body;
    try {
        const term = await prisma.term.create({
            data: { 
                schoolId: parseInt(schoolId), 
                academicSessionId: parseInt(sessionId), 
                name, 
                isCurrent: false 
            }
        });
        res.json(term);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.patch('/academic-periods/sessions/:id/activate', authenticate, superAdminOnly, async (req, res) => {
    const id = parseInt(req.params.id);
    const { schoolId } = req.body;
    try {
        await prisma.$transaction([
            prisma.academicSession.updateMany({ where: { schoolId: parseInt(schoolId) }, data: { isCurrent: false } }),
            prisma.academicSession.update({ where: { id }, data: { isCurrent: true } })
        ]);
        res.json({ message: 'Session activated' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.patch('/academic-periods/terms/:id/activate', authenticate, superAdminOnly, async (req, res) => {
    const id = parseInt(req.params.id);
    const { schoolId, sessionId } = req.body;
    try {
        await prisma.$transaction([
            prisma.term.updateMany({ 
                where: { schoolId: parseInt(schoolId), academicSessionId: parseInt(sessionId) }, 
                data: { isCurrent: false } 
            }),
            prisma.term.update({ where: { id }, data: { isCurrent: true } })
        ]);
        res.json({ message: 'Term activated' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

// Create a school branch directly
router.post('/organizations/:groupId/schools', authenticate, superAdminOnly, async (req, res) => {
    const { groupId } = req.params;
    const { name, address, phone, email } = req.body;
    try {
        const school = await prisma.school.create({
            data: {
                name,
                address,
                phone,
                email,
                groupId: parseInt(groupId)
            }
        });
        res.json(school);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Impersonate a school/admin (Troubleshooting Protocol)
router.post('/impersonate/:schoolId', authenticate, superAdminOnly, async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'standalone_secret_123';

    try {
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: { group: true }
        });
        
        if (!school) return res.status(404).json({ error: 'School node not found' });

        // Generate a high-authority token for the specific school environment
        const token = jwt.sign(
            { 
                userId: req.user.userId,
                role: 'SCHOOL_ADMIN', // Elevate to operational role for troubleshooting
                groupId: school.groupId,
                schoolId: school.id,
                impersonatorId: req.user.userId,
                isImpersonating: true
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token, school });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ENTERPRISE ANALYTICS & BENCHMARKING ---
router.get('/analytics/benchmarking', authenticate, superAdminOnly, async (req, res) => {
    try {
        const schools = await prisma.school.findMany({
            include: {
                group: true,
                _count: { select: { students: true } },
                feePayments: { select: { amount: true } },
                feeRecords: { select: { balance: true, expectedAmount: true } }
            }
        });

        const metrics = schools.map(school => {
            const totalRevenue = school.feePayments.reduce((sum, p) => sum + p.amount, 0);
            const totalDebt = school.feeRecords.reduce((sum, r) => sum + r.balance, 0);
            const projection = school.feeRecords.reduce((sum, r) => sum + r.expectedAmount, 0);
            
            return {
                schoolId: school.id,
                name: school.name,
                organization: school.group?.name || 'Standalone',
                studentCount: school._count.students,
                revenue: totalRevenue,
                debt: totalDebt,
                projected: projection,
                efficiency: projection > 0 ? (totalRevenue / projection) * 100 : 0
            };
        });

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- UNIVERSAL AUDIT MONITORING ---
router.get('/audit-logs', authenticate, superAdminOnly, async (req, res) => {
    const { page = 1, limit = 50, schoolId } = req.query;
    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = schoolId ? { schoolId: parseInt(schoolId) } : {};

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: { school: true }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.json({ logs, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- GLOBAL SUPPORT HUB ---
router.get('/support/tickets', authenticate, superAdminOnly, async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            include: { 
                school: true,
                user: { select: { id: true, firstName: true, lastName: true, username: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/support/tickets/:id', authenticate, superAdminOnly, async (req, res) => {
    const { id } = req.params;
    const { status, priority } = req.body;
    try {
        const ticket = await prisma.supportTicket.update({
            where: { id: parseInt(id) },
            data: { 
                status: status || undefined,
                priority: priority || undefined
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
