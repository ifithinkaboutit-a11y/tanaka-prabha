import User from '../models/User.js';
import LandDetails from '../models/LandDetails.js';
import LivestockDetails from '../models/LivestockDetails.js';
import { query, withTransaction } from '../config/db.js';
import { DISTRICT_COORDS } from '../data/districtCoords.js';

/**
 * Re-export for analytics controller which imports DISTRICT_COORDS from userController
 */
export { DISTRICT_COORDS };

/**
 * Get all users with pagination, including land and livestock details
 */
export const getAllUsers = async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;
        const lim = parseInt(limit);
        const off = parseInt(offset);

        let usersResult;
        let countResult;

        if (search) {
            const like = `%${search}%`;
            usersResult = await query(`
                SELECT
                    u.id, u.name, u.age, u.gender, u.photo_url, u.mobile_number, u.aadhaar_number,
                    u.fathers_name, u.mothers_name, u.educational_qualification,
                    u.sons_married, u.sons_unmarried, u.daughters_married, u.daughters_unmarried,
                    u.other_family_members, u.village, u.gram_panchayat, u.nyay_panchayat,
                    u.post_office, u.tehsil, u.block, u.district, u.pin_code, u.state,
                    ST_Y(u.location::geometry) as latitude,
                    ST_X(u.location::geometry) as longitude,
                    u.created_at, u.updated_at,
                    row_to_json(ld.*) as land_details,
                    row_to_json(ls.*) as livestock_details
                FROM public.users u
                LEFT JOIN public.land_details ld ON ld.user_id = u.id
                LEFT JOIN public.livestock_details ls ON ls.user_id = u.id
                WHERE u.name != 'New User'
                  AND (u.name ILIKE $1 OR u.village ILIKE $1 OR u.district ILIKE $1 OR u.mobile_number ILIKE $1)
                ORDER BY u.created_at DESC
                LIMIT $2 OFFSET $3
            `, [like, lim, off]);
            countResult = await query(
                `SELECT COUNT(*) as total FROM public.users
                 WHERE name != 'New User'
                 AND (name ILIKE $1 OR village ILIKE $1 OR district ILIKE $1 OR mobile_number ILIKE $1)`,
                [like]
            );
        } else {
            usersResult = await query(`
                SELECT
                    u.id, u.name, u.age, u.gender, u.photo_url, u.mobile_number, u.aadhaar_number,
                    u.fathers_name, u.mothers_name, u.educational_qualification,
                    u.sons_married, u.sons_unmarried, u.daughters_married, u.daughters_unmarried,
                    u.other_family_members, u.village, u.gram_panchayat, u.nyay_panchayat,
                    u.post_office, u.tehsil, u.block, u.district, u.pin_code, u.state,
                    ST_Y(u.location::geometry) as latitude,
                    ST_X(u.location::geometry) as longitude,
                    u.is_verified, u.is_active,
                    u.created_at, u.updated_at,
                    row_to_json(ld.*) as land_details,
                    row_to_json(ls.*) as livestock_details
                FROM public.users u
                LEFT JOIN public.land_details ld ON ld.user_id = u.id
                LEFT JOIN public.livestock_details ls ON ls.user_id = u.id
                WHERE u.name != 'New User'
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `, [lim, off]);
            countResult = await query(`SELECT COUNT(*) as total FROM public.users WHERE name != 'New User'`);
        }

        const users = usersResult.rows;
        const totalCount = parseInt(countResult.rows[0]?.total || 0);

        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    limit: lim,
                    offset: off,
                    count: users.length,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / lim),
                    currentPage: Math.floor(off / lim) + 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user by ID with land and livestock details
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Get land and livestock details
        const [landDetails, livestockDetails] = await Promise.all([
            LandDetails.findByUserId(id),
            LivestockDetails.findByUserId(id)
        ]);

        res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data: {
                user: {
                    ...user,
                    land_details: landDetails || null,
                    livestock_details: livestockDetails || null
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new user
 */
export const createUser = async (req, res) => {
    try {
        const userData = req.body;

        // Check if mobile number already exists
        if (userData.mobile_number) {
            const existingUser = await User.findByMobile(userData.mobile_number);
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'A user with this mobile number already exists'
                });
            }
        }

        const user = await User.create(userData);

        // Create land details if provided
        if (userData.land_details) {
            await LandDetails.create({
                user_id: user.id,
                ...userData.land_details
            });
        }

        // Create livestock details if provided
        if (userData.livestock_details) {
            await LivestockDetails.create({
                user_id: user.id,
                ...userData.livestock_details
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update a user
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const user = await User.update(id, userData);

        // Update land details if provided
        if (userData.land_details) {
            const existingLand = await LandDetails.findByUserId(id);
            if (existingLand) {
                await LandDetails.update(id, userData.land_details);
            } else {
                await LandDetails.create({ user_id: id, ...userData.land_details });
            }
        }

        // Update livestock details if provided
        if (userData.livestock_details) {
            const existingLivestock = await LivestockDetails.findByUserId(id);
            if (existingLivestock) {
                await LivestockDetails.update(id, userData.livestock_details);
            } else {
                await LivestockDetails.create({ user_id: id, ...userData.livestock_details });
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a user
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Delete related data first
        await Promise.all([
            LandDetails.delete(id),
            LivestockDetails.delete(id)
        ]);

        await User.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get users by location (for heatmap)
 */
export const getUsersByLocation = async (req, res) => {
    try {
        const { minLng, minLat, maxLng, maxLat, limit = 50, offset = 0 } = req.query;

        if (!minLng || !minLat || !maxLng || !maxLat) {
            return res.status(400).json({
                status: 'error',
                message: 'Bounds parameters (minLng, minLat, maxLng, maxLat) are required'
            });
        }

        const users = await User.getUsersByLocation({
            minLng: parseFloat(minLng),
            minLat: parseFloat(minLat),
            maxLng: parseFloat(maxLng),
            maxLat: parseFloat(maxLat),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: { users }
        });
    } catch (error) {
        console.error('Error fetching users by location:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users by location',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user count by district
 */
export const getUserCountByDistrict = async (req, res) => {
    try {
        const districtData = await User.getCountByDistrict();

        res.status(200).json({
            status: 'success',
            message: 'District counts retrieved successfully',
            data: { districts: districtData }
        });
    } catch (error) {
        console.error('Error fetching district counts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch district counts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get current user's profile (from JWT token)
 */
export const getCurrentUserProfile = async (req, res) => {
    try {
        // req.user is set by authMiddleware from JWT payload
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Get land and livestock details
        const [landDetails, livestockDetails] = await Promise.all([
            LandDetails.findByUserId(userId),
            LivestockDetails.findByUserId(userId)
        ]);

        res.status(200).json({
            status: 'success',
            message: 'Profile retrieved successfully',
            data: {
                user: {
                    ...user,
                    land_details: landDetails || null,
                    livestock_details: livestockDetails || null
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update current user's profile (from JWT token)
 * All writes (user + land + livestock) are wrapped in a single DB transaction.
 */
export const updateCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.body;

        // Don't allow changing mobile number through profile update
        delete userData.mobile_number;

        // ── Location picker integration ───────────────────────────────────────────
        // App sends: { location: { lat, lng, address, accuracy, setAt, method } }
        // DB stores: latitude + longitude → GEOGRAPHY(POINT) via existing update logic,
        //            plus location_address, location_accuracy, location_set_at, location_method
        if (userData.location && typeof userData.location === 'object') {
            const loc = userData.location;

            // Always persist the metadata (useful for analytics on skipped entries too)
            userData.location_address = loc.address ?? '';
            userData.location_accuracy = loc.accuracy ?? null;
            userData.location_set_at = loc.setAt ?? null;
            userData.location_method = loc.method ?? null;

            // Only update the map point for GPS-confirmed pins.
            // 'skipped' entries preserve any previously-confirmed point.
            if (loc.method === 'gps' && loc.lat && loc.lng) {
                userData.latitude = loc.lat;
                userData.longitude = loc.lng;
            }

            // Remove nested object — User.update() expects flat columns
            delete userData.location;
        }

        // ── District-centroid fallback ─────────────────────────────────────────────────
        // When a user saves their district but has no GPS location yet,
        // automatically assign the district's known centroid coordinates.
        // This is the SAME logic used during seeding, so that real user data
        // immediately appears on the Frequency Dashboard, Heatmap, and
        // Farmer-Locations map without requiring GPS location to be set.
        // We need the existing user to check current location state, but we do
        // this BEFORE the transaction to keep the transaction window short.
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const districtToUse = userData.district || existingUser.district;
        const hasGpsLocation = !!(
            userData.latitude ||
            existingUser.latitude ||
            existingUser.longitude
        );
        if (districtToUse && !hasGpsLocation && !userData.latitude && !userData.longitude) {
            const coords = DISTRICT_COORDS[districtToUse];
            if (coords) {
                // Add a small random jitter (±0.01°, ~1km) so multiple users
                // from the same district don't stack on an identical point.
                const jitter = () => (Math.random() - 0.5) * 0.02;
                userData.latitude = coords[0] + jitter();
                userData.longitude = coords[1] + jitter();
                console.log(`📍 [userController] Auto-assigned district centroid for "${districtToUse}"`);
            }
        }

        // Extract land_details and livestock_details before passing to User.update
        // These belong to separate tables, not the users table
        const { land_details, livestock_details, ...userOnlyData } = userData;

        // ── All DB writes in one atomic transaction ─────────────────────────────────────
        const { user, updatedLandDetails, updatedLivestockDetails } = await withTransaction(async (client) => {
            // 1. Update the user row
            const updatedUser = await User.updateWithClient(client, userId, userOnlyData);

            // 2. Land details
            let landResult = null;
            if (land_details) {
                const existingLand = await LandDetails.findByUserId(userId); // This find is outside the transaction, but the update/create is inside. This is fine.
                if (existingLand) {
                    landResult = await LandDetails.updateWithClient(client, userId, land_details);
                } else {
                    landResult = await LandDetails.createWithClient(client, { user_id: userId, ...land_details });
                }
            } else {
                // If land_details not provided, fetch existing for response consistency
                landResult = await LandDetails.findByUserId(userId);
            }

            // 3. Livestock details
            let livestockResult = null;
            if (livestock_details) {
                const existingLivestock = await LivestockDetails.findByUserId(userId); // This find is outside the transaction, but the update/create is inside. This is fine.
                if (existingLivestock) {
                    livestockResult = await LivestockDetails.updateWithClient(client, userId, livestock_details);
                } else {
                    livestockResult = await LivestockDetails.createWithClient(client, { user_id: userId, ...livestock_details });
                }
            } else {
                // If livestock_details not provided, fetch existing for response consistency
                livestockResult = await LivestockDetails.findByUserId(userId);
            }

            return {
                user: updatedUser,
                updatedLandDetails: landResult,
                updatedLivestockDetails: livestockResult,
            };
        });

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: {
                    ...user,
                    land_details: updatedLandDetails || null,
                    livestock_details: updatedLivestockDetails || null
                }
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
