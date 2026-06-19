const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'server/uploads/' });

router.post('/students', authenticate, authorize(['admin']), upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const students = [];

    try {
        if (req.file.originalname.endsWith('.csv')) {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => students.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else if (req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls')) {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);
            students.push(...data);
        }

        // Process students
        const results = { created: 0, skipped: 0, errors: [] };

        for (const s of students) {
            try {
                const { firstName, lastName, admissionNumber, classId, isScholarship, scholarshipPercentage } = s;
                if (!firstName || !lastName || !admissionNumber || !classId) {
                    results.skipped++;
                    continue;
                }

                // Check if exists
                const existing = await prisma.student.findUnique({
                    where: { schoolId_admissionNumber: { schoolId: req.schoolId, admissionNumber: String(admissionNumber) } }
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                // Create shell user
                const user = await prisma.user.create({
                    data: {
                        schoolId: req.schoolId,
                        username: String(admissionNumber),
                        passwordHash: 'dummy',
                        role: 'student',
                        firstName,
                        lastName
                    }
                });

                await prisma.student.create({
                    data: {
                        schoolId: req.schoolId,
                        userId: user.id,
                        admissionNumber: String(admissionNumber),
                        classId: parseInt(classId),
                        firstName,
                        lastName,
                        isScholarship: !!isScholarship || (parseFloat(scholarshipPercentage) > 0),
                        scholarshipPercentage: parseFloat(scholarshipPercentage) || 0
                    }
                });
                results.created++;
            } catch (err) {
                results.errors.push({ student: s, error: err.message });
            }
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('students_updated', { count: results.created, branchId: req.schoolId });
        }

        res.json({ message: 'Bulk upload completed', results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});

module.exports = router;
