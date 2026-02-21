import express from 'express';
import {
    getUserNotifications,
    getMyNotifications,
    createNotification,
    sendBulkNotification,
    broadcastNotification,
    markAsRead,
    markAllAsRead,
    markMyNotificationsAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications/my
 * @desc    Get current user's notifications
 * @access  Protected
 */
router.get('/my', authMiddleware, getMyNotifications);

/**
 * @route   PATCH /api/notifications/my/read-all
 * @desc    Mark all current user's notifications as read
 * @access  Protected
 */
router.patch('/my/read-all', authMiddleware, markMyNotificationsAsRead);

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
 * @route   POST /api/notifications/broadcast
 * @desc    Broadcast notification to all users (or filtered by district)
 * @access  Protected (Admin)
 */
router.post('/broadcast', authMiddleware, broadcastNotification);

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
