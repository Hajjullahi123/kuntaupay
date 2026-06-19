const express = require('express');
const router = express.Router();
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kuntau-pay-access-node-key-557';

// Administrator & Node Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    const userWithSchool = await prisma.user.findUnique({
      where: { username },
      include: { school: true }
    });

    res.json({
      token,
      user: {
        id: userWithSchool.id,
        username: userWithSchool.username,
        firstName: userWithSchool.firstName,
        lastName: userWithSchool.lastName,
        role: userWithSchool.role,
        schoolId: userWithSchool.schoolId,
        schoolLogo: userWithSchool.school?.logoUrl
      }
    });


  } catch (error) {
    res.status(500).json({ error: 'General server error.' });
  }
});

module.exports = router;
