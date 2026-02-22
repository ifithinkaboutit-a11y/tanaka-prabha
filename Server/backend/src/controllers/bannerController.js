import Banner from '../models/Banner.js';

/**
 * Get all banners
 */
export const getAllBanners = async (req, res) => {
    try {
        const { active_only, limit = 50, offset = 0 } = req.query;

        let banners;
        if (active_only === 'true') {
            banners = await Banner.findAllActive(parseInt(limit), parseInt(offset));
        } else {
            banners = await Banner.findAll(parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Banners retrieved successfully',
            data: { banners }
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch banners',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get banner by ID
 */
export const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                status: 'error',
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Banner retrieved successfully',
            data: { banner }
        });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch banner',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new banner
 */
export const createBanner = async (req, res) => {
    try {
        const bannerData = req.body;

        if (!bannerData.title || !bannerData.image_url) {
            return res.status(400).json({
                status: 'error',
                message: 'Banner title and image_url are required'
            });
        }

        const banner = await Banner.create(bannerData);

        res.status(201).json({
            status: 'success',
            message: 'Banner created successfully',
            data: { banner }
        });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create banner',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update a banner
 */
export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const bannerData = req.body;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({
                status: 'error',
                message: 'Banner not found'
            });
        }

        const banner = await Banner.update(id, bannerData);

        res.status(200).json({
            status: 'success',
            message: 'Banner updated successfully',
            data: { banner }
        });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update banner',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a banner
 */
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({
                status: 'error',
                message: 'Banner not found'
            });
        }

        await Banner.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete banner',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Toggle banner active status
 */
export const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({
                status: 'error',
                message: 'Banner not found'
            });
        }

        const banner = await Banner.update(id, { is_active: !existingBanner.is_active });

        res.status(200).json({
            status: 'success',
            message: `Banner ${banner.is_active ? 'activated' : 'deactivated'} successfully`,
            data: { banner }
        });
    } catch (error) {
        console.error('Error toggling banner status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to toggle banner status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Reorder banners
 */
export const reorderBanners = async (req, res) => {
    try {
        const { banners } = req.body;

        if (!banners || !Array.isArray(banners)) {
            return res.status(400).json({
                status: 'error',
                message: 'banners array is required with id and sort_order'
            });
        }

        // Update each banner's sort order
        const updates = banners.map(({ id, sort_order }) =>
            Banner.update(id, { sort_order })
        );

        await Promise.all(updates);

        const updatedBanners = await Banner.findAll();

        res.status(200).json({
            status: 'success',
            message: 'Banners reordered successfully',
            data: { banners: updatedBanners }
        });
    } catch (error) {
        console.error('Error reordering banners:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reorder banners',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
