const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user.update({
            where: { username: 'topuser' },
            data: {
                firstName: 'Super',
                lastName: 'Admin'
            }
        });
        console.log('User names updated to Super Admin.');
    } catch (e) {
        console.error(e);
    }
}
main();
