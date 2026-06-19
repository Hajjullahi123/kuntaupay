const sendPaymentSMS = async (data) => {
    console.log('[SMS] Payment SMS confirmation mocked for standalone:', data);
    return true;
};

module.exports = { sendPaymentSMS };
