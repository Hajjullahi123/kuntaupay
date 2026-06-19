const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../db');
const { createBackup, listBackups, restoreBackup } = require('../services/backupService');
const { getSystemStatus, initializeStandalone } = require('../services/setupService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'standalone_secret_123';

// Public endpoint for first-run detection
router.get('/status', async (req, res) => {
    const status = await getSystemStatus();
    res.json(status);
});

// Setup First Admin & School (Public, but only works if not initialized)
router.post('/setup', async (req, res) => {
    try {
        const currentStatus = await getSystemStatus();
        if (currentStatus.isInitialized) {
            return res.status(403).json({ error: 'System already initialized. Access denied.' });
        }

        const { school, user } = await initializeStandalone(req.body);

        // Auto-login after setup
        const token = jwt.sign(
            { userId: user.id, role: user.role, groupId: user.groupId, schoolId: school.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'System initialized successfully', token, user, school });
    } catch (error) {
        console.error('[SETUP ERROR]', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Only SUPER_ADMIN allowed for remaining routes
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Super Admin access required for fiscal operations' });
    }
    next();
};

// Create a manual snapshot
router.post('/backup', authenticate, superAdminOnly, async (req, res) => {
    const result = await createBackup('manual');
    if (result.success) {
        res.json({ message: 'Fiscal snapshot created successfully', snapshot: result.name });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// List all snapshots
router.get('/backups', authenticate, superAdminOnly, async (req, res) => {
    const backups = listBackups();
    res.json(backups);
});

// Highly secured RESTORE route
router.post('/restore', authenticate, superAdminOnly, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Snapshot name is required' });

    console.warn(`[RESTORE] Super Admin highly authorized: RESTORING TO ${name}...`);
    const result = await restoreBackup(name);
    if (result.success) {
        res.json({ message: 'System restored successfully. Please restart the application.' });
    } else {
        res.status(500).json({ error: result.error });
    }
});

// DOCUMENT VERIFICATION PROTOCOL
router.get('/verify/:fingerprint', authenticate, async (req, res) => {
    const { fingerprint } = req.params;
    
    try {
        // Search across all fiscal document types
        const feePayment = await prisma.feePayment.findUnique({
            where: { fingerprint, schoolId: req.schoolId },
            include: { feeRecord: { include: { student: true } } }
        });

        if (feePayment) {
            return res.json({
                type: 'SCHOOL_FEE_RECEIPT',
                status: 'VERIFIED',
                amount: feePayment.amount,
                studentName: `${feePayment.feeRecord.student.firstName} ${feePayment.feeRecord.student.lastName}`,
                date: feePayment.paymentDate,
                documentId: feePayment.id
            });
        }

        const miscPayment = await prisma.miscellaneousPayment.findUnique({
            where: { fingerprint, schoolId: req.schoolId },
            include: { student: true, miscFee: true }
        });

        if (miscPayment) {
            return res.json({
                type: 'MISC_FEE_RECEIPT',
                status: 'VERIFIED',
                amount: miscPayment.amount,
                studentName: `${miscPayment.student.firstName} ${miscPayment.student.lastName}`,
                feeName: miscPayment.miscFee.name,
                date: miscPayment.paymentDate,
                documentId: miscPayment.id
            });
        }

        const staffVoucher = await prisma.staffVoucher.findUnique({
            where: { fingerprint, schoolId: req.schoolId },
            include: { staff: true }
        });

        if (staffVoucher) {
            return res.json({
                type: 'STAFF_SALARY_VOUCHER',
                status: 'VERIFIED',
                amount: staffVoucher.netAmount,
                staffName: `${staffVoucher.staff.firstName} ${staffVoucher.staff.lastName}`,
                month: staffVoucher.month,
                year: staffVoucher.year,
                date: staffVoucher.paidAt,
                documentId: staffVoucher.id
            });
        }

        res.status(404).json({ status: 'INVALID', message: 'No record found with this Security Fingerprint' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
