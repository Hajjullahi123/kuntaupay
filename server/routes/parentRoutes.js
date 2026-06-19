const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get Parent Dashboard (Profile + Linked Students with Fees)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'PARENT') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Usually req.user.id is the User model ID, we might need to find by userId
    const parent = await req.prisma.parent.findUnique({
      where: { userId: req.user.id || req.user.userId },
      include: {
        students: {
          include: {
            feeRecords: {
              include: {
                term: true,
                session: true
              }
            },
            classModel: true,
            miscPayments: true
          }
        }
      }
    });

    if (!parent) return res.status(404).json({ error: 'Parent profile not found' });

    res.json(parent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve parent dashboard' });
  }
});

module.exports = router;
