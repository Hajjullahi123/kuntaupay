const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

// GET ALL COMMUNICATION LOGS
router.get('/logs', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const logs = await prisma.notification.findMany({
            where: { schoolId: req.schoolId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET STAFF COMPLAINTS (Communication Hub View)
router.get('/complaints', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const complaints = await prisma.staffComplaint.findMany({
            where: { staff: { schoolId: req.schoolId } },
            include: { staff: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RESOLVE COMPLAINT
router.patch('/complaints/:id/resolve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const complaint = await prisma.staffComplaint.update({
            where: { id },
            data: { status: 'RESOLVED', resolvedAt: new Date() }
        });
        res.json(complaint);
        logAction({ schoolId: req.schoolId, userId: req.user.id, action: 'RESOLVE', resource: 'COMPLAINT', details: { complaintId: id } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BULK BROADCAST (SIMULATION)
router.post('/broadcast', authenticate, authorize(['admin']), async (req, res) => {
    const { target, message, type } = req.body;
    // Logic for broadcasting to all students/staff would go here
    res.json({ message: `Successfully queued broadcast for ${target}` });
});

module.exports = router;
