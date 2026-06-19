const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user.deleteMany({ where: { username: 'ibrahim' } });
        console.log('Old user ibrahim removed.');
        
        await require('./prisma/seed.js');
    } catch (e) {
        console.error(e);
    }
}
main();
