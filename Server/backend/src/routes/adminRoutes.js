import express from 'express';
export const router = express.Router();

import { createAdmin, loginAdmin } from '../controllers/adminController.js';

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

export default router;
