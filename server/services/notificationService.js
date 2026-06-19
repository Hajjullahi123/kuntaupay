const prisma = require('../db');

/**
 * Universal Communication Service
 * Abstraction layer for SMS, WhatsApp, and Email.
 */
const sendNotification = async ({ schoolId, recipient, body, type }) => {
    try {
        console.log(`[COMMUNICATION HUB] Preparing ${type} for ${recipient}...`);
        
        let status = 'SENT';
        
        // INTERFACE HOOKS: Place your Twilio/Infobip/MessageBird API calls here
        // if (process.env.TWILIO_SID) { ... }
        
        // SIMULATION MODE: Defaulting to local logging for standalone reliability
        console.log(`[SIMULATED ${type}] To: ${recipient} | Body: ${body}`);

        // PERSISTENCE: Every message is logged for audit and transparency
        const log = await prisma.notification.create({
            data: {
                schoolId,
                recipient,
                body,
                type,
                status
            }
        });

        return { success: true, log };
    } catch (error) {
        console.error(`[COMMUNICATION ERROR]`, error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendNotification };
