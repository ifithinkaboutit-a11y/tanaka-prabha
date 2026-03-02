import rateLimit from 'express-rate-limit';

// ⚠️  TESTING MODE — Rate limiting is effectively disabled.
// TODO: Restore original limits before deploying to production.

/**
 * Rate limiter for OTP sending endpoints
 * [TESTING] Limit raised to 10,000 requests per minute
 */
const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10000, // effectively disabled for testing
    message: {
        status: 'error',
        message: 'Too many OTP requests from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many OTP requests from this IP. Please try again after 15 minutes.',
            retryAfter: '5 minutes'
        });
    }
});

/**
 * Rate limiter for OTP verification endpoints
 * [TESTING] Limit raised to 10,000 attempts per minute
 */
const verifyOTPLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10000, // effectively disabled for testing
    message: {
        status: 'error',
        message: 'Too many verification attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many verification attempts from this IP. Please try again after 15 minutes.',
            retryAfter: '15 minutes'
        });
    }
});

/**
 * General API rate limiter
 * [TESTING] Limit raised to 10,000 requests per minute
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10000, // effectively disabled for testing
    message: {
        status: 'error',
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for sensitive operations
 * [TESTING] Limit raised to 10,000 requests per minute
 */
const strictLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10000, // effectively disabled for testing
    message: {
        status: 'error',
        message: 'Too many requests. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export {
    otpLimiter,
    verifyOTPLimiter,
    apiLimiter,
    strictLimiter
};

