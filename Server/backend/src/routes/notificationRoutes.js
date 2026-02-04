import express from 'express';
import {
    getUserNotifications,
    createNotification,
    sendBulkNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications/user/:user_id
 * @desc    Get notifications for a user
 * @access  Protected
 */
router.get('/user/:user_id', authMiddleware, getUserNotifications);

/**
 * @route   POST /api/notifications
 * @desc    Create a notification
 * @access  Protected
 */
router.post('/', authMiddleware, createNotification);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Send notification to multiple users
 * @access  Protected
 */
router.post('/bulk', authMiddleware, sendBulkNotification);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Protected
 */
router.patch('/:id/read', authMiddleware, markAsRead);

/**
 * @route   PATCH /api/notifications/user/:user_id/read-all
 * @desc    Mark all notifications as read for a user
 * @access  Protected
 */
router.patch('/user/:user_id/read-all', authMiddleware, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Protected
 */
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
