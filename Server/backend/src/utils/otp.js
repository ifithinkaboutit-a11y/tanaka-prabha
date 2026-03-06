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
 * Send WhatsApp OTP via MSG91 WhatsApp Outbound Message Bulk API
 *
 * Template: tanak_prabha_otp
 *   - body_1  → the 6-digit OTP shown in the message body
 *   - button_1 → the copy-code URL button variable (same OTP value)
 */
const sendSMS = async (mobileNumber, otp, language = 'en') => {
    try {
        console.log(`[OTP] 📱 Sending MSG91 WhatsApp OTP to ${mobileNumber}`);

        // In development mode: always log the OTP prominently
        if (process.env.NODE_ENV === 'development') {
            console.log(`[OTP] 🔑 DEV OTP ➜ ${otp} (for ${mobileNumber})`);

            // If MSG91 keys are missing, mock the send and return early
            if (!process.env.MSG91_AUTH_KEY) {
                console.log(`[OTP] MSG91_AUTH_KEY not set — skipping real WhatsApp send (mock mode).`);
                return {
                    success: true,
                    message: 'OTP sent successfully (mock)',
                    otp
                };
            }
        }

        // Ensure the number has the 91 country-code prefix (no '+')
        const wa_number = mobileNumber.startsWith('91') ? mobileNumber : `91${mobileNumber}`;

        const payload = {
            integrated_number: process.env.MSG91_INTEGRATED_NUMBER || '918887365002',
            content_type: 'template',
            payload: {
                messaging_product: 'whatsapp',
                type: 'template',
                template: {
                    name: 'tanak_prabha_otp',
                    language: {
                        code: language,   // 'en' or 'hi' based on user's app language
                        policy: 'deterministic'
                    },
                    namespace: '3d70d0bd_fd9c_4c0a_a8b1_507056ef9ec9',
                    to_and_components: [
                        {
                            to: [wa_number],
                            components: {
                                body_1: {
                                    type: 'text',
                                    value: otp          // 6-digit OTP shown in the message body
                                },
                                button_1: {
                                    subtype: 'url',
                                    type: 'text',
                                    value: otp          // copy-code button URL variable
                                }
                            }
                        }
                    ]
                }
            }
        };

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': process.env.MSG91_AUTH_KEY
                }
            }
        );

        console.log(`[OTP] ✅ MSG91 WhatsApp response:`, response.data);

        return {
            success: true,
            message: 'OTP sent successfully via WhatsApp',
            data: response.data
        };
    } catch (error) {
        console.error('[OTP] MSG91 WhatsApp Send Error:', error.response?.data || error.message);
        throw new Error('Failed to send OTP via MSG91 WhatsApp');
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
