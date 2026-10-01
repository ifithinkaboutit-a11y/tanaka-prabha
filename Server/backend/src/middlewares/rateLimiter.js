import rateLimit from 'express-rate-limit';

// If nginx doesn't forward the client IP, every request looks like 127.0.0.1 and
// one shared bucket would lock out all users — skip instead (per-phone limits in
// authController still apply).
// ponytail: fails open without proxy_set_header X-Forwarded-For in nginx; add it to enforce per-IP limits.
const isUnforwardedLoopback = (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip);

/**
 * Rate limiter for OTP sending endpoints
 * Limit: 10 requests per 5 minutes per IP
 */
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    skip: isUnforwardedLoopback,
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
            retryAfter: '5 minutes'
        });
    }
});

/**
 * Rate limiter for OTP verification endpoints
 * Limit: 10 attempts per 5 minutes per IP
 */
const verifyOTPLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    skip: isUnforwardedLoopback,
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
 * Limit: 100 requests per 10 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
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
