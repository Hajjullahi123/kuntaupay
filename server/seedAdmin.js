const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('--- Initializing Administrative Node ---');
  
  try {
    const admin = await prisma.user.upsert({
      where: { username },
      update: {
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        firstName: 'System',
        lastName: 'Administrator'
      },
      create: {
        username,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        firstName: 'System',
        lastName: 'Administrator'
      },
    });

    console.log('✅ Admin User created/updated successfully:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n--- Node Configuration Complete ---');
  } catch (error) {
    console.error('❌ Error during administrative initialization:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
