import express from 'express';
const router = express.Router();
import { sendOTP, verifyOTP, resendOTP, verifyToken } from '../controllers/authController.js';
import { otpLimiter, verifyOTPLimiter } from '../middlewares/rateLimiter.js';
import { validateSendOTP, validateVerifyOTP } from '../middlewares/validator.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to mobile number
 * @access  Public
 */
router.post('/send-otp', otpLimiter, validateSendOTP, sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and authenticate user
 * @access  Public
 */
router.post('/verify-otp', verifyOTPLimiter, validateVerifyOTP, verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to mobile number
 * @access  Public
 */
router.post('/resend-otp', otpLimiter, validateSendOTP, resendOTP);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify JWT token and get user info
 * @access  Protected
 */
router.get('/verify-token', authMiddleware, verifyToken);

export default router;
