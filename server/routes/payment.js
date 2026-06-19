const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { sendPaymentConfirmation } = require('../services/emailService');
const { logAction } = require('../utils/audit');
const { getStudentFeeSummary, calculatePreviousOutstanding, createOrUpdateFeeRecordWithOpening } = require('../utils/feeCalculations');
const { generateFingerprint } = require('../utils/security');
const { sendNotification } = require('../services/notificationService');

// Get all students with fee status (Accountant/Admin)
router.get('/students', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const { termId, academicSessionId, classId } = req.query;

    const where = { schoolId: req.schoolId, status: 'active' };
    if (classId) where.classId = parseInt(classId);

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        classModel: true,
        feeRecords: {
          where: {
            ...(termId && { termId: parseInt(termId) }),
            ...(academicSessionId && { academicSessionId: parseInt(academicSessionId) })
          }
        }
      },
      orderBy: { admissionNumber: 'asc' }
    });

    const feeStructures = await prisma.classFeeStructure.findMany({
      where: {
        schoolId: req.schoolId,
        ...(termId && { termId: parseInt(termId) }),
        ...(academicSessionId && { academicSessionId: parseInt(academicSessionId) })
      }
    });

    const structureMap = {};
    feeStructures.forEach(fs => {
      structureMap[fs.classId] = fs.amount;
    });

    const processedStudents = await Promise.all(students.map(async (student) => {
      if (student.feeRecords && student.feeRecords.length > 0) {
        return student;
      }

      const standardFee = structureMap[student.classId] || 0;
      const expected = standardFee * (1 - ((student.scholarshipPercentage || 0) / 100));
      const arrears = await calculatePreviousOutstanding(
        req.schoolId,
        student.id,
        parseInt(academicSessionId),
        parseInt(termId)
      );

      student.feeRecords = [{
        id: null,
        studentId: student.id,
        termId: parseInt(termId),
        academicSessionId: parseInt(academicSessionId),
        openingBalance: arrears,
        expectedAmount: expected,
        paidAmount: 0,
        balance: arrears + expected,
        isClearedForExam: (expected === 0 && arrears <= 0)
      }];

      return student;
    }));

    res.json(processedStudents);
  } catch (error) {
    console.error('Error fetching students with fees:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record payment (Accountant/Admin)
router.post('/payment', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const { studentId, termId, academicSessionId, amount, paymentMethod, reference, notes } = req.body;

    if (!studentId || !termId || !academicSessionId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const feeRecord = await prisma.feeRecord.findUnique({
      where: {
        schoolId_studentId_termId_academicSessionId: {
          schoolId: req.schoolId,
          studentId: parseInt(studentId),
          termId: parseInt(termId),
          academicSessionId: parseInt(academicSessionId)
        }
      },
      include: {
        student: { include: { user: true, classModel: true } },
        term: true,
        session: true
      }
    });

    if (!feeRecord) {
      return res.status(404).json({ error: 'Fee record not found. Please create a fee record first.' });
    }

    const paymentAmountNum = parseFloat(amount);
    if (isNaN(paymentAmountNum) || paymentAmountNum <= 0) {
      return res.status(400).json({ error: 'A valid positive payment amount is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentRecord = await tx.feeRecord.findUnique({ where: { id: feeRecord.id } });
      const updatedPaidAmount = currentRecord.paidAmount + paymentAmountNum;
      const updatedBalance = (currentRecord.openingBalance + currentRecord.expectedAmount) - updatedPaidAmount;

      const updated = await tx.feeRecord.update({
        where: { id: feeRecord.id },
        data: {
          paidAmount: updatedPaidAmount,
          balance: updatedBalance,
          isClearedForExam: (updatedBalance <= 0)
        },
        include: {
          student: { include: { user: true, classModel: true } },
          term: true,
          session: true
        }
      });

      const payment = await tx.feePayment.create({
        data: {
          schoolId: req.schoolId,
          feeRecordId: feeRecord.id,
          amount: paymentAmountNum,
          paymentMethod: paymentMethod || 'cash',
          reference: reference || null,
          notes: notes || null,
          recordedBy: req.user.id,
          paymentDate: new Date(),
          fingerprint: generateFingerprint({ 
                schoolId: req.schoolId, 
                amount: paymentAmountNum, 
                studentId: feeRecord.studentId, 
                timestamp: Date.now() 
          })
        }
      });

      return { feeRecord: updated, payment };
    });

    // TRIGGER COMMUNICATION HUB NOTIFICATION
    sendNotification({
      schoolId: req.schoolId,
      recipient: result.feeRecord.student.phone || result.feeRecord.student.parentPhone || 'Parent Device',
      body: `FEE RECEIPT: ₦${paymentAmountNum.toLocaleString()} received for ${result.feeRecord.student.firstName}. New Balance: ₦${result.feeRecord.balance.toLocaleString()}. Ref: ${result.payment.fingerprint}`,
      type: 'WHATSAPP'
    });

    res.json({ message: 'Payment recorded successfully', feeRecord: result.feeRecord, payment: result.payment });

    logAction({
      schoolId: req.schoolId,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'FEE_PAYMENT',
      details: { paymentId: result.payment.id, amount: paymentAmountNum }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive summary
router.get('/summary', authenticate, authorize(['admin', 'principal', 'accountant', 'SCHOOL_ADMIN', 'super_admin', 'SUPER_ADMIN']), async (req, res) => {
  try {
    let { termId, academicSessionId } = req.query;

    const schoolIdInt = req.schoolId;

    // If not provided, find the active session and term for this school
    if (!termId || !academicSessionId) {
        const activeSession = await prisma.academicSession.findFirst({
            where: { schoolId: schoolIdInt, isCurrent: true },
            include: { terms: { where: { isCurrent: true } } }
        });

        if (!activeSession || !activeSession.terms[0]) {
            // If no active period configured, we can't show a summary
            // But we shouldn't 400, we should return empty stats to avoid crashing
            return res.json({
                totalStudents: 0,
                totalExpected: 0,
                totalPaid: 0,
                totalBalance: 0,
                clearedStudents: 0,
                restrictedStudents: 0,
                recentActivity: [],
                classBreakdown: [],
                collectionTrend: [],
                scholarshipDistribution: [],
                message: 'No active academic period (Term/Session) found. Please configure one in Settings.'
            });
        }

        academicSessionId = activeSession.id;
        termId = activeSession.terms[0].id;
    }

    const tId = parseInt(termId);
    const sId = parseInt(academicSessionId);

    // BATCH OPTIMIZATION: Use Prisma Aggregations for speed
    console.time('summary-aggregations');
    const aggregations = await prisma.feeRecord.aggregate({
      where: { schoolId: schoolIdInt, termId: tId, academicSessionId: sId },
      _sum: { expectedAmount: true, paidAmount: true, balance: true },
      _count: { id: true }
    });

    const clearedCount = await prisma.feeRecord.count({
        where: { schoolId: schoolIdInt, termId: tId, academicSessionId: sId, isClearedForExam: true }
    });
    console.timeEnd('summary-aggregations');

    const totalExpected = aggregations._sum.expectedAmount || 0;
    const totalPaid = aggregations._sum.paidAmount || 0;
    const totalBalance = aggregations._sum.balance || 0;

    // Get recent activity for dashboard feed
    console.time('summary-recent-activity');
    const recentActivity = await prisma.feePayment.findMany({
      where: { schoolId: schoolIdInt },
      include: {
        feeRecord: {
          include: { student: true }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: 6
    });
    console.timeEnd('summary-recent-activity');

    console.time('summary-analytics');
    const classBreakdown = await calculateClassBreakdown(schoolIdInt, tId, sId);
    const collectionTrend = await calculateCollectionTrend(schoolIdInt);
    console.timeEnd('summary-analytics');

    const studentCounts = await prisma.student.count({ where: { schoolId: schoolIdInt, status: 'active' } });

    res.json({
      totalStudents: studentCounts,
      totalExpected,
      totalPaid,
      totalBalance,
      clearedStudents: clearedCount,
      restrictedStudents: studentCounts - clearedCount,
      recentActivity: recentActivity.map(p => ({
        amount: p.amount,
        studentName: `${p.feeRecord.student.firstName} ${p.feeRecord.student.lastName}`,
        date: p.paymentDate
      })),
      classBreakdown,
      collectionTrend,
      scholarshipDistribution: [
        { name: 'Standard', value: await prisma.student.count({ where: { schoolId: schoolIdInt, status: 'active', scholarshipPercentage: 0 } }) },
        { name: 'Partial Aid', value: await prisma.student.count({ where: { schoolId: schoolIdInt, status: 'active', scholarshipPercentage: { gt: 0, lt: 100 } } }) },
        { name: 'Full Grant', value: await prisma.student.count({ where: { schoolId: schoolIdInt, status: 'active', scholarshipPercentage: 100 } }) }
      ]
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for analytics
async function calculateClassBreakdown(schoolId, termId, sessionId) {
  // OPTIMIZED: Use groupBy to get all class data in ONE query
  const classStats = await prisma.feeRecord.groupBy({
    by: ['studentId'],
    where: { schoolId, termId, academicSessionId: sessionId },
    _sum: { paidAmount: true, balance: true }
  });

  const classes = await prisma.class.findMany({ 
    where: { schoolId },
    include: { students: { select: { id: true } } }
  });

  return classes.map(c => {
    const studentIds = c.students.map(s => s.id);
    const relevantStats = classStats.filter(s => studentIds.includes(s.studentId));
    
    return {
      name: `${c.name}${c.arm}`,
      paid: relevantStats.reduce((sum, s) => sum + (s._sum.paidAmount || 0), 0),
      debt: relevantStats.reduce((sum, s) => sum + (s._sum.balance || 0), 0)
    };
  });
}

async function calculateCollectionTrend(schoolId) {
  const currentYear = new Date().getFullYear();
  const payments = await prisma.feePayment.findMany({
    where: { 
      schoolId: parseInt(schoolId),
      paymentDate: { gte: new Date(`${currentYear}-01-01`) }
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend = months.map(m => ({ name: m, amount: 0 }));

  payments.forEach(p => {
    const mIdx = new Date(p.paymentDate).getMonth();
    trend[mIdx].amount += p.amount;
  });

  return trend;
}

// Create or update fee record (Accountant/Admin)
router.post('/record', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const { studentId, termId, academicSessionId, expectedAmount, paidAmount } = req.body;

    if (!studentId || !termId || !academicSessionId || expectedAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: { isScholarship: true, scholarshipPercentage: true, classId: true }
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const feeRecord = await createOrUpdateFeeRecordWithOpening({
      schoolId: req.schoolId,
      studentId: parseInt(studentId),
      termId: parseInt(termId),
      academicSessionId: parseInt(academicSessionId),
      expectedAmount: parseFloat(expectedAmount) * (1 - ((student.scholarshipPercentage || 0) / 100)),
      paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined
    });

    res.json({ message: 'Fee record saved successfully', feeRecord });

    logAction({
      schoolId: req.schoolId,
      userId: req.user.id,
      action: 'UPDATE_RECORD',
      resource: 'FEE_RECORD',
      details: { studentId: parseInt(studentId), expectedAmount }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit payment (Accountant/Admin)
router.put('/payment/:paymentId', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { amount, paymentMethod, reference, notes } = req.body;

    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const payment = await prisma.feePayment.findFirst({
      where: { id: paymentId, schoolId: req.schoolId },
      include: { feeRecord: true }
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const newAmount = parseFloat(amount);
    const result = await prisma.$transaction(async (tx) => {
      const feeRecord = await tx.feeRecord.findUnique({ where: { id: payment.feeRecordId } });
      const updatedPaidAmount = (feeRecord.paidAmount - payment.amount) + newAmount;
      const updatedBalance = (feeRecord.openingBalance + feeRecord.expectedAmount) - updatedPaidAmount;

      const updatedFeeRecord = await tx.feeRecord.update({
        where: { id: feeRecord.id },
        data: {
          paidAmount: updatedPaidAmount,
          balance: updatedBalance,
          isClearedForExam: (updatedBalance <= 0)
        }
      });

      const updatedPayment = await tx.feePayment.update({
        where: { id: paymentId },
        data: { amount: newAmount, paymentMethod, reference, notes }
      });

      return { feeRecord: updatedFeeRecord, payment: updatedPayment };
    });

    res.json({ message: 'Payment updated successfully', ...result });

    logAction({
      schoolId: req.schoolId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'FEE_PAYMENT',
      details: { paymentId, newAmount }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history for a student
router.get('/payments/:studentId', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { termId, academicSessionId } = req.query;

    if (!termId || !academicSessionId) {
      return res.status(400).json({ error: 'Term and Session are required' });
    }

    const feeRecord = await prisma.feeRecord.findUnique({
      where: {
        schoolId_studentId_termId_academicSessionId: {
          schoolId: req.schoolId,
          studentId,
          termId: parseInt(termId),
          academicSessionId: parseInt(academicSessionId)
        }
      }
    });

    if (!feeRecord) return res.json([]);

    const payments = await prisma.feePayment.findMany({
      where: { feeRecordId: feeRecord.id, schoolId: req.schoolId },
      orderBy: { paymentDate: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle exam clearance
router.post('/toggle-clearance/:studentId', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { termId, academicSessionId } = req.body;

    let feeRecord = await prisma.feeRecord.findUnique({
      where: {
        schoolId_studentId_termId_academicSessionId: {
          schoolId: req.schoolId,
          studentId,
          termId: parseInt(termId),
          academicSessionId: parseInt(academicSessionId)
        }
      }
    });

    let updatedStatus;
    if (!feeRecord) {
        // Create virtual record if it doesn't exist to store toggle
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        const structure = await prisma.classFeeStructure.findFirst({
            where: { classId: student.classId, termId: parseInt(termId), academicSessionId: parseInt(academicSessionId) }
        });
        const standardAmount = structure?.amount || 0;
        const expected = standardAmount * (1 - ((student.scholarshipPercentage || 0) / 100));

        feeRecord = await prisma.feeRecord.create({
            data: {
                schoolId: req.schoolId,
                studentId,
                termId: parseInt(termId),
                academicSessionId: parseInt(academicSessionId),
                expectedAmount: expected,
                paidAmount: 0,
                balance: expected,
                isClearedForExam: false 
            }
        });
        updatedStatus = false;
    } else {
        updatedStatus = !feeRecord.isClearedForExam;
        await prisma.feeRecord.update({
            where: { id: feeRecord.id },
            data: { isClearedForExam: updatedStatus, clearedBy: updatedStatus ? req.user.id : null, clearedAt: updatedStatus ? new Date() : null }
        });
    }

    res.json({ message: `Student exam access ${updatedStatus ? 'allowed' : 'restricted'}`, isClearedForExam: updatedStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global payment activity for the entire school
router.get('/activity', authenticate, authorize(['admin', 'principal', 'accountant']), async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    
    const payments = await prisma.feePayment.findMany({
      where: { schoolId: req.schoolId },
      include: {
        feeRecord: {
          include: {
            student: {
              include: { user: true, classModel: true }
            }
          }
        },
        recordedByUser: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: parseInt(limit)
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching global activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- NEW ADMIN ROUTES ---

// Get all classes
router.get('/classes', authenticate, async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { schoolId: req.schoolId },
      orderBy: { name: 'asc' }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new class
router.post('/classes', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, arm } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name is required' });

    const newClass = await prisma.class.create({
      data: {
        schoolId: req.schoolId,
        name,
        arm: arm || ''
      }
    });
    res.json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new student
router.post('/students', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { firstName, lastName, admissionNumber, classId, scholarshipPercentage } = req.body;
    
    if (!firstName || !lastName || !admissionNumber || !classId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if admission number exists
    const existing = await prisma.student.findUnique({
      where: { schoolId_admissionNumber: { schoolId: req.schoolId, admissionNumber } }
    });
    if (existing) return res.status(400).json({ error: 'Admission number already exists' });

    // Create a shell user first
    const user = await prisma.user.create({
      data: {
        schoolId: req.schoolId,
        username: admissionNumber,
        passwordHash: 'nopass', // In standalone/mock mode
        role: 'student',
        firstName,
        lastName
      }
    });

    const student = await prisma.student.create({
      data: {
        schoolId: req.schoolId,
        userId: user.id,
        admissionNumber,
        classId: parseInt(classId),
        firstName,
        lastName,
        isScholarship: (parseFloat(scholarshipPercentage) > 0),
        scholarshipPercentage: parseFloat(scholarshipPercentage) || 0
      }
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fee structures
router.get('/fee-structures', authenticate, async (req, res) => {
  try {
    const { termId, academicSessionId } = req.query;
    const structures = await prisma.classFeeStructure.findMany({
      where: { 
        schoolId: req.schoolId,
        ...(termId && { termId: parseInt(termId) }),
        ...(academicSessionId && { academicSessionId: parseInt(academicSessionId) })
      },
      include: { class: true }
    });
    res.json(structures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set class fee structure
router.post('/fee-structures', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { classId, termId, academicSessionId, amount } = req.body;
    
    if (!classId || !termId || !academicSessionId || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const structure = await prisma.classFeeStructure.upsert({
      where: {
        schoolId_classId_termId_academicSessionId: {
          schoolId: req.schoolId,
          classId: parseInt(classId),
          termId: parseInt(termId),
          academicSessionId: parseInt(academicSessionId)
        }
      },
      update: { amount: parseFloat(amount) },
      create: {
        schoolId: req.schoolId,
        classId: parseInt(classId),
        termId: parseInt(termId),
        academicSessionId: parseInt(academicSessionId),
        amount: parseFloat(amount)
      }
    });

    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/payment/:paymentId', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    
    const payment = await prisma.feePayment.findFirst({
        where: { id: paymentId, schoolId: req.schoolId },
        include: { feeRecord: true }
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await prisma.$transaction(async (tx) => {
        // Reverse balance
        const feeRecord = await tx.feeRecord.findUnique({ where: { id: payment.feeRecordId } });
        const updatedPaidAmount = feeRecord.paidAmount - payment.amount;
        const updatedBalance = (feeRecord.openingBalance + feeRecord.expectedAmount) - updatedPaidAmount;

        await tx.feeRecord.update({
            where: { id: feeRecord.id },
            data: {
                paidAmount: updatedPaidAmount,
                balance: updatedBalance,
                isClearedForExam: (updatedBalance <= 0)
            }
        });

        // Delete payment
        await tx.feePayment.delete({ where: { id: paymentId } });
    });

    res.json({ message: 'Payment reversed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export student ledger as CSV
router.get('/export', authenticate, authorize(['admin', 'accountant']), async (req, res) => {
  try {
    const { termId, academicSessionId } = req.query;
    const students = await prisma.student.findMany({
      where: { schoolId: req.schoolId, status: 'active' },
      include: {
        classModel: true,
        feeRecords: {
          where: { termId: parseInt(termId), academicSessionId: parseInt(academicSessionId) }
        }
      }
    });

    let csv = 'Admission Number,First Name,Last Name,Class,Expected,Paid,Balance,Status\n';
    students.forEach(s => {
      const record = s.feeRecords[0];
      const balance = record ? record.balance : 0;
      csv += `${s.admissionNumber},${s.firstName},${s.lastName},${s.classModel?.name || ''},${record?.expectedAmount || 0},${record?.paidAmount || 0},${balance},${record?.isClearedForExam ? 'CLEARED' : 'RESTRICTED'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ledger-export.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notify all defaulters (Bulk SMS/Email Simulation)
router.post('/notify-defaulters', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { termId, academicSessionId } = req.body;
    const defaulters = await prisma.feeRecord.findMany({
      where: {
        schoolId: req.schoolId,
        termId: parseInt(termId),
        academicSessionId: parseInt(academicSessionId),
        balance: { gt: 0 }
      },
      include: { student: { include: { user: true } } }
    });

    // In a real system, we would loop and call smsService/emailService
    // For standalone, we log the batch action
    defaulters.forEach(d => {
      console.log(`[ALERT] Notifying student ${d.student.firstName} of outstanding balance: ₦${d.balance}`);
    });

    res.json({ message: `Successfully queued notifications for ${defaulters.length} defaulters.` });

    logAction({
      schoolId: req.schoolId,
      userId: req.user.id,
      action: 'NOTIFY_DEFAULTERS',
      resource: 'LEDGER',
      details: { count: defaulters.length, termId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Audit Logs for the school
router.get('/audit-logs', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { schoolId: req.schoolId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
