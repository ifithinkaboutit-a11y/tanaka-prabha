import { query } from '../config/db.js';

class Professional {
    /**
     * Create a new professional
     */
    static async create(professionalData) {
        const {
            name, role, department, category, image_url, phone_number,
            district, service_area, specializations, is_available
        } = professionalData;

        const text = `
            INSERT INTO public.professionals (
                name, role, department, category, image_url, phone_number,
                district, service_area, specializations, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            name, role, department, category, image_url, phone_number,
            district,
            service_area ? (typeof service_area === 'string' ? service_area : JSON.stringify(service_area)) : null,
            specializations ? (typeof specializations === 'string' ? specializations : JSON.stringify(specializations)) : null,
            is_available !== false
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find professional by ID
     */
    static async findById(id) {
        const text = 'SELECT * FROM public.professionals WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get all available professionals
     */
    static async findAllAvailable(limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.professionals
            WHERE is_available = true
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Get all professionals (including unavailable)
     */
    static async findAll(limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.professionals
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Get professionals by category
     */
    static async findByCategory(category, limit = 50) {
        const text = `
            SELECT * FROM public.professionals
            WHERE category = $1 AND is_available = true
            ORDER BY name ASC
            LIMIT $2
        `;
        const result = await query(text, [category, limit]);
        return result.rows;
    }

    /**
     * Get professionals by district
     */
    static async findByDistrict(district, limit = 50) {
        const text = `
            SELECT * FROM public.professionals
            WHERE district = $1 AND is_available = true
            ORDER BY name ASC
            LIMIT $2
        `;
        const result = await query(text, [district, limit]);
        return result.rows;
    }

    /**
     * Get professionals by department
     */
    static async findByDepartment(department, limit = 50) {
        const text = `
            SELECT * FROM public.professionals
            WHERE department = $1 AND is_available = true
            ORDER BY name ASC
            LIMIT $2
        `;
        const result = await query(text, [department, limit]);
        return result.rows;
    }

    /**
     * Search professionals
     */
    static async search(searchTerm, limit = 50) {
        const text = `
            SELECT * FROM public.professionals
            WHERE is_available = true
            AND (
                name ILIKE $1 OR
                role ILIKE $1 OR
                department ILIKE $1 OR
                category ILIKE $1 OR
                district ILIKE $1
            )
            ORDER BY name ASC
            LIMIT $2
        `;
        const result = await query(text, [`%${searchTerm}%`, limit]);
        return result.rows;
    }

    /**
     * Update professional
     */
    static async update(id, professionalData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        const jsonbColumns = ['service_area', 'specializations'];

        Object.keys(professionalData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            let val = professionalData[key];
            if (jsonbColumns.includes(key) && val != null && typeof val !== 'string') {
                val = JSON.stringify(val);
            }
            values.push(val);
            paramCount++;
        });

        values.push(id);

        const text = `
            UPDATE public.professionals
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete professional
     */
    static async delete(id) {
        const text = 'DELETE FROM public.professionals WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Toggle availability
     */
    static async toggleAvailability(id) {
        const text = `
            UPDATE public.professionals
            SET is_available = NOT is_available
            WHERE id = $1
            RETURNING *
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
            FROM public.professionals
            WHERE is_available = true
            GROUP BY category
            ORDER BY count DESC
        `;
        const result = await query(text);
        return result.rows;
    }

    /**
     * Get all departments
     */
    static async getDepartments() {
        const text = `
            SELECT DISTINCT department, COUNT(*) as count
            FROM public.professionals
            WHERE is_available = true AND department IS NOT NULL
            GROUP BY department
            ORDER BY count DESC
        `;
        const result = await query(text);
        return result.rows;
    }
}

export default Professional;
