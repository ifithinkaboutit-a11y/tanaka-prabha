import express from 'express';
import {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners
} from '../controllers/bannerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/banners
 * @desc    Get all banners
 * @access  Public
 */
router.get('/', getAllBanners);

/**
 * @route   GET /api/banners/:id
 * @desc    Get banner by ID
 * @access  Public
 */
router.get('/:id', getBannerById);

/**
 * @route   POST /api/banners
 * @desc    Create a new banner
 * @access  Protected
 */
router.post('/', authMiddleware, createBanner);

/**
 * @route   PUT /api/banners/:id
 * @desc    Update a banner
 * @access  Protected
 */
router.put('/:id', authMiddleware, updateBanner);

/**
 * @route   PATCH /api/banners/:id/toggle
 * @desc    Toggle banner active status
 * @access  Protected
 */
router.patch('/:id/toggle', authMiddleware, toggleBannerStatus);

/**
 * @route   PUT /api/banners/reorder
 * @desc    Reorder banners
 * @access  Protected
 */
router.put('/reorder', authMiddleware, reorderBanners);

/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete a banner
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteBanner);

export default router;
