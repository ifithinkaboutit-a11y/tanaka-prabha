import express from 'express';
import { reverseGeocode } from '../controllers/geocodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Reverse geocoding endpoint
// GET /api/geocode/reverse?lat=12.34&lng=56.78
// We require authentication to prevent abuse of the generic geocoding endpoint
router.get('/reverse', authenticate, reverseGeocode);

export default router;
