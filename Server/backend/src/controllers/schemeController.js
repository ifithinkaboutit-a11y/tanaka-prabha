import Scheme from '../models/Scheme.js';
import { query } from '../config/db.js';

/**
 * Get all schemes
 */
export const getAllSchemes = async (req, res) => {
    try {
        const { limit = 50, offset = 0, category, search, active_only } = req.query;

        let schemes;

        if (search) {
            schemes = await Scheme.search(search, parseInt(limit));
        } else if (category) {
            schemes = await Scheme.findByCategory(category, parseInt(limit));
        } else if (active_only === 'true') {
            schemes = await Scheme.findAllActive(parseInt(limit), parseInt(offset));
        } else {
            schemes = await Scheme.findAll(parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Schemes retrieved successfully',
            data: {
                schemes,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: schemes.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch schemes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get scheme by ID
 */
export const getSchemeById = async (req, res) => {
    try {
        const { id } = req.params;
        const scheme = await Scheme.findById(id);

        if (!scheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Scheme retrieved successfully',
            data: { scheme }
        });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch scheme',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new scheme
 */
export const createScheme = async (req, res) => {
    try {
        const schemeData = req.body;

        if (!schemeData.title) {
            return res.status(400).json({
                status: 'error',
                message: 'Scheme title is required'
            });
        }

        const scheme = await Scheme.create(schemeData);

        res.status(201).json({
            status: 'success',
            message: 'Scheme created successfully',
            data: { scheme }
        });
    } catch (error) {
        console.error('Error creating scheme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create scheme',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update a scheme
 */
export const updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const schemeData = req.body;

        const existingScheme = await Scheme.findById(id);
        if (!existingScheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found'
            });
        }

        const scheme = await Scheme.update(id, schemeData);

        res.status(200).json({
            status: 'success',
            message: 'Scheme updated successfully',
            data: { scheme }
        });
    } catch (error) {
        console.error('Error updating scheme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update scheme',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a scheme
 */
export const deleteScheme = async (req, res) => {
    try {
        const { id } = req.params;

        const existingScheme = await Scheme.findById(id);
        if (!existingScheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found'
            });
        }

        await Scheme.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Scheme deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete scheme',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Toggle scheme active status
 */
export const toggleSchemeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const existingScheme = await Scheme.findById(id);
        if (!existingScheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found'
            });
        }

        const scheme = await Scheme.update(id, { is_active: !existingScheme.is_active });

        res.status(200).json({
            status: 'success',
            message: `Scheme ${scheme.is_active ? 'activated' : 'deactivated'} successfully`,
            data: { scheme }
        });
    } catch (error) {
        console.error('Error toggling scheme status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to toggle scheme status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get scheme categories
 */
export const getSchemeCategories = async (req, res) => {
    try {
        const categories = await Scheme.getCategories();

        res.status(200).json({
            status: 'success',
            message: 'Categories retrieved successfully',
            data: { categories }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Express interest in a scheme
 * POST /api/schemes/:id/interest
 */
export const expressInterest = async (req, res) => {
    try {
        const { id } = req.params;

        const scheme = await Scheme.findById(id);
        if (!scheme) {
            return res.status(404).json({
                status: 'error',
                message: 'Scheme not found'
            });
        }

        // Ensure the interest_count column exists, then atomically increment it
        await query(
            `ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS interest_count INTEGER DEFAULT 0`
        );

        const result = await query(
            `UPDATE public.schemes
             SET interest_count = COALESCE(interest_count, 0) + 1
             WHERE id = $1
             RETURNING interest_count`,
            [id]
        );

        const interestCount = result?.rows?.[0]?.interest_count ?? 0;

        res.status(200).json({
            status: 'success',
            data: { interestCount }
        });
    } catch (error) {
        console.error('Error expressing interest in scheme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to express interest in scheme',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
