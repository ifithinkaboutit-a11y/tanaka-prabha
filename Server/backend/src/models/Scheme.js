import { query } from '../config/db.js';

class Scheme {
    /**
     * Create a new scheme
     * Supports multi-language fields (English and Hindi)
     */
    static async create(schemeData) {
        const {
            // English fields
            title, description, overview, process, eligibility, key_objectives,
            // Hindi fields
            title_hi, description_hi, overview_hi, process_hi, eligibility_hi, key_objectives_hi,
            // Shared fields
            category, image_url, hero_image_url,
            location, event_date, documents_required, tags,
            support_contact, apply_url, is_active, is_featured
        } = schemeData;

        const text = `
            INSERT INTO public.schemes (
                title, description, overview, process, eligibility, key_objectives,
                title_hi, description_hi, overview_hi, process_hi, eligibility_hi, key_objectives_hi,
                category, image_url, hero_image_url,
                location, event_date, documents_required, tags,
                support_contact, apply_url, is_active, is_featured
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12,
                $13, $14, $15,
                $16, $17, $18, $19,
                $20, $21, $22, $23
            )
            RETURNING *
        `;

        const values = [
            // English
            title, description, overview, process, eligibility, key_objectives,
            // Hindi
            title_hi || null, description_hi || null, overview_hi || null, 
            process_hi || null, eligibility_hi || null, key_objectives_hi || null,
            // Shared
            category, image_url, hero_image_url,
            location, event_date, documents_required, tags,
            support_contact, apply_url, is_active !== false, is_featured || false
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
     * Only updates fields that exist in the database
     */
    static async update(id, schemeData) {
        // List of allowed fields to update
        const allowedFields = [
            // English fields
            'title', 'description', 'overview', 'process', 'eligibility', 'key_objectives',
            // Hindi fields
            'title_hi', 'description_hi', 'overview_hi', 'process_hi', 'eligibility_hi', 'key_objectives_hi',
            // Shared fields
            'category', 'image_url', 'hero_image_url', 'location', 'event_date',
            'documents_required', 'tags', 'support_contact', 'apply_url', 'is_active', 'is_featured'
        ];
        
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(schemeData).forEach(key => {
            if (allowedFields.includes(key) && schemeData[key] !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(schemeData[key]);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return Scheme.findById(id);
        }

        values.push(id);

        const text = `
            UPDATE public.schemes
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await query(text, values);
            return result.rows[0];
        } catch (error) {
            // If Hindi columns don't exist yet, retry without them
            if (error.code === '42703' && error.message.includes('_hi')) {
                console.warn('Hindi columns not found in schemes table. Updating without Hindi fields...');
                
                const fallbackFields = [];
                const fallbackValues = [];
                let fallbackParamCount = 1;
                
                Object.keys(schemeData).forEach(key => {
                    if (allowedFields.includes(key) && 
                        schemeData[key] !== undefined && 
                        !key.endsWith('_hi')) {
                        fallbackFields.push(`${key} = $${fallbackParamCount}`);
                        fallbackValues.push(schemeData[key]);
                        fallbackParamCount++;
                    }
                });
                
                if (fallbackFields.length === 0) {
                    return Scheme.findById(id);
                }
                
                fallbackValues.push(id);
                
                const fallbackText = `
                    UPDATE public.schemes
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
