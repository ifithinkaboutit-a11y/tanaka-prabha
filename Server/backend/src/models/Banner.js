import { query } from '../config/db.js';

class Banner {
    /**
     * Create a new banner
     */
    static async create(bannerData) {
        const { title, subtitle, image_url, redirect_url, sort_order, is_active } = bannerData;

        const text = `
            INSERT INTO public.banners (
                title, subtitle, image_url, redirect_url, sort_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            title,
            subtitle,
            image_url,
            redirect_url,
            sort_order || 0,
            is_active !== false
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find banner by ID
     */
    static async findById(id) {
        const text = 'SELECT * FROM public.banners WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get all active banners (sorted by sort_order)
     */
    static async findAllActive() {
        const text = `
            SELECT * FROM public.banners
            WHERE is_active = true
            ORDER BY sort_order ASC, created_at DESC
        `;
        const result = await query(text);
        return result.rows;
    }

    /**
     * Get all banners (including inactive)
     */
    static async findAll() {
        const text = `
            SELECT * FROM public.banners
            ORDER BY sort_order ASC, created_at DESC
        `;
        const result = await query(text);
        return result.rows;
    }

    /**
     * Update banner
     */
    static async update(id, bannerData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(bannerData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            values.push(bannerData[key]);
            paramCount++;
        });

        values.push(id);

        const text = `
            UPDATE public.banners
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete banner
     */
    static async delete(id) {
        const text = 'DELETE FROM public.banners WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Reorder banners
     */
    static async reorder(orderedIds) {
        const promises = orderedIds.map((id, index) => {
            const text = 'UPDATE public.banners SET sort_order = $1 WHERE id = $2';
            return query(text, [index, id]);
        });
        await Promise.all(promises);
        return { success: true, message: 'Banners reordered successfully' };
    }

    /**
     * Toggle banner active status
     */
    static async toggleActive(id) {
        const text = `
            UPDATE public.banners
            SET is_active = NOT is_active
            WHERE id = $1
            RETURNING *
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }
}

export default Banner;
