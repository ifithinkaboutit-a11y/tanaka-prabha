import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    registerParticipant,
    getEventParticipants,
    markAttendance,
    getMyEvents,
    generateQrToken
} from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (or User authenticated)
router.get('/', authMiddleware, getEvents);
router.get('/my-events', authMiddleware, getMyEvents);
router.get('/:id', authMiddleware, getEventById);
router.post('/:id/register', authMiddleware, registerParticipant);

// QR token generation (admin/dashboard)
router.post('/:id/qr-token', authMiddleware, generateQrToken);

// Admin-only routes (Use authMiddleware, role check inside controller if needed)
router.post('/', authMiddleware, createEvent);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.get('/:id/participants', authMiddleware, getEventParticipants);
router.post('/:id/attendance', authMiddleware, markAttendance);

export default router;
