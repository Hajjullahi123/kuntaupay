const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate } = require('../middleware/auth');

// MIDDLEWARE: Ensure the user is authorized for fiscal intelligence
const canAccessForecast = (req, res, next) => {
    if (['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized for fiscal intelligence' });
    }
};

router.get('/forecast', authenticate, canAccessForecast, async (req, res) => {
    const schoolId = parseInt(req.headers['x-school-id']) || req.user.schoolId;

    try {
        // 1. Get current active term
        const activeTerm = await prisma.term.findFirst({
            where: { schoolId, isCurrent: true },
            include: { academicSession: true }
        });

        if (!activeTerm) return res.status(404).json({ error: 'No active academic window found' });

        // 2. Aggregate Fee Records for the term
        const feeRecords = await prisma.feeRecord.findMany({
            where: { schoolId, termId: activeTerm.id },
            include: { student: true }
        });

        // 3. Historical Payment Velocity
        const payments = await prisma.feePayment.findMany({
            where: { 
                schoolId, 
                feeRecord: { termId: activeTerm.id } 
            },
            orderBy: { paymentDate: 'asc' }
        });

        const totalExpected = feeRecords.reduce((sum, r) => sum + r.expectedAmount, 0);
        const totalPaid = feeRecords.reduce((sum, r) => sum + r.paidAmount, 0);
        const totalBalance = totalExpected - totalPaid;

        // Calculate Velocity (₦ per day)
        const daysSinceStart = Math.max(1, Math.floor((new Date() - new Date(activeTerm.createdAt)) / (1000 * 60 * 60 * 24)));
        const dailyVelocity = totalPaid / daysSinceStart;

        // 4. Projection Logic
        // We assume a 90-day term for projection purposes
        const remainingDays = Math.max(0, 90 - daysSinceStart);
        const projectedAdditional = dailyVelocity * remainingDays;
        const forecastedTotal = totalPaid + projectedAdditional;
        const confidenceScore = Math.min(100, (payments.length / (feeRecords.length || 1)) * 100);

        // 5. Debt Aging
        const debtAging = {
            low: feeRecords.filter(r => r.balance > 0 && r.balance < 50000).length,
            medium: feeRecords.filter(r => r.balance >= 50000 && r.balance < 150000).length,
            high: feeRecords.filter(r => r.balance >= 150000).length
        };

        res.json({
            term: activeTerm.name,
            session: activeTerm.academicSession.name,
            metrics: {
                totalExpected,
                totalPaid,
                totalBalance,
                dailyVelocity,
                projectedAdditional,
                forecastedTotal,
                confidenceScore
            },
            debtAging,
            velocitySeries: payments.map(p => ({
                date: p.paymentDate,
                amount: p.amount
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Forecasting engine failure' });
    }
});

module.exports = router;
