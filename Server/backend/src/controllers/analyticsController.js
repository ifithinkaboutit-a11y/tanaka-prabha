import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Professional from '../models/Professional.js';
import LandDetails from '../models/LandDetails.js';
import LivestockDetails from '../models/LivestockDetails.js';
import { query } from '../config/db.js';
import { DISTRICT_COORDS } from './userController.js';

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

        // Get livestock breakdown (Real Data)
        const livestockBreakdownResult = await query(`
            SELECT 
                COALESCE(SUM(cow), 0) as cow, 
                COALESCE(SUM(buffalo), 0) as buffalo, 
                COALESCE(SUM(goat), 0) as goat, 
                COALESCE(SUM(sheep), 0) as sheep, 
                COALESCE(SUM(pig), 0) as pig, 
                COALESCE(SUM(poultry), 0) as poultry,
                COALESCE(SUM(horse), 0) as horse,
                COALESCE(SUM(others), 0) as other
            FROM public.livestock_details
        `);
        
        const lb = livestockBreakdownResult.rows[0];
        const livestockBreakdown = {
            cow: parseInt(lb.cow) || 0,
            buffalo: parseInt(lb.buffalo) || 0,
            goat: parseInt(lb.goat) || 0,
            sheep: parseInt(lb.sheep) || 0,
            pig: parseInt(lb.pig) || 0,
            poultry: parseInt(lb.poultry) || 0,
            horse: parseInt(lb.horse) || 0,
            other: parseInt(lb.other) || 0
        };
        const livestockCount = Object.values(livestockBreakdown).reduce((a, b) => a + b, 0);

        // Get land breakdown (District-wise)
        const landByDistrictResult = await query(`
            SELECT u.district, SUM(ld.total_land_area) as total
            FROM public.land_details ld
            JOIN public.users u ON ld.user_id = u.id
            WHERE u.district IS NOT NULL AND u.district != ''
            GROUP BY u.district
            ORDER BY total DESC
        `);
        
        const districts = {};
        landByDistrictResult.rows.forEach(row => {
            districts[row.district] = parseFloat(row.total) || 0;
        });

        // Get seasonal counts
        const seasonalResult = await query(`
            SELECT 
                COUNT(CASE WHEN rabi_crop IS NOT NULL AND rabi_crop != '' THEN 1 END) as rabi,
                COUNT(CASE WHEN kharif_crop IS NOT NULL AND kharif_crop != '' THEN 1 END) as kharif,
                COUNT(CASE WHEN zaid_crop IS NOT NULL AND zaid_crop != '' THEN 1 END) as zayed
            FROM public.land_details
        `);

        const landBreakdown = {
            rabi: parseInt(seasonalResult.rows[0].rabi) || 0,
            kharif: parseInt(seasonalResult.rows[0].kharif) || 0,
            zayed: parseInt(seasonalResult.rows[0].zayed) || 0,
            units: { acre: totalLandCoverage, bigha: 0, hectare: 0 },
            districts
        };

        // Get active schemes/professionals counts
        const [schemesResult, professionalsResult] = await Promise.all([
            query('SELECT COUNT(*) as count FROM public.schemes WHERE is_active = true'),
            query('SELECT COUNT(*) as count FROM public.professionals WHERE is_available = true')
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Dashboard statistics retrieved successfully',
            data: {
                totalFarmers,
                totalLandCoverage,
                livestockCount,
                livestockBreakdown,
                landBreakdown,
                activeSchemes: parseInt(schemesResult.rows[0].count) || 0,
                availableProfessionals: parseInt(professionalsResult.rows[0].count) || 0,
                totalAppointments: 0 // Fetch optionally if needed
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
        const [farmers, livestockStats] = await Promise.all([
            LivestockDetails.getFarmersWithLocations(),
            LivestockDetails.getStatistics(),
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Livestock statistics retrieved successfully',
            data: { farmers, statistics: livestockStats }
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

        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid period. Must be between 1 and 365 days.'
            });
        }

        // Get daily registration counts for the period (parameterized query)
        const trendsResult = await query(`
            SELECT
                DATE(created_at) as date,
                COUNT(*) as registrations
            FROM public.users
            WHERE created_at >= NOW() - INTERVAL '1 day' * $1
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [days]);

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

        // Helper: build nested land_details / livestock_details from a flat row
        function buildLocationRow(row) {
            const { rabi_crop, kharif_crop, zaid_crop, total_land_area,
                    cow, buffalo, goat, sheep, pig, poultry, others, horse,
                    ...base } = row;
            return {
                ...base,
                land_details: {
                    rabi_crop: rabi_crop || null,
                    kharif_crop: kharif_crop || null,
                    zaid_crop: zaid_crop || null,
                    total_land_area: total_land_area || null,
                },
                livestock_details: {
                    cow: cow || 0,
                    buffalo: buffalo || 0,
                    goat: goat || 0,
                    sheep: sheep || 0,
                    pig: pig || 0,
                    poultry: poultry || 0,
                    others: others || 0,
                    horse: horse || 0,
                },
            };
        }

        // Primary: users with a proper GPS/PostGIS location point
        // JOIN land_details & livestock_details so the frontend can render crop/livestock pins
        const locationsResult = await query(`
            SELECT
                u.id, u.name, u.village, u.district,
                ST_Y(u.location::geometry) as latitude,
                ST_X(u.location::geometry) as longitude,
                ld.rabi_crop, ld.kharif_crop, ld.zaid_crop, ld.total_land_area,
                lst.cow, lst.buffalo, lst.goat, lst.sheep,
                lst.pig, lst.poultry, lst.others, lst.horse
            FROM public.users u
            LEFT JOIN public.land_details ld ON ld.user_id = u.id
            LEFT JOIN public.livestock_details lst ON lst.user_id = u.id
            WHERE u.location IS NOT NULL
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2
        `, [parseInt(limit), parseInt(offset)]);

        // Supplemental: users who have a district but no GPS location yet.
        // Use district-centroid coords so they appear on the map too.
        const noGpsResult = await query(`
            SELECT
                u.id, u.name, u.village, u.district,
                ld.rabi_crop, ld.kharif_crop, ld.zaid_crop, ld.total_land_area,
                lst.cow, lst.buffalo, lst.goat, lst.sheep,
                lst.pig, lst.poultry, lst.others, lst.horse
            FROM public.users u
            LEFT JOIN public.land_details ld ON ld.user_id = u.id
            LEFT JOIN public.livestock_details lst ON lst.user_id = u.id
            WHERE u.location IS NULL
              AND u.district IS NOT NULL
              AND u.district != ''
            ORDER BY u.created_at DESC
        `);

        const locations = locationsResult.rows.map(buildLocationRow);

        for (const row of noGpsResult.rows) {
            const coords = DISTRICT_COORDS[row.district];
            if (coords) {
                const jitter = () => (Math.random() - 0.5) * 0.02;
                locations.push(buildLocationRow({
                    ...row,
                    latitude: coords[0] + jitter(),
                    longitude: coords[1] + jitter(),
                }));
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Farmer locations retrieved successfully',
            data: { locations }
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
        const gpsPoints = rawPointsResult.rows
            .filter(row => row.lat && row.lng && !isNaN(parseFloat(row.lat)) && !isNaN(parseFloat(row.lng)))
            .map(row => ({
                lat: parseFloat(row.lat),
                lng: parseFloat(row.lng),
                intensity: 150,
                district: row.district,
                count: 1,
            }));

        // 3. Supplemental: For users who have a district but no GPS location yet,
        //    add district-centroid points so they show up on the heatmap immediately.
        //    This mirrors exactly what the seeding script does.
        const noGpsUsersResult = await query(`
            SELECT district, COUNT(*) as count
            FROM public.users
            WHERE location IS NULL
              AND district IS NOT NULL
              AND district != ''
            GROUP BY district
            ORDER BY count DESC
        `);

        const districtFallbackPoints = noGpsUsersResult.rows
            .filter(row => DISTRICT_COORDS[row.district])
            .flatMap(row => {
                const [lat, lng] = DISTRICT_COORDS[row.district];
                const count = parseInt(row.count);
                // Expand into individual jittered points so heatmap density looks natural
                return Array.from({ length: count }, () => {
                    const jitter = () => (Math.random() - 0.5) * 0.02;
                    return {
                        lat: lat + jitter(),
                        lng: lng + jitter(),
                        intensity: 120,
                        district: row.district,
                        count: 1,
                    };
                });
            });

        // Merge GPS points and district-fallback points
        const points = [...gpsPoints, ...districtFallbackPoints];

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
