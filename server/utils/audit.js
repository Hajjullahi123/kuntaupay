const prisma = require('../db');

const logAction = async (data) => {
    try {
        const { schoolId, userId, action, resource, details, ipAddress } = data;

        await prisma.auditLog.create({
            data: {
                schoolId: parseInt(schoolId),
                userId: userId ? parseInt(userId) : null,
                action,
                resource,
                details: details ? JSON.stringify(details) : null,
            }
        });
    } catch (err) {
        console.error('[AUDIT] Log failed:', err.message);
    }
};

module.exports = { logAction };
