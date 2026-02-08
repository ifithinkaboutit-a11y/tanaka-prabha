import express from 'express';
import {
    getMyAppointments,
    getByProfessional,
    getById,
    createAppointment,
    cancelAppointment,
    updateStatus,
    getAvailableSlots,
    getCountForDate,
    deleteAppointment
} from '../controllers/appointmentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/appointments/my
 * @desc    Get current user's appointments
 * @access  Protected
 */
router.get('/my', authMiddleware, getMyAppointments);

/**
 * @route   GET /api/appointments/professional/:professional_id
 * @desc    Get appointments for a specific professional
 * @access  Protected
 */
router.get('/professional/:professional_id', authMiddleware, getByProfessional);

/**
 * @route   GET /api/appointments/professional/:professional_id/slots/:date
 * @desc    Get available time slots for a professional on a date
 * @access  Protected
 */
router.get('/professional/:professional_id/slots/:date', authMiddleware, getAvailableSlots);

/**
 * @route   GET /api/appointments/professional/:professional_id/count/:date
 * @desc    Get appointment count for a professional on a date
 * @access  Protected
 */
router.get('/professional/:professional_id/count/:date', authMiddleware, getCountForDate);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Protected
 */
router.get('/:id', authMiddleware, getById);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Protected
 */
router.post('/', authMiddleware, createAppointment);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Protected
 */
router.patch('/:id/cancel', authMiddleware, cancelAppointment);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (admin/professional use)
 * @access  Protected
 */
router.patch('/:id/status', authMiddleware, updateStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment (admin only)
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteAppointment);

export default router;
