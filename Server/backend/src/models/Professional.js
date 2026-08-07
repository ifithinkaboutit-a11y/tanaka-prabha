import { query } from '../config/db.js';

// Columns a client is allowed to write. Anything else in the request body is
// ignored instead of being interpolated into SQL — an unknown key used to make
// UPDATE fail with "column ... does not exist" and abort the whole save.
const WRITABLE_COLUMNS = [
    'name', 'name_hi', 'role', 'role_hi', 'department', 'department_hi',
    'category', 'image_url', 'phone_number', 'email', 'description', 'description_hi',
    'state', 'district', 'block', 'service_area', 'specializations', 'specializations_hi',
    'qualifications', 'is_available', 'available_days', 'available_hours',
];

const JSONB_COLUMNS = ['service_area', 'specializations', 'specializations_hi', 'qualifications'];

/**
 * The dashboard collects description/state and treats `role` as optional, but
 * older databases predate those columns and declare role NOT NULL. Run the
 * additive part of migration 009 once per process so writes never 500 on a
 * database that has not had the migration applied yet.
 */
let schemaReady = null;
function ensureSchema() {
    if (!schemaReady) {
        schemaReady = query(`
            ALTER TABLE public.professionals
                ADD COLUMN IF NOT EXISTS description TEXT,
                ADD COLUMN IF NOT EXISTS description_hi TEXT,
                ADD COLUMN IF NOT EXISTS state TEXT,
                ADD COLUMN IF NOT EXISTS email TEXT;
            ALTER TABLE public.professionals
                ALTER COLUMN role DROP NOT NULL;
        `).catch((err) => {
            // Never block a write on this — surface the real error from the query itself.
            console.warn('Professional schema check failed:', err.message);
        });
    }
    return schemaReady;
}

/** Normalise a value for its column (JSONB columns need serialising). */
function normalise(key, value) {
    if (JSONB_COLUMNS.includes(key) && value != null && typeof value !== 'string') {
        return JSON.stringify(value);
    }
    return value;
}

class Professional {
    /**
     * Create a new professional
     */
    static async create(professionalData) {
        await ensureSchema();

        const columns = [];
        const values = [];

        WRITABLE_COLUMNS.forEach((key) => {
            if (professionalData[key] === undefined) return;
            columns.push(key);
            values.push(normalise(key, professionalData[key]));
        });

        // Availability defaults to true when the caller says nothing.
        if (!columns.includes('is_available')) {
            columns.push('is_available');
            values.push(professionalData.is_available !== false);
        }

        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const text = `
            INSERT INTO public.professionals (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `;

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
        await ensureSchema();

        const fields = [];
        const values = [];
        let paramCount = 1;

        WRITABLE_COLUMNS.forEach(key => {
            if (professionalData[key] === undefined) return;
            fields.push(`${key} = $${paramCount}`);
            values.push(normalise(key, professionalData[key]));
            paramCount++;
        });

        if (fields.length === 0) {
            return Professional.findById(id);
        }

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
