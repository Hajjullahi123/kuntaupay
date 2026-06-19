const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');

// Fetch All School Staff (Admin Only)
router.get('/', authenticate, authorize(['super_admin', 'school_admin']), async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
    
    const staff = await req.prisma.user.findMany({
      where: {
        ...filter,
        role: { in: ['school_admin', 'bursar', 'accountant'] }
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve team manifest' });
  }
});

// Provision New Staff Node
router.post('/provision', authenticate, authorize(['super_admin', 'school_admin']), async (req, res) => {
  const { username, password, role, firstName, lastName } = req.body;
  const schoolId = req.user.schoolId;

  try {
    const passwordHash = await bcrypt.hash(password || 'Staff123!', 10);
    const user = await req.prisma.user.create({
      data: {
        username,
        passwordHash,
        role, // bursar or accountant
        firstName,
        lastName,
        schoolId: parseInt(schoolId)
      }
    });

    res.json({ message: 'Staff node successfully provisioned', user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(400).json({ error: 'Username conflict or provisioning error' });
  }
});

module.exports = router;
