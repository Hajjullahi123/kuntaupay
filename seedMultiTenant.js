const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  // 1. Create Default School
  const school = await prisma.school.upsert({
    where: { name: 'Kuntau Global Academy' },
    update: {},
    create: {
      name: 'Kuntau Global Academy',
      location: 'Central Branch'
    }
  });

  // 2. Create School Admin
  await prisma.user.upsert({
    where: { username: 'sadmin_kuntau' },
    update: {},
    create: {
      username: 'sadmin_kuntau',
      passwordHash,
      role: 'SCHOOL_ADMIN',
      firstName: 'Kuntau',
      lastName: 'Admin',
      schoolId: school.id
    }
  });

  // 3. Create Bursar
  await prisma.user.upsert({
    where: { username: 'bursar_kuntau' },
    update: {},
    create: {
      username: 'bursar_kuntau',
      passwordHash,
      role: 'BURSAR',
      firstName: 'Aliko',
      lastName: 'Bursar',
      schoolId: school.id
    }
  });

  console.log('✅ Multi-tenant environment initialized.');
  console.log('--- Credentials ---');
  console.log('School: ', school.name);
  console.log('Admin: sadmin_kuntau / Password123!');
  console.log('Bursar: bursar_kuntau / Password123!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
