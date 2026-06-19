const sendPaymentConfirmation = async (data) => {
    console.log('[EMAIL] Payment confirmation email mocked for standalone:', data);
    return true;
};

const sendFeeReminder = async (data) => {
    console.log('[EMAIL] Fee reminder sent to:', data.parentEmail);
    return true;
};

module.exports = { sendPaymentConfirmation, sendFeeReminder };
