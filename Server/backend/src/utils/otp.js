import crypto from 'crypto';
import { sendOTPEmail, initializeTransporter } from './emailService.js';

// Initialize email transporter when module loads
initializeTransporter().catch(err => {
    console.warn('⚠️ Email service initialization failed:', err.message);
});

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
 * Mock SMS sending function (MSG91 integration placeholder)
 * In production, replace with actual MSG91 API call
 * Also sends email via Ethereal for development testing
 */
const sendSMS = async (mobileNumber, otp) => {
    // TODO: Implement MSG91 integration
    // For now, just log to console for testing
    console.log(`📱 SMS to ${mobileNumber}: Your OTP is ${otp}. Valid for 10 minutes.`);
    
    // Send email via Ethereal for development testing (fire-and-forget)
    // Do NOT await here — an SMTP timeout must not delay the OTP HTTP response.
    sendOTPEmail(mobileNumber, otp)
      .then((emailResult) => {
        if (emailResult?.success) {
          console.log(`📧 Email sent! Preview URL: ${emailResult.previewUrl}`);
        }
      })
      .catch((emailError) => {
        console.warn('⚠️ Email sending failed (async):', emailError.message);
      });
    
    // In production, use MSG91:
    /*
    const axios = require('axios');
    const response = await axios.post('https://api.msg91.com/api/v5/otp', {
        authkey: process.env.MSG91_AUTH_KEY,
        mobile: mobileNumber,
        otp: otp,
        template_id: process.env.MSG91_TEMPLATE_ID
    });
    return response.data;
    */
    
    return {
        success: true,
        message: 'OTP sent successfully (mock)',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only return OTP in dev mode
        emailPreviewUrl: emailResult?.previewUrl || null
    };
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
