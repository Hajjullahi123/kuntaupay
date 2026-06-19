const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { sendInvoice, sendDebtReminder } = require('../services/notifier');

// Fetch Institutional Debtors
router.get('/debtors', authenticate, authorize(['super_admin', 'school_admin', 'accountant']), async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
    
    const students = await req.prisma.student.findMany({
      where: filter,
      include: { payments: true }
    });

    const debtors = students.map(s => {
      const paid = s.payments.reduce((acc, p) => acc + p.amount, 0);
      const scholarshipAmt = (s.expectedTotalFee * (s.scholarshipPercentage / 100));
      const balance = s.expectedTotalFee - scholarshipAmt - paid;
      return { ...s, paid, balance };
    }).filter(d => d.balance > 0);

    res.json(debtors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract debtor manifest' });
  }
});

// Broadcast Debt Reminders (Institutional Alert)
router.post('/remind-all', authenticate, authorize(['super_admin', 'school_admin']), async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
    const students = await req.prisma.student.findMany({
      where: filter,
      include: { payments: true }
    });

    let sentCount = 0;
    for (const s of students) {
      const paid = s.payments.reduce((acc, p) => acc + p.amount, 0);
      const scholarshipAmt = (s.expectedTotalFee * (s.scholarshipPercentage / 100));
      const balance = s.expectedTotalFee - scholarshipAmt - paid;

      if (balance > 0 && (s.email || s.guardianPhone)) {
        await sendDebtReminder(s, balance);
        sentCount++;
      }
    }

    res.json({ message: `Institutional debt broadcast complete. ${sentCount} reminders dispatched.` });
  } catch (error) {
    res.status(500).json({ error: 'Broadcast protocol failure' });
  }
});

module.exports = router;
