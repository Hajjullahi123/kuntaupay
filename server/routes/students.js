const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');

// Fetch All Students with Analytics (Filtered by School)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
    
    const students = await req.prisma.student.findMany({
      where: filter,
      include: {
        payments: true,
        user: { select: { username: true, role: true } }
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve student manifest' });
  }
});

// Student Self-Profile (Result Lock Protocol)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const student = await req.prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: { payments: true }
    });

    if (!student) return res.status(404).json({ error: 'Student node not found' });

    const paid = student.payments.reduce((acc, p) => acc + p.amount, 0);
    const scholarshipAmt = (student.expectedTotalFee * (student.scholarshipPercentage / 100));
    const balance = student.expectedTotalFee - scholarshipAmt - paid;

    res.json({
      ...student,
      paid,
      balance,
      isLocked: balance > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// Enroll New Student Node
router.post('/enroll', authenticate, authorize(['super_admin', 'school_admin', 'bursar']), async (req, res) => {
  const { admissionNumber, firstName, lastName, username, password, scholarshipPercentage } = req.body;
  const schoolId = req.user.schoolId; // Inherit from admin

  try {
    const result = await enrollSingle(req.prisma, { admissionNumber, firstName, lastName, username, password, scholarshipPercentage, schoolId });
    req.io.emit('student_enrolled', result);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk Enrollment Node
router.post('/bulk-enroll', authenticate, authorize(['super_admin', 'school_admin', 'bursar']), async (req, res) => {
  const { students } = req.body;
  const schoolId = req.user.schoolId;
  const results = [];
  const errors = [];

  try {
    for (const s of students) {
      try {
        const res = await enrollSingle(req.prisma, { ...s, schoolId });
        results.push(res);
      } catch (err) {
        errors.push({ student: s, error: err.message });
      }
    }
    req.io.emit('student_enrolled', results);
    res.json({ successful: results.length, failed: errors.length, errors });
  } catch (error) {
    res.status(500).json({ error: 'Bulk protocol rupture' });
  }
});

async function enrollSingle(prisma, data) {
  const { admissionNumber, firstName, lastName, username, password, scholarshipPercentage, schoolId, email, guardianPhone } = data;
  
  const existing = await prisma.student.findUnique({ where: { admissionNumber } });
  if (existing) throw new Error(`Admission ID ${admissionNumber} conflict`);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: username || admissionNumber,
        passwordHash: await bcrypt.hash(password || 'Student123!', 10),
        role: 'student',
        firstName,
        lastName,
        schoolId: parseInt(schoolId)
      }
    });

    return await tx.student.create({
      data: {
        userId: user.id,
        schoolId: parseInt(schoolId),
        admissionNumber,
        firstName,
        lastName,
        email,
        guardianPhone,
        scholarshipPercentage: parseFloat(scholarshipPercentage) || 0,
        status: 'active'
      }
    });
  });
}


// Link Parent to Student
router.post('/:id/link-parent', authenticate, authorize(['super_admin', 'school_admin']), async (req, res) => {
  const { username, password, firstName, lastName, phone } = req.body;
  const studentId = parseInt(req.params.id);

  try {
    const student = await req.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check if user exists
    let user = await req.prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await req.prisma.user.create({
        data: {
          username,
          passwordHash: await bcrypt.hash(password || 'Parent123!', 10),
          role: 'PARENT',
          firstName,
          lastName,
          schoolId: student.schoolId
        }
      });
    }

    let parent = await req.prisma.parent.findUnique({ where: { userId: user.id } });
    if (!parent) {
      parent = await req.prisma.parent.create({
        data: {
          userId: user.id,
          schoolId: student.schoolId,
          phone
        }
      });
    }

    // Connect student to parent
    await req.prisma.student.update({
      where: { id: studentId },
      data: {
        parents: {
          connect: { id: parent.id }
        }
      }
    });

    res.json({ message: 'Parent linked successfully', parent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to link parent' });
  }
});

module.exports = router;
