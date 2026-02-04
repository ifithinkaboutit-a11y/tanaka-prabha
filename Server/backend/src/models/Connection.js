import { query } from '../config/db.js';

class Connection {
    /**
     * Create a new connection (log interaction)
     */
    static async create(connectionData) {
        const { user_id, professional_id, method } = connectionData;

        // Validate connection method
        const validMethods = ['call', 'chat', 'appointment'];
        if (!validMethods.includes(method)) {
            throw new Error(`Invalid connection method. Valid methods: ${validMethods.join(', ')}`);
        }

        const text = `
            INSERT INTO public.connections (
                user_id, professional_id, method
            ) VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [user_id, professional_id, method];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Get connections for a user
     */
    static async findByUserId(user_id, limit = 50, offset = 0) {
        const text = `
            SELECT 
                c.*,
                p.name as professional_name,
                p.role as professional_role,
                p.department,
                p.image_url as professional_image
            FROM public.connections c
            LEFT JOIN public.professionals p ON c.professional_id = p.id
            WHERE c.user_id = $1
            ORDER BY c.connected_on DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(text, [user_id, limit, offset]);
        return result.rows;
    }

    /**
     * Get connections for a professional
     */
    static async findByProfessionalId(professional_id, limit = 50, offset = 0) {
        const text = `
            SELECT 
                c.*,
                u.name as user_name,
                u.mobile_number,
                u.village,
                u.district
            FROM public.connections c
            LEFT JOIN public.users u ON c.user_id = u.id
            WHERE c.professional_id = $1
            ORDER BY c.connected_on DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await query(text, [professional_id, limit, offset]);
        return result.rows;
    }

    /**
     * Get recent connections for a user (for "Recent Connections" feature)
     */
    static async getRecentByUserId(user_id, limit = 10) {
        const text = `
            SELECT DISTINCT ON (p.id)
                c.id as connection_id,
                c.method,
                c.connected_on,
                p.id as professional_id,
                p.name,
                p.role,
                p.department,
                p.image_url,
                p.phone_number,
                p.is_available
            FROM public.connections c
            JOIN public.professionals p ON c.professional_id = p.id
            WHERE c.user_id = $1
            ORDER BY p.id, c.connected_on DESC
            LIMIT $2
        `;
        const result = await query(text, [user_id, limit]);
        return result.rows;
    }

    /**
     * Get connection statistics for a user
     */
    static async getStatsByUserId(user_id) {
        const text = `
            SELECT 
                COUNT(*) as total_connections,
                COUNT(CASE WHEN method = 'call' THEN 1 END) as calls,
                COUNT(CASE WHEN method = 'chat' THEN 1 END) as chats,
                COUNT(CASE WHEN method = 'appointment' THEN 1 END) as appointments,
                COUNT(DISTINCT professional_id) as unique_professionals
            FROM public.connections
            WHERE user_id = $1
        `;
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Get connection statistics for a professional
     */
    static async getStatsByProfessionalId(professional_id) {
        const text = `
            SELECT 
                COUNT(*) as total_connections,
                COUNT(CASE WHEN method = 'call' THEN 1 END) as calls,
                COUNT(CASE WHEN method = 'chat' THEN 1 END) as chats,
                COUNT(CASE WHEN method = 'appointment' THEN 1 END) as appointments,
                COUNT(DISTINCT user_id) as unique_users
            FROM public.connections
            WHERE professional_id = $1
        `;
        const result = await query(text, [professional_id]);
        return result.rows[0];
    }

    /**
     * Get most contacted professionals (analytics)
     */
    static async getMostContacted(limit = 10) {
        const text = `
            SELECT 
                p.*,
                COUNT(c.id) as connection_count
            FROM public.professionals p
            LEFT JOIN public.connections c ON p.id = c.professional_id
            GROUP BY p.id
            ORDER BY connection_count DESC
            LIMIT $1
        `;
        const result = await query(text, [limit]);
        return result.rows;
    }

    /**
     * Delete connection
     */
    static async delete(id) {
        const text = 'DELETE FROM public.connections WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get connection trends (connections per day for last N days)
     */
    static async getConnectionTrends(days = 30) {
        const text = `
            SELECT 
                DATE(connected_on) as date,
                COUNT(*) as count,
                COUNT(CASE WHEN method = 'call' THEN 1 END) as calls,
                COUNT(CASE WHEN method = 'chat' THEN 1 END) as chats,
                COUNT(CASE WHEN method = 'appointment' THEN 1 END) as appointments
            FROM public.connections
            WHERE connected_on >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(connected_on)
            ORDER BY date DESC
        `;
        const result = await query(text);
        return result.rows;
    }
}

export default Connection;
