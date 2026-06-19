const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');
const { generateFingerprint } = require('../utils/security');

// Get all miscellaneous fees for the current school
router.get('/', authenticate, async (req, res) => {
    try {
        const fees = await prisma.miscellaneousFee.findMany({
            where: { schoolId: req.schoolId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new miscellaneous fee
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { name, amount, isCompulsory, targetClassId } = req.body;
        if (!name || !amount) return res.status(400).json({ error: 'Name and amount are required' });

        const fee = await prisma.miscellaneousFee.create({
            data: {
                schoolId: req.schoolId,
                name,
                amount: parseFloat(amount),
                isCompulsory: !!isCompulsory,
                targetClassId: targetClassId ? parseInt(targetClassId) : null
            }
        });
        res.json(fee);

        logAction({
            schoolId: req.schoolId,
            userId: req.user.id,
            action: 'CREATE',
            resource: 'MISC_FEE',
            details: { name, amount }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record a payment for a miscellaneous fee
router.post('/payment', authenticate, async (req, res) => {
    try {
        const { studentId, miscFeeId, amount, paymentMethod, reference, notes } = req.body;
        if (!studentId || !miscFeeId || !amount) return res.status(400).json({ error: 'Missing required fields' });

        const payment = await prisma.miscellaneousPayment.create({
            data: {
                schoolId: req.schoolId,
                studentId: parseInt(studentId),
                miscFeeId: parseInt(miscFeeId),
                amount: parseFloat(amount),
                paymentMethod: paymentMethod || 'cash',
                reference: reference || null,
                notes: notes || null,
                recordedBy: req.user.id,
                fingerprint: generateFingerprint({
                    schoolId: req.schoolId,
                    amount: parseFloat(amount),
                    studentId: parseInt(studentId),
                    miscFeeId: parseInt(miscFeeId),
                    timestamp: Date.now()
                })
            }
        });
        res.json(payment);

        logAction({
            schoolId: req.schoolId,
            userId: req.user.id,
            action: 'CREATE',
            resource: 'MISC_PAYMENT',
            details: { paymentId: payment.id, amount }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
