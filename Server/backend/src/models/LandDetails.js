import { query } from '../config/db.js';

class LandDetails {
    /**
     * Create land details for a user
     */
    static async create(landData) {
        const { user_id, total_land_area, rabi_crop, kharif_crop, zaid_crop } = landData;

        const text = `
            INSERT INTO public.land_details (
                user_id, total_land_area, rabi_crop, kharif_crop, zaid_crop
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [user_id, total_land_area, rabi_crop, kharif_crop, zaid_crop];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find land details by user ID
     */
    static async findByUserId(user_id) {
        const text = `
            SELECT * FROM public.land_details
            WHERE user_id = $1
        `;
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Update land details
     */
    static async update(user_id, landData) {
        const { total_land_area, rabi_crop, kharif_crop, zaid_crop } = landData;

        const text = `
            UPDATE public.land_details
            SET 
                total_land_area = COALESCE($2, total_land_area),
                rabi_crop = COALESCE($3, rabi_crop),
                kharif_crop = COALESCE($4, kharif_crop),
                zaid_crop = COALESCE($5, zaid_crop),
                updated_at = timezone('utc', now())
            WHERE user_id = $1
            RETURNING *
        `;

        const values = [user_id, total_land_area, rabi_crop, kharif_crop, zaid_crop];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete land details
     */
    static async delete(user_id) {
        const text = 'DELETE FROM public.land_details WHERE user_id = $1 RETURNING id';
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Get aggregate statistics
     */
    static async getStatistics() {
        const text = `
            SELECT 
                COUNT(*) as total_farmers_with_land,
                SUM(total_land_area) as total_land_area,
                AVG(total_land_area) as avg_land_area,
                COUNT(CASE WHEN rabi_crop IS NOT NULL THEN 1 END) as rabi_farmers,
                COUNT(CASE WHEN kharif_crop IS NOT NULL THEN 1 END) as kharif_farmers,
                COUNT(CASE WHEN zaid_crop IS NOT NULL THEN 1 END) as zaid_farmers
            FROM public.land_details
        `;
        const result = await query(text);
        return result.rows[0];
    }

    /**
     * Get most common crops by season
     */
    static async getCommonCrops(season) {
        const seasonColumn = {
            'rabi': 'rabi_crop',
            'kharif': 'kharif_crop',
            'zaid': 'zaid_crop'
        }[season];

        if (!seasonColumn) {
            throw new Error('Invalid season. Use: rabi, kharif, or zaid');
        }

        const text = `
            SELECT ${seasonColumn} as crop, COUNT(*) as count
            FROM public.land_details
            WHERE ${seasonColumn} IS NOT NULL
            GROUP BY ${seasonColumn}
            ORDER BY count DESC
            LIMIT 10
        `;
        const result = await query(text);
        return result.rows;
    }
}

export default LandDetails;
