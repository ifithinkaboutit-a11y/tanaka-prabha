import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Professional from '../models/Professional.js';
import LandDetails from '../models/LandDetails.js';
import LivestockDetails from '../models/LivestockDetails.js';
import { query } from '../config/db.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Get total farmers count
        const farmersResult = await query('SELECT COUNT(*) as count FROM public.users');
        const totalFarmers = parseInt(farmersResult.rows[0].count) || 0;

        // Get total land coverage
        const landResult = await query('SELECT SUM(total_land_area) as total FROM public.land_details');
        const totalLandCoverage = parseFloat(landResult.rows[0].total) || 0;

        // Get livestock count
        const livestockResult = await query(`
            SELECT 
                COALESCE(SUM(cow), 0) + COALESCE(SUM(buffalo), 0) + COALESCE(SUM(goat), 0) + 
                COALESCE(SUM(sheep), 0) + COALESCE(SUM(pig), 0) + COALESCE(SUM(poultry), 0) as total
            FROM public.livestock_details
        `);
        const livestockCount = parseInt(livestockResult.rows[0].total) || 0;

        // Get active schemes count
        const schemesResult = await query('SELECT COUNT(*) as count FROM public.schemes WHERE is_active = true');
        const activeSchemes = parseInt(schemesResult.rows[0].count) || 0;

        // Get professionals count
        const professionalsResult = await query('SELECT COUNT(*) as count FROM public.professionals WHERE is_available = true');
        const availableProfessionals = parseInt(professionalsResult.rows[0].count) || 0;

        res.status(200).json({
            status: 'success',
            message: 'Dashboard statistics retrieved successfully',
            data: {
                totalFarmers,
                totalLandCoverage,
                livestockCount,
                activeSchemes,
                availableProfessionals
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent user registrations
        const recentUsersResult = await query(`
            SELECT id, name, village, district, created_at, 'registration' as type
            FROM public.users
            ORDER BY created_at DESC
            LIMIT $1
        `, [parseInt(limit)]);

        // Get recent scheme updates
        const recentSchemesResult = await query(`
            SELECT id, title, created_at, 'scheme' as type
            FROM public.schemes
            ORDER BY created_at DESC
            LIMIT $1
        `, [Math.floor(parseInt(limit) / 2)]);

        // Combine and sort activities
        const activities = [
            ...recentUsersResult.rows.map(user => ({
                id: `user-${user.id}`,
                type: 'registration',
                title: user.name || 'New Farmer',
                description: `Joined from ${user.village || user.district || 'Unknown'}`,
                time: user.created_at
            })),
            ...recentSchemesResult.rows.map(scheme => ({
                id: `scheme-${scheme.id}`,
                type: 'scheme',
                title: scheme.title || 'New Scheme',
                description: 'Scheme published',
                time: scheme.created_at
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time))
         .slice(0, parseInt(limit));

        res.status(200).json({
            status: 'success',
            message: 'Recent activity retrieved successfully',
            data: { activities }
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recent activity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user distribution by district
 */
export const getUserDistribution = async (req, res) => {
    try {
        const districtData = await User.getCountByDistrict();

        res.status(200).json({
            status: 'success',
            message: 'User distribution retrieved successfully',
            data: { distribution: districtData }
        });
    } catch (error) {
        console.error('Error fetching user distribution:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user distribution',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get land statistics
 */
export const getLandStatistics = async (req, res) => {
    try {
        const landStats = await LandDetails.getStatistics();

        res.status(200).json({
            status: 'success',
            message: 'Land statistics retrieved successfully',
            data: { statistics: landStats }
        });
    } catch (error) {
        console.error('Error fetching land statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch land statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get livestock statistics
 */
export const getLivestockStatistics = async (req, res) => {
    try {
        const livestockStats = await LivestockDetails.getStatistics();

        res.status(200).json({
            status: 'success',
            message: 'Livestock statistics retrieved successfully',
            data: { statistics: livestockStats }
        });
    } catch (error) {
        console.error('Error fetching livestock statistics:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch livestock statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get growth trends
 */
export const getGrowthTrends = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);

        // Get daily registration counts for the period
        const trendsResult = await query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as registrations
            FROM public.users
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        res.status(200).json({
            status: 'success',
            message: 'Growth trends retrieved successfully',
            data: { 
                trends: trendsResult.rows,
                period: days 
            }
        });
    } catch (error) {
        console.error('Error fetching growth trends:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch growth trends',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get farmer locations for map
 */
export const getFarmerLocations = async (req, res) => {
    try {
        const { limit = 1000 } = req.query;

        const locationsResult = await query(`
            SELECT 
                id, name, village, district,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM public.users
            WHERE location IS NOT NULL
            ORDER BY created_at DESC
            LIMIT $1
        `, [parseInt(limit)]);

        res.status(200).json({
            status: 'success',
            message: 'Farmer locations retrieved successfully',
            data: { locations: locationsResult.rows }
        });
    } catch (error) {
        console.error('Error fetching farmer locations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch farmer locations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
