import crypto from 'crypto';
import axios from 'axios';

/**
 * Generate a 6-digit OTP
 * Uses crypto for secure random number generation
 */
const generateOTP = () => {
    // Generate 6-digit OTP (100000 to 999999)
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
};

/**
 * Generate OTP expiry time (default: 10 minutes)
 */
const generateOTPExpiry = (minutes = 10) => {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
    return expiryTime;
};

/**
 * Check if OTP is expired
 */
const isOTPExpired = (expiryTime) => {
    return new Date() > new Date(expiryTime);
};

/**
 * Send SMS/WhatsApp OTP via MSG91
 */
const sendSMS = async (mobileNumber, otp) => {
    try {
        console.log(`[OTP] 📱 Sending MSG91 WhatsApp OTP to ${mobileNumber}`);

        // In development mode: always log the OTP prominently
        if (process.env.NODE_ENV === 'development') {
            console.log(`[OTP] 🔑 DEV OTP ➜ ${otp} (for ${mobileNumber})`);

            // If MSG91 keys are missing, mock the send and return early
            if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
                console.log(`[OTP] MSG91 keys not set — skipping real SMS send.`);
                return {
                    success: true,
                    message: 'OTP sent successfully (mock)',
                    otp
                };
            }
        }

        const response = await axios.post('https://control.msg91.com/api/v5/otp', {
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: mobileNumber,
            authkey: process.env.MSG91_AUTH_KEY,
            otp: otp
        });

        return {
            success: true,
            message: 'OTP sent successfully',
            data: response.data
        };
    } catch (error) {
        console.error('MSG91 OTP Send Error:', error.response?.data || error.message);
        throw new Error('Failed to send OTP via MSG91');
    }
};

/**
 * Format phone number to standard format
 */
const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If it starts with country code, keep it, otherwise add +91
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }

    return cleaned;
};

/**
 * Validate Indian phone number
 */
const isValidIndianPhone = (phone) => {
    // Indian mobile numbers: 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's 10 digits or 12 digits (with country code 91)
    if (cleaned.length === 10) {
        return phoneRegex.test(cleaned);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return phoneRegex.test(cleaned.substring(2));
    }

    return false;
};

export {
    generateOTP,
    generateOTPExpiry,
    isOTPExpired,
    sendSMS,
    formatPhoneNumber,
    isValidIndianPhone
};
