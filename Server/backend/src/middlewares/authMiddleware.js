import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY;

if (!DASHBOARD_API_KEY) {
    console.warn('[authMiddleware] WARNING: DASHBOARD_API_KEY env var is not set. Dashboard API key auth will be unavailable.');
}

/**
 * Authentication middleware to protect routes
 * Supports:
 *   1. x-dashboard-api-key header (for dashboard backend requests)
 *   2. Bearer JWT token in Authorization header (for mobile app users)
 */
const authMiddleware = (req, res, next) => {
    try {
        // 1. Check dashboard API key first
        const apiKey = req.headers['x-dashboard-api-key'];
        if (apiKey) {
            if (DASHBOARD_API_KEY && apiKey === DASHBOARD_API_KEY) {
                req.user = { role: 'dashboard', userId: null, mobile_number: null };
                return next();
            }
            return res.status(401).json({
                status: 'error',
                message: 'Invalid API key.'
            });
        }

        // 2. Fall back to JWT Bearer token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user info to request object
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token. Please login again.'
            });
        }

        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Optional authentication middleware
 * Doesn't block request if no auth, but adds user info if credentials exist
 */
const optionalAuth = (req, res, next) => {
    try {
        // 1. Check dashboard API key
        const apiKey = req.headers['x-dashboard-api-key'];
        if (apiKey && DASHBOARD_API_KEY && apiKey === DASHBOARD_API_KEY) {
            req.user = { role: 'dashboard', userId: null, mobile_number: null };
            return next();
        }

        // 2. Check Bearer JWT token
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Don't block the request, just proceed without user info
        next();
    }
};

export { authMiddleware, optionalAuth };
