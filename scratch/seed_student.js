const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedStudent() {
  const passwordHash = await bcrypt.hash('Student123!', 10);
  const school = await prisma.school.findFirst();
  
  if (!school) {
    console.log('No school found. Seed multi-tenant first.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      username: 'student001',
      passwordHash,
      role: 'student',
      firstName: 'Hamzah',
      lastName: 'Debtor',
      schoolId: school.id
    }
  });

  await prisma.student.create({
    data: {
      userId: user.id,
      schoolId: school.id,
      admissionNumber: 'ST-2024-001',
      firstName: 'Hamzah',
      lastName: 'Debtor',
      email: 'hamzah@example.com',
      guardianPhone: '+2348000000001',
      expectedTotalFee: 75000,
      status: 'active'
    }
  });

  console.log('✅ Student Hamzah (Debtor) created.');
  console.log('Credentials: student001 / Student123!');
}

seedStudent().finally(() => prisma.$disconnect());
