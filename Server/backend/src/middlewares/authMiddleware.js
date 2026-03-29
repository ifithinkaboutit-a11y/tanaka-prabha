import jwt from 'jsonwebtoken';

// Dashboard API Key for admin dashboard access
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || 'tanak-prabha-dashboard-secret-key-2024';

if (!process.env.DASHBOARD_API_KEY) {
    console.warn('[authMiddleware] WARNING: DASHBOARD_API_KEY env var is not set. Using hardcoded fallback — set this in production.');
}

/**
 * Check if request has valid dashboard API key
 */
const isDashboardRequest = (req) => {
    const apiKey = req.headers['x-dashboard-api-key'] || req.headers['x-api-key'];
    return apiKey === DASHBOARD_API_KEY;
};

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header OR Dashboard API key
 */
const authMiddleware = (req, res, next) => {
    try {
        // Check for Dashboard API key first (for admin dashboard)
        if (isDashboardRequest(req)) {
            req.user = { 
                id: 'dashboard-admin',
                role: 'admin',
                source: 'dashboard'
            };
            return next();
        }

        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

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
 * Doesn't block request if no token, but adds user info if token exists
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Don't block the request, just proceed without user info
        next();
    }
};

export { authMiddleware, optionalAuth };
