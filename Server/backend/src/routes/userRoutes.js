import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByLocation,
    getUserCountByDistrict,
    getCurrentUserProfile,
    updateCurrentUserProfile
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Protected
 */
router.get('/profile', authMiddleware, getCurrentUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Protected
 */
router.put('/profile', authMiddleware, updateCurrentUserProfile);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and search
 * @access  Protected
 */
router.get('/', authMiddleware, getAllUsers);

/**
 * @route   GET /api/users/locations
 * @desc    Get users by location bounds (for heatmap)
 * @access  Protected
 */
router.get('/locations', authMiddleware, getUsersByLocation);

/**
 * @route   GET /api/users/districts
 * @desc    Get user count by district
 * @access  Protected
 */
router.get('/districts', authMiddleware, getUserCountByDistrict);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID with land and livestock details
 * @access  Protected
 */
router.get('/:id', authMiddleware, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Protected
 */
router.post('/', authMiddleware, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Protected
 */
router.put('/:id', authMiddleware, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteUser);

export default router;
