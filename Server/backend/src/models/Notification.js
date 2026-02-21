import { query } from '../config/db.js';

class Notification {
    /**
     * Create a new notification
     */
    static async create(notificationData) {
        const {
            user_id, type, title, message, icon_name, bg_color
        } = notificationData;

        // Validate notification type
        const validTypes = ['approval', 'reminder', 'alert', 'announcement', 'info', 'update'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid notification type. Valid types: ${validTypes.join(', ')}`);
        }

        const text = `
            INSERT INTO public.notifications (
                user_id, type, title, message, icon_name, bg_color
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [user_id, type, title, message, icon_name, bg_color];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Get notifications for a user
     */
    static async findByUserId(user_id, limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(text, [user_id, limit, offset]);
        return result.rows;
    }

    /**
     * Get unread notifications for a user
     */
    static async findUnreadByUserId(user_id) {
        const text = `
            SELECT * FROM public.notifications
            WHERE user_id = $1 AND is_read = false
            ORDER BY created_at DESC
        `;
        const result = await query(text, [user_id]);
        return result.rows;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id) {
        const text = `
            UPDATE public.notifications
            SET is_read = true
            WHERE id = $1
            RETURNING *
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(user_id) {
        const text = `
            UPDATE public.notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false
            RETURNING id
        `;
        const result = await query(text, [user_id]);
        return result.rows;
    }

    /**
     * Delete notification
     */
    static async delete(id) {
        const text = 'DELETE FROM public.notifications WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Delete all notifications for a user
     */
    static async deleteAllByUserId(user_id) {
        const text = 'DELETE FROM public.notifications WHERE user_id = $1 RETURNING id';
        const result = await query(text, [user_id]);
        return result.rows;
    }

    /**
     * Get notification count for a user
     */
    static async getCountByUserId(user_id) {
        const text = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_read = false THEN 1 END) as unread
            FROM public.notifications
            WHERE user_id = $1
        `;
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Broadcast notification to all users
     */
    static async broadcast(notificationData) {
        const { type, title, message, icon_name, bg_color } = notificationData;

        const text = `
            INSERT INTO public.notifications (user_id, type, title, message, icon_name, bg_color)
            SELECT id, $1, $2, $3, $4, $5
            FROM public.users
            RETURNING id
        `;

        const values = [type, title, message, icon_name, bg_color];
        const result = await query(text, values);
        return { count: result.rowCount, ids: result.rows.map(r => r.id) };
    }

    /**
     * Broadcast to users in specific district
     */
    static async broadcastByDistrict(district, notificationData) {
        const { type, title, message, icon_name, bg_color } = notificationData;

        const text = `
            INSERT INTO public.notifications (user_id, type, title, message, icon_name, bg_color)
            SELECT id, $1, $2, $3, $4, $5
            FROM public.users
            WHERE district = $6
            RETURNING id
        `;

        const values = [type, title, message, icon_name, bg_color, district];
        const result = await query(text, values);
        return { count: result.rowCount, ids: result.rows.map(r => r.id) };
    }
}

export default Notification;
