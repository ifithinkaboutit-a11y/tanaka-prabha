import { query } from '../config/db.js';

class Scheme {
    /**
     * Create a new scheme
     */
    static async create(schemeData) {
        const {
            title, description, category, image_url, hero_image_url,
            location, event_date, key_objectives, overview, process,
            support_contact, apply_url, is_active
        } = schemeData;

        const text = `
            INSERT INTO public.schemes (
                title, description, category, image_url, hero_image_url,
                location, event_date, key_objectives, overview, process,
                support_contact, apply_url, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            title, description, category, image_url, hero_image_url,
            location, event_date, key_objectives, overview, process,
            support_contact, apply_url, is_active !== false
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find scheme by ID
     */
    static async findById(id) {
        const text = 'SELECT * FROM public.schemes WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get all active schemes
     */
    static async findAllActive(limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.schemes
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Get all schemes (including inactive)
     */
    static async findAll(limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.schemes
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Get schemes by category
     */
    static async findByCategory(category, limit = 50) {
        const text = `
            SELECT * FROM public.schemes
            WHERE category = $1 AND is_active = true
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await query(text, [category, limit]);
        return result.rows;
    }

    /**
     * Search schemes
     */
    static async search(searchTerm, limit = 50) {
        const text = `
            SELECT * FROM public.schemes
            WHERE is_active = true
            AND (
                title ILIKE $1 OR
                description ILIKE $1 OR
                category ILIKE $1 OR
                overview ILIKE $1
            )
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await query(text, [`%${searchTerm}%`, limit]);
        return result.rows;
    }

    /**
     * Update scheme
     */
    static async update(id, schemeData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(schemeData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            values.push(schemeData[key]);
            paramCount++;
        });

        values.push(id);

        const text = `
            UPDATE public.schemes
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete scheme (soft delete by setting is_active to false)
     */
    static async delete(id) {
        const text = `
            UPDATE public.schemes
            SET is_active = false
            WHERE id = $1
            RETURNING id
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get all categories
     */
    static async getCategories() {
        const text = `
            SELECT DISTINCT category, COUNT(*) as count
            FROM public.schemes
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
        `;
        const result = await query(text);
        return result.rows;
    }

    /**
     * Get upcoming events
     */
    static async getUpcomingEvents(limit = 10) {
        const text = `
            SELECT * FROM public.schemes
            WHERE is_active = true
            AND event_date IS NOT NULL
            AND event_date > timezone('utc', now())
            ORDER BY event_date ASC
            LIMIT $1
        `;
        const result = await query(text, [limit]);
        return result.rows;
    }
}

export default Scheme;
