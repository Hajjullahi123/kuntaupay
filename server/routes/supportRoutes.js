const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

// Create a support ticket
router.post('/', authenticate, async (req, res) => {
    const { subject, message, priority } = req.body;
    try {
        const ticket = await prisma.supportTicket.create({
            data: {
                schoolId: req.schoolId,
                userId: req.user.userId,
                subject,
                message,
                priority: priority || 'NORMAL',
                status: 'OPEN'
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get tickets for the current school
router.get('/', authenticate, async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { schoolId: req.schoolId },
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
