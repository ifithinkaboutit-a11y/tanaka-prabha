import express from 'express';
import {
    getDashboardStats,
    getRecentActivity,
    getUserDistribution,
    getLandStatistics,
    getLivestockStatistics,
    getGrowthTrends,
    getFarmerLocations,
    getUserHeatmap
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Protected
 */
router.get('/dashboard', authMiddleware, getDashboardStats);

/**
 * @route   GET /api/analytics/recent-activity
 * @desc    Get recent activity
 * @access  Protected
 */
router.get('/recent-activity', authMiddleware, getRecentActivity);

/**
 * @route   GET /api/analytics/user-distribution
 * @desc    Get user distribution by district
 * @access  Protected
 */
router.get('/user-distribution', authMiddleware, getUserDistribution);

/**
 * @route   GET /api/analytics/land-statistics
 * @desc    Get land statistics
 * @access  Protected
 */
router.get('/land-statistics', authMiddleware, getLandStatistics);

/**
 * @route   GET /api/analytics/livestock-statistics
 * @desc    Get livestock statistics
 * @access  Protected
 */
router.get('/livestock-statistics', authMiddleware, getLivestockStatistics);

/**
 * @route   GET /api/analytics/growth-trends
 * @desc    Get growth trends
 * @access  Protected
 */
router.get('/growth-trends', authMiddleware, getGrowthTrends);

/**
 * @route   GET /api/analytics/farmer-locations
 * @desc    Get farmer locations for map
 * @access  Protected
 */
router.get('/farmer-locations', authMiddleware, getFarmerLocations);

/**
 * @route   GET /api/analytics/user-heatmap
 * @desc    Get user heatmap data (district counts mapped to lat/lng)
 * @access  Protected
 */
router.get('/user-heatmap', authMiddleware, getUserHeatmap);

export default router;
