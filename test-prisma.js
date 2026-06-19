const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection...');
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
  } catch (e) {
    console.error('Error connecting to Prisma:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
