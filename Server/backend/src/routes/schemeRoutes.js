import express from 'express';
import {
    getAllSchemes,
    getSchemeById,
    createScheme,
    updateScheme,
    deleteScheme,
    toggleSchemeStatus,
    getSchemeCategories,
    expressInterest
} from '../controllers/schemeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/schemes
 * @desc    Get all schemes with filters
 * @access  Public (active schemes) / Protected (all schemes)
 */
router.get('/', getAllSchemes);

/**
 * @route   GET /api/schemes/categories
 * @desc    Get all scheme categories
 * @access  Public
 */
router.get('/categories', getSchemeCategories);

/**
 * @route   POST /api/schemes/:id/interest
 * @desc    Express interest in a scheme
 * @access  Protected
 */
router.post('/:id/interest', authMiddleware, expressInterest);

/**
 * @route   GET /api/schemes/:id
 * @desc    Get scheme by ID
 * @access  Public
 */
router.get('/:id', getSchemeById);

/**
 * @route   POST /api/schemes
 * @desc    Create a new scheme
 * @access  Protected
 */
router.post('/', authMiddleware, createScheme);

/**
 * @route   PUT /api/schemes/:id
 * @desc    Update a scheme
 * @access  Protected
 */
router.put('/:id', authMiddleware, updateScheme);

/**
 * @route   PATCH /api/schemes/:id/toggle
 * @desc    Toggle scheme active status
 * @access  Protected
 */
router.patch('/:id/toggle', authMiddleware, toggleSchemeStatus);

/**
 * @route   DELETE /api/schemes/:id
 * @desc    Delete a scheme
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteScheme);

export default router;
