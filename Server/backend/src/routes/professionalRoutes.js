import express from 'express';
import {
    getAllProfessionals,
    getProfessionalById,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    toggleProfessionalAvailability
} from '../controllers/professionalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/professionals
 * @desc    Get all professionals with filters
 * @access  Public
 */
router.get('/', getAllProfessionals);

/**
 * @route   GET /api/professionals/:id
 * @desc    Get professional by ID
 * @access  Public
 */
router.get('/:id', getProfessionalById);

/**
 * @route   POST /api/professionals
 * @desc    Create a new professional
 * @access  Protected
 */
router.post('/', authMiddleware, createProfessional);

/**
 * @route   PUT /api/professionals/:id
 * @desc    Update a professional
 * @access  Protected
 */
router.put('/:id', authMiddleware, updateProfessional);

/**
 * @route   PATCH /api/professionals/:id/toggle
 * @desc    Toggle professional availability
 * @access  Protected
 */
router.patch('/:id/toggle', authMiddleware, toggleProfessionalAvailability);

/**
 * @route   DELETE /api/professionals/:id
 * @desc    Delete a professional
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteProfessional);

export default router;
