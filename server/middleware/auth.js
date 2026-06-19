const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'standalone_secret_123';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains userId, role, groupId
        
        // Globally normalize role to prevent case-sensitivity collisions
        if (req.user && req.user.role) {
            req.user.role = req.user.role.toUpperCase();
        }
        
        // Extract schoolId from headers, query, or body
        const schoolId = req.headers['x-school-id'] || req.query.schoolId || req.body.schoolId;
        req.schoolId = parseInt(schoolId) || (req.user.schoolId ? parseInt(req.user.schoolId) : null);
        
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        const userRole = (req.user.role || '').toUpperCase();
        
        // Super Admins have global override
        if (userRole === 'SUPER_ADMIN') return next();
        
        // Internal standard normalization (Legacy -> Modern)
        const roleAliases = {
            'ADMIN': 'SCHOOL_ADMIN',
            'ACCOUNTANT': 'BURSAR',
            'BURSAR': 'BURSAR',
            'SCHOOL_ADMIN': 'SCHOOL_ADMIN'
        };

        const normalizedUserRole = roleAliases[userRole] || userRole;
        const normalizedRequiredRoles = roles.map(r => {
            const up = r.toUpperCase();
            return roleAliases[up] || up;
        });

        if (!roles.length || normalizedRequiredRoles.includes(normalizedUserRole)) {
            return next();
        }

        console.warn(`[AUTH] Access denied for ${userRole}. Required: ${normalizedRequiredRoles.join(', ')}`);
        res.status(403).json({ error: `Unauthorized: Role mismatch (${userRole})` });
    };
};

module.exports = { authenticate, authorize };
