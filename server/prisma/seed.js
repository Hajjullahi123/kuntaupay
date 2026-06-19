const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('topuser2026', 10);
  const studentHash = await bcrypt.hash('dummy', 10);
  console.log('Seeding standalone school database...');

  // 0. Create a School Group
  const group = await prisma.schoolGroup.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Excellence Global Schools',
    },
  });

  // 1. Create Schools (Branches)
  const school = await prisma.school.upsert({
    where: { id: 1 },
    update: { groupId: 1 },
    create: {
      id: 1,
      groupId: 1,
      name: 'Excellence Academy Standalone',
      address: '123 Standalone St, Tech City',
      phone: '0800-FIN-Standalone',
      email: 'admin@excellence.standalone',
    },
  });

  const branch2 = await prisma.school.upsert({
    where: { id: 2 },
    update: { groupId: 1 },
    create: {
      id: 2,
      groupId: 1,
      name: 'Excellence Academy - Branch 2',
      address: '456 Branch Ave, New Port',
      phone: '0800-FIN-BRANCH2',
      email: 'branch2@excellence.standalone',
    },
  });

  // 2. Create Users (Admin & Accountant)
  const adminUser = await prisma.user.upsert({
    where: { username: 'topuser' },
    update: {
        role: 'SUPER_ADMIN',
        passwordHash: adminHash,
        groupId: 1
    },
    create: {
      schoolId: 1,
      groupId: 1,
      username: 'topuser',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      firstName: 'Ahmad',
      lastName: 'Ibrahim',
    },
  });

  // 3. Create Academic Session & Term
  const session = await prisma.academicSession.upsert({
    where: { id: 1 },
    update: { isCurrent: true },
    create: {
      id: 1,
      schoolId: 1,
      name: '2023/2024',
      isCurrent: true,
    },
  });

  const term = await prisma.term.upsert({
    where: { id: 1 },
    update: { isCurrent: true },
    create: {
      id: 1,
      schoolId: 1,
      academicSessionId: 1,
      name: '2nd Term',
      isCurrent: true,
    },
  });

  // 4. Create Classes
  const classes = [
    { id: 1, name: 'JSS 1', arm: 'A' },
    { id: 2, name: 'JSS 1', arm: 'B' },
    { id: 3, name: 'JSS 2', arm: 'A' },
    { id: 4, name: 'SS 3', arm: 'A' },
  ];

  for (const c of classes) {
    await prisma.class.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, schoolId: 1 },
    });

    // Create fee structure for each class
    await prisma.classFeeStructure.upsert({
        where: {
            schoolId_classId_termId_academicSessionId: {
                schoolId: 1,
                classId: c.id,
                termId: 1,
                academicSessionId: 1
            }
        },
        update: {},
        create: {
            schoolId: 1,
            classId: c.id,
            termId: 1,
            academicSessionId: 1,
            amount: c.name.startsWith('SS') ? 120000 : 80000
        }
    })
  }

  // 5. Create Students
  const students = [
    { id: 1, firstName: 'Adams', lastName: 'Suleiman', admissionNumber: 'ADM001', classId: 3 },
    { id: 2, firstName: 'Blessing', lastName: 'Okafor', admissionNumber: 'ADM002', classId: 4 },
    { id: 3, firstName: 'Musa', lastName: 'Yusuf', admissionNumber: 'ADM003', classId: 1 },
    { id: 4, firstName: 'Victor', lastName: 'Chidi', admissionNumber: 'ADM004', classId: 2 },
    { id: 5, firstName: 'Fatima', lastName: 'Ahmed', admissionNumber: 'ADM005', classId: 4, isScholarship: true },
  ];

  for (const s of students) {
    const user = await prisma.user.upsert({
        where: { username: s.admissionNumber.toLowerCase() }, 
        update: {
            username: s.admissionNumber.toLowerCase(),
            passwordHash: studentHash,
            firstName: s.firstName,
            lastName: s.lastName
        },
        create: {
            schoolId: 1,
            username: s.admissionNumber.toLowerCase(),
            passwordHash: studentHash,
            role: 'student',
            firstName: s.firstName,
            lastName: s.lastName
        }
    })

    await prisma.student.upsert({
      where: { id: s.id },
      update: {
        classId: s.classId,
        isScholarship: s.isScholarship || false,
      },
      create: {
        id: s.id,
        schoolId: 1,
        userId: user.id,
        firstName: s.firstName,
        lastName: s.lastName,
        admissionNumber: s.admissionNumber,
        classId: s.classId,
        isScholarship: s.isScholarship || false,
      },
    });

    // Initial fee record for non-scholarship students
    if (!s.isScholarship) {
        await prisma.feeRecord.upsert({
            where: {
                schoolId_studentId_termId_academicSessionId: {
                    schoolId: 1,
                    studentId: s.id,
                    termId: 1,
                    academicSessionId: 1
                }
            },
            update: {},
            create: {
                schoolId: 1,
                studentId: s.id,
                termId: 1,
                academicSessionId: 1,
                expectedAmount: s.classId === 4 ? 120000 : 80000,
                paidAmount: s.id === 1 ? 45000 : 0,
                balance: s.id === 1 ? (80000 - 45000) : (s.classId === 4 ? 120000 : 80000),
                isClearedForExam: false
            }
        })
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
