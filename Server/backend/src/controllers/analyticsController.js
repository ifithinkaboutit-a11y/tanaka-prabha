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
        const { limit = 10, offset = 0 } = req.query;

        // Get recent user registrations
        const recentUsersResult = await query(`
            SELECT id, name, village, district, created_at, 'registration' as type
            FROM public.users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `, [parseInt(limit), parseInt(offset)]);

        // Get recent scheme updates
        const recentSchemesResult = await query(`
            SELECT id, title, created_at, 'scheme' as type
            FROM public.schemes
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `, [Math.floor(parseInt(limit) / 2), Math.floor(parseInt(offset) / 2)]);

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
        const { limit = 1000, offset = 0 } = req.query;

        const locationsResult = await query(`
            SELECT 
                id, name, village, district,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM public.users
            WHERE location IS NOT NULL
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `, [parseInt(limit), parseInt(offset)]);

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

/**
 * Get user heatmap data — district counts mapped to lat/lng
 */

// Assam district coordinates lookup
const DISTRICT_COORDS = {
    'Baksa': [26.6525, 91.2038], 'Barpeta': [26.3250, 91.1167], 'Biswanath': [26.7269, 93.1669],
    'Bongaigaon': [26.4765, 90.5535], 'Cachar': [24.7979, 92.8676], 'Charaideo': [26.9859, 94.8077],
    'Chirang': [26.4847, 90.4714], 'Darrang': [26.4469, 91.9785], 'Dhemaji': [27.4718, 94.5717],
    'Dhubri': [26.0180, 89.9759], 'Dibrugarh': [27.4782, 94.9146], 'Dima Hasao': [25.1167, 93.0167],
    'Goalpara': [26.1739, 90.6228], 'Golaghat': [26.5203, 93.9759], 'Hailakandi': [24.6758, 92.5588],
    'Hojai': [26.0000, 92.8500], 'Jorhat': [26.7500, 94.2167], 'Kamrup': [26.1434, 91.7362],
    'Kamrup Metropolitan': [26.1445, 91.7362], 'Karbi Anglong': [26.1000, 93.6000],
    'Karimganj': [24.8677, 92.3540], 'Kokrajhar': [26.4008, 90.2715], 'Lakhimpur': [27.2342, 94.1007],
    'Majuli': [26.9500, 94.1667], 'Morigaon': [26.2624, 92.3468], 'Nagaon': [26.3451, 92.6847],
    'Nalbari': [26.4470, 91.4406], 'Sivasagar': [26.9831, 94.6358], 'Sonitpur': [26.6352, 92.7979],
    'South Salmara-Mankachar': [25.7333, 89.8667], 'Tinsukia': [27.4893, 95.3579],
    'Udalguri': [26.7522, 92.0906], 'West Karbi Anglong': [25.9625, 92.8000],
    'Delhi': [28.6139, 77.2090], 'Mumbai': [19.0760, 72.8777], 'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707], 'Bangalore': [12.9716, 77.5946], 'Hyderabad': [17.3850, 78.4867],
};

export const getUserHeatmap = async (req, res) => {
    try {
        // 1. Get individual user GPS points from PostGIS (real geographic heatmap)
        const rawPointsResult = await query(`
            SELECT
                ST_Y(location::geometry) as lat,
                ST_X(location::geometry) as lng,
                district
            FROM public.users
            WHERE location IS NOT NULL
            LIMIT 5000
        `);

        // 2. District aggregation for top-regions leaderboard
        const districtResult = await query(`
            SELECT district, COUNT(*) as count
            FROM public.users
            WHERE district IS NOT NULL AND district != ''
            GROUP BY district
            ORDER BY count DESC
            LIMIT 50
        `);

        const districtRows = districtResult.rows;
        const maxCount = districtRows.length > 0 ? parseInt(districtRows[0].count) : 1;

        // Build heatmap points from actual GPS locations
        let points = rawPointsResult.rows
            .filter(row => row.lat && row.lng && !isNaN(parseFloat(row.lat)) && !isNaN(parseFloat(row.lng)))
            .map(row => ({
                lat: parseFloat(row.lat),
                lng: parseFloat(row.lng),
                intensity: 150,
                district: row.district,
                count: 1,
            }));

        // Fallback: district coord lookup if no GPS data exists
        if (points.length === 0) {
            points = districtRows
                .filter(row => DISTRICT_COORDS[row.district])
                .map(row => {
                    const [lat, lng] = DISTRICT_COORDS[row.district];
                    const count = parseInt(row.count);
                    return { lat, lng, intensity: Math.round((count / maxCount) * 500), district: row.district, count };
                });
        }

        const topRegions = districtRows.slice(0, 8).map((row, i) => ({
            state: row.district,
            count: parseInt(row.count),
            rank: i + 1,
        }));

        const totalUsers = districtRows.reduce((s, r) => s + parseInt(r.count), 0);

        res.status(200).json({
            status: 'success',
            message: 'User heatmap data retrieved successfully',
            data: { points, topRegions, totalUsers }
        });
    } catch (error) {
        console.error('Error fetching user heatmap:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch heatmap data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
