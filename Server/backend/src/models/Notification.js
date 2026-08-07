import { randomUUID } from 'crypto';
import { query } from '../config/db.js';

/**
 * A broadcast fans out one row per recipient. `broadcast_id` ties those copies
 * together so the dashboard can list, edit and delete a sent announcement;
 * `district` records who it targeted. Applied lazily (see migration 009) so an
 * un-migrated database still works.
 */
let schemaReady = null;
function ensureSchema() {
    if (!schemaReady) {
        schemaReady = query(`
            ALTER TABLE public.notifications
                ADD COLUMN IF NOT EXISTS broadcast_id UUID,
                ADD COLUMN IF NOT EXISTS district TEXT;
        `).catch((err) => {
            console.warn('Notification schema check failed:', err.message);
        });
    }
    return schemaReady;
}

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
        await ensureSchema();
        const { type, title, message, icon_name, bg_color } = notificationData;
        const broadcastId = randomUUID();

        const text = `
            INSERT INTO public.notifications (user_id, type, title, message, icon_name, bg_color, broadcast_id, district)
            SELECT id, $1, $2, $3, $4, $5, $6, NULL
            FROM public.users
            RETURNING id
        `;

        const values = [type, title, message, icon_name, bg_color, broadcastId];
        const result = await query(text, values);
        return { count: result.rowCount, broadcast_id: broadcastId, ids: result.rows.map(r => r.id) };
    }

    /**
     * Broadcast to users in specific district
     */
    static async broadcastByDistrict(district, notificationData) {
        await ensureSchema();
        const { type, title, message, icon_name, bg_color } = notificationData;
        const broadcastId = randomUUID();

        const text = `
            INSERT INTO public.notifications (user_id, type, title, message, icon_name, bg_color, broadcast_id, district)
            SELECT id, $1, $2, $3, $4, $5, $6, $7
            FROM public.users
            WHERE district = $7
            RETURNING id
        `;

        const values = [type, title, message, icon_name, bg_color, broadcastId, district];
        const result = await query(text, values);
        return { count: result.rowCount, broadcast_id: broadcastId, ids: result.rows.map(r => r.id) };
    }

    /**
     * List sent broadcasts, one row per broadcast rather than per recipient.
     */
    static async listBroadcasts(limit = 50, offset = 0) {
        await ensureSchema();
        const text = `
            SELECT
                broadcast_id,
                MIN(type)          AS type,
                MIN(title)         AS title,
                MIN(message)       AS message,
                MIN(district)      AS district,
                COUNT(*)::int      AS recipients_count,
                COUNT(*) FILTER (WHERE is_read)::int AS read_count,
                MIN(created_at)    AS sent_at
            FROM public.notifications
            WHERE broadcast_id IS NOT NULL
            GROUP BY broadcast_id
            ORDER BY MIN(created_at) DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Edit every copy of an already-sent broadcast.
     */
    static async updateBroadcast(broadcastId, { type, title, message }) {
        await ensureSchema();

        const fields = [];
        const values = [];
        let paramCount = 1;

        if (type !== undefined) { fields.push(`type = $${paramCount++}`); values.push(type); }
        if (title !== undefined) { fields.push(`title = $${paramCount++}`); values.push(title); }
        if (message !== undefined) { fields.push(`message = $${paramCount++}`); values.push(message); }

        if (fields.length === 0) return { count: 0 };

        values.push(broadcastId);
        const text = `
            UPDATE public.notifications
            SET ${fields.join(', ')}
            WHERE broadcast_id = $${paramCount}
            RETURNING id
        `;
        const result = await query(text, values);
        return { count: result.rowCount };
    }

    /**
     * Delete every copy of a broadcast (recalls it from all recipients).
     */
    static async deleteBroadcast(broadcastId) {
        await ensureSchema();
        const text = 'DELETE FROM public.notifications WHERE broadcast_id = $1 RETURNING id';
        const result = await query(text, [broadcastId]);
        return { count: result.rowCount };
    }
}

export default Notification;
