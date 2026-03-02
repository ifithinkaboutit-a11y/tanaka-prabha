import jwt from 'jsonwebtoken';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendSMS, formatPhoneNumber, isValidIndianPhone } from '../utils/otp.js';

/**
 * Generate JWT token
 */
const generateToken = (userId, mobile_number) => {
    return jwt.sign(
        { userId, mobile_number },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Send OTP to mobile number
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { mobile_number } = req.body;

        // Validate phone number format
        if (!isValidIndianPhone(mobile_number)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.'
            });
        }

        // Format phone number
        const formattedNumber = formatPhoneNumber(mobile_number);

        // [TESTING] DB-level OTP rate limit disabled — up to 100 OTPs/min allowed.
        // TODO: Restore before production.
        // const recentAttempts = await OTP.getRecentAttempts(formattedNumber, 5);
        // if (recentAttempts >= 10) {
        //     return res.status(429).json({
        //         status: 'error',
        //         message: 'Too many OTP requests. Please try again after 5 minutes.'
        //     });
        // }

        // Generate and store OTP
        const otpRecord = await OTP.createOTP(formattedNumber);

        // Send SMS (mock in development) — run in background so SMTP/email issues don't block the response
        sendSMS(formattedNumber, otpRecord.otp).catch(() => { });

        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully',
            data: {
                mobile_number: formattedNumber,
                expires_in: '10 minutes',
                // Only include OTP in development mode for testing
                ...(process.env.NODE_ENV === 'development' && { otp: otpRecord.otp })
            }
        });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send OTP. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Verify OTP and authenticate user
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;

        // Validate inputs
        if (!mobile_number || !otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Mobile number and OTP are required'
            });
        }

        // Format phone number
        const formattedNumber = formatPhoneNumber(mobile_number);

        // Verify OTP
        const verification = await OTP.verifyOTP(formattedNumber, otp);

        if (!verification.valid) {
            return res.status(401).json({
                status: 'error',
                message: verification.message,
                authenticated: false
            });
        }

        // Check if user exists, if not create new user
        let user = await User.findByMobile(formattedNumber);
        let isNewUser = false;

        if (!user) {
            // Brand new account — create with placeholder name
            try {
                user = await User.create({
                    name: 'New User', // Placeholder; updated during onboarding
                    mobile_number: formattedNumber
                });
                isNewUser = true;
            } catch (createError) {
                // If a race condition caused a duplicate key error (PostgreSQL code 23505),
                // another request just created this user. Let's fetch them instead.
                if (createError.code === '23505') {
                    console.warn(`[authController] Caught race condition for ${formattedNumber}. User already exists.`);
                    user = await User.findByMobile(formattedNumber);
                    if (!user) {
                        throw new Error("User creation failed due to conflict, but user could not be found afterwards.");
                    }
                    isNewUser = (user.name === 'New User');
                } else {
                    throw createError;
                }
            }
        } else {
            // Existing account. Only treat as new if they never completed onboarding.
            // 'New User' is the placeholder set at creation time — if it's still that,
            // they never finished. Do NOT use missing state/district as the signal
            // because many users may have partial profiles.
            isNewUser = (user.name === 'New User');
        }

        // Generate JWT token
        const token = generateToken(user.id, formattedNumber);

        // Delete used OTP
        await OTP.deleteOTP(formattedNumber);

        res.status(200).json({
            status: 'success',
            message: 'Authentication successful',
            authenticated: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    mobile_number: user.mobile_number,
                    age: user.age,
                    gender: user.gender,
                    photo_url: user.photo_url,
                    fathers_name: user.fathers_name,
                    mothers_name: user.mothers_name,
                    educational_qualification: user.educational_qualification,
                    village: user.village,
                    gram_panchayat: user.gram_panchayat,
                    block: user.block,
                    tehsil: user.tehsil,
                    district: user.district,
                    pin_code: user.pin_code,
                    state: user.state,
                },
                is_new_user: isNewUser,
                token,
                token_type: 'Bearer'
            }
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify OTP. Please try again.',
            authenticated: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res) => {
    try {
        const { mobile_number } = req.body;

        // Validate phone number
        if (!isValidIndianPhone(mobile_number)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number'
            });
        }

        const formattedNumber = formatPhoneNumber(mobile_number);

        // [TESTING] 2-minute cooldown and DB-level rate limit disabled.
        // TODO: Restore before production.
        // const existingOTP = await OTP.getOTP(formattedNumber);
        // if (existingOTP) {
        //     const timeSinceLastOTP = (Date.now() - new Date(existingOTP.created_at).getTime()) / 1000;
        //     if (timeSinceLastOTP < 120) {
        //         return res.status(429).json({
        //             status: 'error',
        //             message: `Please wait ${Math.ceil(120 - timeSinceLastOTP)} seconds before requesting a new OTP`
        //         });
        //     }
        // }
        // const recentAttempts = await OTP.getRecentAttempts(formattedNumber, 5);
        // if (recentAttempts >= 10) {
        //     return res.status(429).json({
        //         status: 'error',
        //         message: 'Too many OTP requests. Please try again after 5 minutes.'
        //     });
        // }

        // Generate and send new OTP
        const otpRecord = await OTP.createOTP(formattedNumber);
        // Fire-and-forget send — do not block on SMTP/email
        sendSMS(formattedNumber, otpRecord.otp).catch(() => { });

        res.status(200).json({
            status: 'success',
            message: 'OTP resent successfully',
            data: {
                mobile_number: formattedNumber,
                expires_in: '10 minutes',
                ...(process.env.NODE_ENV === 'development' && { otp: otpRecord.otp })
            }
        });

    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to resend OTP',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Verify JWT token (for protected routes)
 * GET /api/auth/verify-token
 */
export const verifyToken = async (req, res) => {
    try {
        // Token is already verified by authMiddleware
        // Just return user info
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Only treat as new user if they never completed onboarding (placeholder name still set)
        const isNewUser = (user.name === 'New User');

        res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    mobile_number: user.mobile_number,
                    age: user.age,
                    gender: user.gender,
                    photo_url: user.photo_url,
                    fathers_name: user.fathers_name,
                    mothers_name: user.mothers_name,
                    educational_qualification: user.educational_qualification,
                    village: user.village,
                    gram_panchayat: user.gram_panchayat,
                    block: user.block,
                    tehsil: user.tehsil,
                    district: user.district,
                    pin_code: user.pin_code,
                    state: user.state,
                },
                is_new_user: isNewUser
            }
        });

    } catch (error) {
        console.error('Verify Token Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
