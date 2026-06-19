const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

// Get all scholarship students and their certificates
router.get('/', authenticate, async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            where: { schoolId: req.schoolId, isScholarship: true },
            include: { scholarshipCertificates: true }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Issue a scholarship certificate
router.post('/issue', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { studentId, termsCovered, expiryDate } = req.body;
        if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

        const certificateNumber = `SCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const certificate = await prisma.scholarshipCertificate.create({
            data: {
                schoolId: req.schoolId,
                studentId: parseInt(studentId),
                certificateNumber,
                termsCovered: termsCovered || 'All Terms',
                expiryDate: expiryDate ? new Date(expiryDate) : null
            }
        });

        res.json(certificate);

        logAction({
            schoolId: req.schoolId,
            userId: req.user.id,
            action: 'ISSUE',
            resource: 'SCHOLARSHIP_CERT',
            details: { studentId, certificateNumber }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
