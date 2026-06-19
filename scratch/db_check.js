require('dotenv').config({ path: 'server/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- DATABASE DIAGNOSTIC START ---');
    try {
        console.log('1. Checking school count...');
        const schoolCount = await prisma.school.count();
        console.log(`- Total schools: ${schoolCount}`);

        console.log('2. Checking for active sessions/terms...');
        const activePeriods = await prisma.academicSession.findMany({
            where: { isCurrent: true },
            include: { terms: { where: { isCurrent: true } } }
        });
        console.log(`- Found ${activePeriods.length} active sessions.`);
        activePeriods.forEach(ap => {
            console.log(`  * Session: ${ap.name} (ID: ${ap.id}) - Terms: ${ap.terms.map(t => t.name).join(', ')}`);
        });

        console.log('3. Checking raw summary logic...');
        // Simplified version of the summary query
        const school = await prisma.school.findFirst();
        if (school) {
            console.log(`- Using school: ${school.name} (ID: ${school.id})`);
            const students = await prisma.student.count({ where: { schoolId: school.id, status: 'active' } });
            console.log(`- Student count: ${students}`);
        }

    } catch (err) {
        console.error('!!! DATABASE ERROR !!!');
        console.error(err);
    } finally {
        await prisma.$disconnect();
        console.log('--- DIAGNOSTIC COMPLETE ---');
    }
}

check();
