// Kuntau-Pay Automated Notification Engine
// This module handles the automated dispatch of digital invoices and receipts.

async function sendInvoice(student, payment) {
    if (!student.email) {
        console.log(`⚠️ [INVOICE] Student ${student.firstName} has no email endpoint. Skipping digital dispatch.`);
        return;
    }

    // This is where you would integrate Nodemailer or SendGrid
    // and use your institutional SMTP settings.
    
    console.log(`--- 📧 DIGITAL INVOICE GENERATED ---`);
    console.log(`To: ${student.email}`);
    console.log(`Subject: Official Receipt from Kuntau-Pay - ${payment.reference || 'Auto'}`);
    console.log(`Body: 
        Dear Guardian,
        A payment of ₦${payment.amount.toLocaleString()} has been successfully 
        received for ${student.firstName} ${student.lastName} (Adm: ${student.admissionNumber}).
        
        Category: ${payment.feeType}
        Date: ${new Date(payment.paymentDate).toLocaleString()}
        Reference: ${payment.reference || 'KUNTAU-' + payment.id}
        
        Institutional Node: Kuntau Global Academy
        Verified by: Financial Cloud Protocol
    `);
    console.log(`--- END OF DISPATCH ---`);
    
    return true;
}

async function sendSmsNotification(student, payment) {
    if (!student.guardianPhone) return;
    
    console.log(`📡 [SMS] Alert dispatched to ${student.guardianPhone}: "Kuntau-Pay: Confirmed Receipt of ₦${payment.amount} for ${student.firstName}. Thanks."`);
}

async function sendDebtReminder(student, balance) {
    if (student.email) {
        console.log(`--- 📧 DEBT REMINDER DISPATCHED ---`);
        console.log(`To: ${student.email}`);
        console.log(`Subject: [URGENT] Outstanding Institutional Balance - ${student.firstName} ${student.lastName}`);
        console.log(`Body: 
            Attention Guardian,
            Our financial records indicate an outstanding balance of ₦${balance.toLocaleString()} 
            for ${student.firstName} (Adm: ${student.admissionNumber}).
            
            Please note that academic result terminals will remain LOCKED until 
            the institutional flux is resolved.
            
            Access Payment Portal: ${process.env.PORTAL_URL || 'http://localhost:5173'}/login
        `);
        console.log(`--- END OF ALERT ---`);
    }

    if (student.guardianPhone) {
        console.log(`📡 [SMS] Debt Alert to ${student.guardianPhone}: "KUNTAU ALERT: Student ${student.firstName} has an unpaid balance of ₦${balance}. Results/Transcripts are currently LOCKED. Please settle immediately."`);
    }
}

module.exports = { sendInvoice, sendSmsNotification, sendDebtReminder };
