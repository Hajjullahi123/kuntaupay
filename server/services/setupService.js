const prisma = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Checks if the system is fully initialized with at least one school and super admin.
 */
async function getSystemStatus() {
    try {
        let schoolCount = await prisma.school.count();
        let adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        
        if (schoolCount === 0 || adminCount === 0) {
            console.log('[SYSTEM INIT] Auto-initializing system with Kuntau Science Academy and default admin...');
            await initializeStandalone({
                schoolName: 'Kuntau Science Academy',
                adminUsername: 'top-official',
                adminPassword: 'top-off26',
                firstName: 'Super',
                lastName: 'Admin'
            });
            schoolCount = 1;
            adminCount = 1;
        }
        
        return {
            isInitialized: true,
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

        // 5. Create default School Admin
        const schoolAdminPasswordHash = await bcrypt.hash('kuntau-adm26', 10);
        await tx.user.create({
            data: {
                username: 'kuntau-admin',
                passwordHash: schoolAdminPasswordHash,
                firstName: 'School',
                lastName: 'Admin',
                role: 'SCHOOL_ADMIN',
                groupId: group.id,
                schoolId: school.id
            }
        });

        // 6. Create default Bursar
        const bursarPasswordHash = await bcrypt.hash('kuntau-bur26', 10);
        await tx.user.create({
            data: {
                username: 'kuntau-bursar',
                passwordHash: bursarPasswordHash,
                firstName: 'School',
                lastName: 'Bursar',
                role: 'BURSAR',
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
