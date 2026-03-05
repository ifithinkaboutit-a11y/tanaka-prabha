import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ─── Expo Push API helper ────────────────────────────────────────────────────
// Sends push notifications via Expo's free push service (no account needed)
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notifications to a list of Expo push tokens.
 * Expo accepts up to 100 tokens per request — we chunk automatically.
 * @param {Array<{token:string, title:string, body:string, data?:object}>} messages
 */
async function sendExpoPushNotifications(messages) {
    if (!messages || messages.length === 0) return;

    // Chunk into batches of 100 (Expo's limit)
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
        chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });
            const result = await response.json();
            console.log(`📲 Expo push sent to ${chunk.length} devices:`, result?.data?.[0]?.status || 'ok');
        } catch (err) {
            console.error('📲 Expo push delivery error:', err.message);
        }
    }
}

// ─── Register Expo Push Token ────────────────────────────────────────────────
/**
 * @route   POST /api/notifications/register-token
 * @desc    Store device's Expo push token against the authenticated user
 * @access  Protected
 */
export const registerPushToken = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { push_token, platform } = req.body;

        if (!push_token) {
            return res.status(400).json({ status: 'error', message: 'push_token is required' });
        }

        await User.savePushToken(userId, push_token, platform || 'unknown');

        res.status(200).json({
            status: 'success',
            message: 'Push token registered successfully',
        });
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({ status: 'error', message: 'Failed to register push token' });
    }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { limit = 50, offset = 0, unread_only } = req.query;

        let notifications;
        if (unread_only === 'true') {
            notifications = await Notification.findUnreadByUserId(user_id);
        } else {
            notifications = await Notification.findByUserId(user_id, parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: notifications.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a notification
 */
export const createNotification = async (req, res) => {
    try {
        const notificationData = req.body;

        if (!notificationData.user_id || !notificationData.title || !notificationData.type) {
            return res.status(400).json({
                status: 'error',
                message: 'user_id, title, and type are required'
            });
        }

        const notification = await Notification.create(notificationData);

        res.status(201).json({
            status: 'success',
            message: 'Notification created successfully',
            data: { notification }
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotification = async (req, res) => {
    try {
        const { user_ids, type, title, message, icon_name, bg_color } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'user_ids array is required and must not be empty'
            });
        }

        if (!title || !type) {
            return res.status(400).json({
                status: 'error',
                message: 'title and type are required'
            });
        }

        const notifications = await Promise.all(
            user_ids.map(user_id =>
                Notification.create({ user_id, type, title, message, icon_name, bg_color })
            )
        );

        res.status(201).json({
            status: 'success',
            message: `Notifications sent to ${notifications.length} users`,
            data: { count: notifications.length }
        });
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.markAsRead(id);

        if (!notification) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification marked as read',
            data: { notification }
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark notification as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (req, res) => {
    try {
        const { user_id } = req.params;

        const notifications = await Notification.markAllAsRead(user_id);

        res.status(200).json({
            status: 'success',
            message: `${notifications.length} notifications marked as read`
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark notifications as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Notification.delete(id);

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get current user's notifications (from JWT token)
 */
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 50, offset = 0, unread_only } = req.query;

        let notifications;
        if (unread_only === 'true') {
            notifications = await Notification.findUnreadByUserId(userId);
        } else {
            notifications = await Notification.findByUserId(userId, parseInt(limit), parseInt(offset));
        }

        res.status(200).json({
            status: 'success',
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: notifications.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching my notifications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mark all current user's notifications as read
 */
export const markMyNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await Notification.markAllAsRead(userId);

        res.status(200).json({
            status: 'success',
            message: `${notifications.length} notifications marked as read`
        });
    } catch (error) {
        console.error('Error marking my notifications as read:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark notifications as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Broadcast notification to ALL users (or filtered by district)
 * ── Also fires real Expo push notifications to registered devices ──
 * @route POST /api/notifications/broadcast
 * Body: { title, message, type, district?, icon_name?, bg_color? }
 */
export const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type = 'announcement', district, icon_name, bg_color } = req.body;

        if (!title) {
            return res.status(400).json({ status: 'error', message: 'title is required' });
        }

        const notificationData = { type, title, message, icon_name, bg_color };

        // 1️⃣ Insert in-app notification rows into DB
        let dbResult;
        if (district && district !== 'all') {
            dbResult = await Notification.broadcastByDistrict(district, notificationData);
        } else {
            dbResult = await Notification.broadcast(notificationData);
        }

        // 2️⃣ Fetch devices that have registered push tokens
        let usersWithTokens;
        if (district && district !== 'all') {
            usersWithTokens = await User.getPushTokensByDistrict(district);
        } else {
            usersWithTokens = await User.getAllPushTokens();
        }

        // 3️⃣ Build Expo push message payload and fire
        const pushMessages = usersWithTokens.map(u => ({
            to: u.expo_push_token,
            title,
            body: message || '',
            sound: 'default',
            data: { type, district: district || 'all' },
            channelId: 'default',
        }));

        // Fire-and-forget — don't block the HTTP response
        sendExpoPushNotifications(pushMessages).catch(err =>
            console.error('📲 Background push error:', err)
        );

        res.status(201).json({
            status: 'success',
            message: `Notification sent to ${dbResult.count} users (${usersWithTokens.length} will receive push)`,
            data: {
                db_count: dbResult.count,
                push_count: usersWithTokens.length,
            },
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to broadcast notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
