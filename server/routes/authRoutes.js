const express = require('express');
const router = express.Router();
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'standalone_secret_123';

// Public registration is disabled to maintain a strictly hierarchical system.
// New organizations must be provisioned by the Root Super Admin.


// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: { group: true }
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, groupId: user.groupId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // For School Admins, check if they have any schools created yet
        let schoolCount = 0;
        if (user.role === 'SCHOOL_ADMIN' && user.groupId) {
            schoolCount = await prisma.school.count({
                where: { groupId: user.groupId }
            });
        }

        res.json({ token, user, schoolCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
