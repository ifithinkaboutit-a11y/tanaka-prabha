import express from 'express';
import jwt from 'jsonwebtoken';
export const router = express.Router();

import { createAdmin, loginAdmin, changePassword, updateProfile, getAllAdmins, updateAdmin, setAdminStatus } from '../controllers/adminController.js';
import { getAllAppointmentsAdmin } from '../controllers/appointmentController.js';

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
        if (!process.env.JWT_SECRET) {
            console.error('[adminAuth] CRITICAL: JWT_SECRET not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = { id: decoded.id, email: decoded.email };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * @route   POST /api/admin/setup
 * @desc    Create a single admin user
 * @access  Disabled in production — only available when ADMIN_SETUP_ENABLED=true
 */
router.post('/setup', (req, res, next) => {
    if (process.env.ADMIN_SETUP_ENABLED !== 'true') {
        return res.status(403).json({ error: 'Admin setup is disabled in production' });
    }
    next();
}, createAdmin);

/**
 * @route   POST /api/admin/login
 * @desc    Login admin user
 * @access  Public
 */
router.post('/login', loginAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    List all admin users
 * @access  Protected (admin JWT)
 */
router.get('/users', adminAuth, getAllAdmins);

/**
 * @route   POST /api/admin/users
 * @desc    Create a new admin user with role
 * @access  Protected (admin JWT)
 */
router.post('/users', adminAuth, createAdmin);

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update admin user (name, email, role)
 * @access  Protected (admin JWT)
 */
router.patch('/users/:id', adminAuth, updateAdmin);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Activate or deactivate an admin user
 * @access  Protected (admin JWT)
 */
router.patch('/users/:id/status', adminAuth, setAdminStatus);

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

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments with farmer and professional names (admin view)
 * @access  Protected (admin JWT)
 */
router.get('/appointments', adminAuth, getAllAppointmentsAdmin);

export default router;
