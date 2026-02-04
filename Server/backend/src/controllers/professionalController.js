import Professional from '../models/Professional.js';

/**
 * Get all professionals
 */
export const getAllProfessionals = async (req, res) => {
    try {
        const { limit = 50, offset = 0, category, district, department, search, available_only } = req.query;

        let professionals;

        if (search) {
            professionals = await Professional.search(search, parseInt(limit));
        } else if (category) {
            professionals = await Professional.findByCategory(category, parseInt(limit));
        } else if (district) {
            professionals = await Professional.findByDistrict(district, parseInt(limit));
        } else if (department) {
            professionals = await Professional.findByDepartment(department, parseInt(limit));
        } else if (available_only === 'true') {
            professionals = await Professional.findAllAvailable(parseInt(limit), parseInt(offset));
        } else {
            professionals = await Professional.findAll(parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Professionals retrieved successfully',
            data: {
                professionals,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: professionals.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching professionals:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch professionals',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get professional by ID
 */
export const getProfessionalById = async (req, res) => {
    try {
        const { id } = req.params;
        const professional = await Professional.findById(id);

        if (!professional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Professional retrieved successfully',
            data: { professional }
        });
    } catch (error) {
        console.error('Error fetching professional:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch professional',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new professional
 */
export const createProfessional = async (req, res) => {
    try {
        const professionalData = req.body;

        if (!professionalData.name) {
            return res.status(400).json({
                status: 'error',
                message: 'Professional name is required'
            });
        }

        const professional = await Professional.create(professionalData);

        res.status(201).json({
            status: 'success',
            message: 'Professional created successfully',
            data: { professional }
        });
    } catch (error) {
        console.error('Error creating professional:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create professional',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update a professional
 */
export const updateProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const professionalData = req.body;

        const existingProfessional = await Professional.findById(id);
        if (!existingProfessional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        const professional = await Professional.update(id, professionalData);

        res.status(200).json({
            status: 'success',
            message: 'Professional updated successfully',
            data: { professional }
        });
    } catch (error) {
        console.error('Error updating professional:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update professional',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a professional
 */
export const deleteProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProfessional = await Professional.findById(id);
        if (!existingProfessional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        await Professional.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Professional deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting professional:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete professional',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Toggle professional availability
 */
export const toggleProfessionalAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProfessional = await Professional.findById(id);
        if (!existingProfessional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        const professional = await Professional.update(id, { 
            is_available: !existingProfessional.is_available 
        });

        res.status(200).json({
            status: 'success',
            message: `Professional ${professional.is_available ? 'marked as available' : 'marked as unavailable'}`,
            data: { professional }
        });
    } catch (error) {
        console.error('Error toggling professional availability:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to toggle professional availability',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
