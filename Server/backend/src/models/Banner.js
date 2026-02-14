import { query } from '../config/db.js';

class Banner {
    /**
     * Create a new banner
     * Supports multi-language fields (English and Hindi)
     */
    static async create(bannerData) {
        const { 
            title, subtitle, 
            title_hi, subtitle_hi,
            image_url, redirect_url, sort_order, is_active 
        } = bannerData;

        const text = `
            INSERT INTO public.banners (
                title, subtitle, title_hi, subtitle_hi,
                image_url, redirect_url, sort_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            title,
            subtitle,
            title_hi || null,
            subtitle_hi || null,
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
     * Only updates fields that exist in the database
     */
    static async update(id, bannerData) {
        // List of allowed fields to update (prevents SQL injection and handles missing columns)
        const allowedFields = [
            'title', 'subtitle', 'title_hi', 'subtitle_hi',
            'image_url', 'redirect_url', 'sort_order', 'is_active', 'scheme_id'
        ];
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(bannerData).forEach(key => {
            // Only include fields that are in the allowed list and have a value
            if (allowedFields.includes(key) && bannerData[key] !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(bannerData[key]);
                paramCount++;
            }
        });

        // If no valid fields to update, return the existing banner
        if (fields.length === 0) {
            return Banner.findById(id);
        }

        values.push(id);

        const text = `
            UPDATE public.banners
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await query(text, values);
            return result.rows[0];
        } catch (error) {
            // If Hindi columns don't exist yet, retry without them
            if (error.code === '42703' && (error.message.includes('title_hi') || error.message.includes('subtitle_hi'))) {
                console.warn('Hindi columns not found in banners table. Updating without Hindi fields...');
                
                // Filter out Hindi fields and retry
                const fallbackFields = [];
                const fallbackValues = [];
                let fallbackParamCount = 1;
                
                Object.keys(bannerData).forEach(key => {
                    if (allowedFields.includes(key) && 
                        bannerData[key] !== undefined && 
                        !key.endsWith('_hi')) {
                        fallbackFields.push(`${key} = $${fallbackParamCount}`);
                        fallbackValues.push(bannerData[key]);
                        fallbackParamCount++;
                    }
                });
                
                if (fallbackFields.length === 0) {
                    return Banner.findById(id);
                }
                
                fallbackValues.push(id);
                
                const fallbackText = `
                    UPDATE public.banners
                    SET ${fallbackFields.join(', ')}
                    WHERE id = $${fallbackParamCount}
                    RETURNING *
                `;
                
                const fallbackResult = await query(fallbackText, fallbackValues);
                return fallbackResult.rows[0];
            }
            throw error;
        }
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
