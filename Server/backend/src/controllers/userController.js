import User from '../models/User.js';
import LandDetails from '../models/LandDetails.js';
import LivestockDetails from '../models/LivestockDetails.js';

/**
 * Get all users with pagination
 */
export const getAllUsers = async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;

        let users;
        if (search) {
            users = await User.search(search, parseInt(limit));
        } else {
            users = await User.findAll(parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: users.length
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
        const { minLng, minLat, maxLng, maxLat } = req.query;

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
            maxLat: parseFloat(maxLat)
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
 */
export const updateCurrentUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = req.body;

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Don't allow changing mobile number through profile update
        delete userData.mobile_number;

        const user = await User.update(userId, userData);

        // Update land details if provided
        if (userData.land_details) {
            const existingLand = await LandDetails.findByUserId(userId);
            if (existingLand) {
                await LandDetails.update(userId, userData.land_details);
            } else {
                await LandDetails.create({ user_id: userId, ...userData.land_details });
            }
        }

        // Update livestock details if provided
        if (userData.livestock_details) {
            const existingLivestock = await LivestockDetails.findByUserId(userId);
            if (existingLivestock) {
                await LivestockDetails.update(userId, userData.livestock_details);
            } else {
                await LivestockDetails.create({ user_id: userId, ...userData.livestock_details });
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { user }
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
