import express from 'express';
import jwt from 'jsonwebtoken';
export const router = express.Router();

import { createAdmin, loginAdmin, changePassword, updateProfile } from '../controllers/adminController.js';

/**
 * Admin auth middleware — extracts admin identity from JWT token
 */
const adminAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized — token required' });
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.admin = { id: decoded.id, email: decoded.email };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * @route   POST /api/admin/setup
 * @desc    Create a single admin user
 * @access  Public (should be protected or disabled in production after setup)
 */
router.post('/setup', createAdmin);

/**
 * @route   POST /api/admin/login
 * @desc    Login admin user
 * @access  Public
 */
router.post('/login', loginAdmin);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password (requires current password)
 * @access  Protected (admin JWT)
 */
router.put('/change-password', adminAuth, changePassword);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile (email)
 * @access  Protected (admin JWT)
 */
router.put('/profile', adminAuth, updateProfile);

export default router;
