const prisma = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Checks if the system is fully initialized with at least one school and super admin.
 */
async function getSystemStatus() {
    try {
        const schoolCount = await prisma.school.count();
        const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        
        return {
            isInitialized: schoolCount > 0 && adminCount > 0,
            schoolCount,
            adminCount
        };
    } catch (error) {
        // If tables don't exist yet, it's definitely not initialized
        return {
            isInitialized: false,
            error: error.message
        };
    }
}

/**
 * Initializes a standalone school instance.
 */
async function initializeStandalone(data) {
    const { schoolName, adminUsername, adminPassword, firstName, lastName } = data;

    return await prisma.$transaction(async (tx) => {
        // 1. Create the School
        const school = await tx.school.create({
            data: {
                name: schoolName,
                address: 'Initialized Standalone',
                email: 'admin@local.com'
            }
        });

        // 2. Create the School Group (Logical container)
        const group = await tx.schoolGroup.create({
            data: { name: `${schoolName} Group` }
        });

        // 3. Update school with group
        await tx.school.update({
            where: { id: school.id },
            data: { groupId: group.id }
        });

        // 4. Create the Super Admin (The owner of this standalone instance)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await tx.user.create({
            data: {
                username: adminUsername,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                role: 'SUPER_ADMIN',
                groupId: group.id,
                schoolId: school.id
            }
        });

        return { school, user };
    });
}

module.exports = {
    getSystemStatus,
    initializeStandalone
};
