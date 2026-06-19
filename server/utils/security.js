const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY || 'finschool_elite_secure_salt_2026';

/**
 * Generates a unique, deterministic fingerprint for a financial record.
 * @param {Object} data - The data to sign (e.g., amount, date, ID).
 * @returns {string} - A short, uppercase alphanumeric signature.
 */
const generateFingerprint = (data) => {
    const payload = JSON.stringify(data) + SECRET_KEY;
    const fullHash = crypto.createHash('sha256').update(payload).digest('hex');
    // We'll use the first 12 characters for a convenient "Security ID"
    return fullHash.substring(0, 12).toUpperCase();
};

module.exports = { generateFingerprint };
