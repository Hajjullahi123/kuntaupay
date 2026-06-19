const prisma = require('../db');

/**
 * Calculates a student's outstanding balance from previous terms/sessions.
 * This is the total debt brought forward.
 */
const calculatePreviousOutstanding = async (schoolId, studentId, academicSessionId, termId) => {
    try {
        const schoolIdInt = parseInt(schoolId);
        const studentIdInt = parseInt(studentId);

        // Fetch all previous fee records for this student
        // We look for records that are older than the current session/term
        const previousRecords = await prisma.feeRecord.findMany({
            where: {
                schoolId: schoolIdInt,
                studentId: studentIdInt,
                OR: [
                    { academicSessionId: { lt: parseInt(academicSessionId) } },
                    { 
                        academicSessionId: parseInt(academicSessionId),
                        termId: { lt: parseInt(termId) } 
                    }
                ]
            }
        });

        // Sum up all balances
        const totalArrears = previousRecords.reduce((sum, record) => sum + (record.balance || 0), 0);
        return totalArrears;
    } catch (error) {
        console.error('Error calculating arrears:', error);
        return 0;
    }
};

/**
 * Creates or updates a fee record with the current opening balance from previous terms.
 */
const createOrUpdateFeeRecordWithOpening = async (data) => {
    const { schoolId, studentId, termId, academicSessionId, expectedAmount, paidAmount } = data;

    const openingBalance = await calculatePreviousOutstanding(schoolId, studentId, academicSessionId, termId);
    const balance = (openingBalance + expectedAmount) - (paidAmount || 0);

    const recordData = {
        schoolId: parseInt(schoolId),
        studentId: parseInt(studentId),
        termId: parseInt(termId),
        academicSessionId: parseInt(academicSessionId),
        openingBalance,
        expectedAmount: parseFloat(expectedAmount),
        paidAmount: parseFloat(paidAmount || 0),
        balance: parseFloat(balance),
        isClearedForExam: balance <= 0
    };

    return await prisma.feeRecord.upsert({
        where: {
            schoolId_studentId_termId_academicSessionId: {
                schoolId: parseInt(schoolId),
                studentId: parseInt(studentId),
                termId: parseInt(termId),
                academicSessionId: parseInt(academicSessionId)
            }
        },
        update: {
            openingBalance,
            expectedAmount: parseFloat(expectedAmount),
            paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : undefined,
            balance: parseFloat(balance),
            isClearedForExam: balance <= 0
        },
        create: recordData
    });
};

/**
 * Gets a full summary of a student's financial status for a specific term.
 */
const getStudentFeeSummary = async (schoolId, studentId, academicSessionId, termId) => {
    try {
        const feeRecord = await prisma.feeRecord.findUnique({
            where: {
                schoolId_studentId_termId_academicSessionId: {
                    schoolId: parseInt(schoolId),
                    studentId: parseInt(studentId),
                    termId: parseInt(termId),
                    academicSessionId: parseInt(academicSessionId)
                }
            },
            include: {
                payments: {
                    orderBy: { paymentDate: 'desc' }
                }
            }
        });

        if (!feeRecord) {
            const arrears = await calculatePreviousOutstanding(schoolId, studentId, academicSessionId, termId);
            return {
                id: null,
                openingBalance: arrears,
                expectedAmount: 0,
                paidAmount: 0,
                balance: arrears,
                payments: []
            };
        }

        return feeRecord;
    } catch (error) {
        console.error('Error fetching fee summary:', error);
        return null;
    }
};

module.exports = {
    calculatePreviousOutstanding,
    createOrUpdateFeeRecordWithOpening,
    getStudentFeeSummary
};
