import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for OTP sending endpoints
 * Limit: 3 requests per 15 minutes per IP
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many OTP requests from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many OTP requests from this IP. Please try again after 15 minutes.',
            retryAfter: '15 minutes'
        });
    }
});

/**
 * Rate limiter for OTP verification endpoints
 * Limit: 5 attempts per 15 minutes per IP
 */
const verifyOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 verification attempts per windowMs
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
 * Limit: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Strict rate limiter for sensitive operations
 * Limit: 10 requests per hour
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
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
