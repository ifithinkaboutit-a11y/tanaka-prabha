import { query } from '../config/db.js';

class AuditLog {
    /**
     * Create an audit log entry
     */
    static async create({ user_id, action, entity_id, metadata, ip_address, user_agent }) {
        const text = `
            INSERT INTO public.audit_logs (user_id, action, entity_id, metadata, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            user_id || null,
            action,
            entity_id || null,
            JSON.stringify(metadata || {}),
            ip_address || null,
            user_agent || null,
        ];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find audit logs with optional filters
     */
    static async findAll({ action, user_id, entity_id, limit = 50, offset = 0 } = {}) {
        let text = 'SELECT * FROM public.audit_logs WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (action) {
            text += ` AND action = $${paramIndex++}`;
            values.push(action);
        }
        if (user_id) {
            text += ` AND user_id = $${paramIndex++}`;
            values.push(user_id);
        }
        if (entity_id) {
            text += ` AND entity_id = $${paramIndex++}`;
            values.push(entity_id);
        }

        text += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        values.push(parseInt(limit), parseInt(offset));

        const result = await query(text, values);
        return result.rows;
    }

    /**
     * Get counts by action type
     */
    static async getActionCounts({ since } = {}) {
        let text = 'SELECT action, COUNT(*) as count FROM public.audit_logs WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (since) {
            text += ` AND created_at >= $${paramIndex++}`;
            values.push(since);
        }

        text += ' GROUP BY action ORDER BY count DESC';
        const result = await query(text, values);
        return result.rows;
    }
}

export default AuditLog;
