import { query } from '../config/db.js';

class LivestockDetails {
    /**
     * Create livestock details for a user
     */
    static async create(livestockData) {
        const {
            user_id, cow, buffalo, goat, sheep, pig, poultry, others
        } = livestockData;

        const text = `
            INSERT INTO public.livestock_details (
                user_id, cow, buffalo, goat, sheep, pig, poultry, others
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            user_id,
            cow || 0,
            buffalo || 0,
            goat || 0,
            sheep || 0,
            pig || 0,
            poultry || 0,
            others || 0
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find livestock details by user ID
     */
    static async findByUserId(user_id) {
        const text = `
            SELECT * FROM public.livestock_details
            WHERE user_id = $1
        `;
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Update livestock details
     */
    static async update(user_id, livestockData) {
        const { cow, buffalo, goat, sheep, pig, poultry, others } = livestockData;

        const text = `
            UPDATE public.livestock_details
            SET 
                cow = COALESCE($2, cow),
                buffalo = COALESCE($3, buffalo),
                goat = COALESCE($4, goat),
                sheep = COALESCE($5, sheep),
                pig = COALESCE($6, pig),
                poultry = COALESCE($7, poultry),
                others = COALESCE($8, others),
                updated_at = timezone('utc', now())
            WHERE user_id = $1
            RETURNING *
        `;

        const values = [user_id, cow, buffalo, goat, sheep, pig, poultry, others];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete livestock details
     */
    static async delete(user_id) {
        const text = 'DELETE FROM public.livestock_details WHERE user_id = $1 RETURNING id';
        const result = await query(text, [user_id]);
        return result.rows[0];
    }

    /**
     * Get aggregate livestock statistics
     */
    static async getStatistics() {
        const text = `
            SELECT 
                COUNT(*) as total_farmers_with_livestock,
                SUM(cow) as total_cows,
                SUM(buffalo) as total_buffaloes,
                SUM(goat) as total_goats,
                SUM(sheep) as total_sheep,
                SUM(pig) as total_pigs,
                SUM(poultry) as total_poultry,
                SUM(others) as total_others,
                AVG(cow + buffalo + goat + sheep + pig + poultry + others) as avg_livestock_per_farmer
            FROM public.livestock_details
        `;
        const result = await query(text);
        return result.rows[0];
    }

    /**
     * Get farmers with specific livestock type
     */
    static async findByLivestockType(livestockType, minCount = 1) {
        const validTypes = ['cow', 'buffalo', 'goat', 'sheep', 'pig', 'poultry', 'others'];
        
        if (!validTypes.includes(livestockType)) {
            throw new Error(`Invalid livestock type. Valid types: ${validTypes.join(', ')}`);
        }

        const text = `
            SELECT ld.*, u.name, u.mobile_number, u.village, u.district
            FROM public.livestock_details ld
            JOIN public.users u ON ld.user_id = u.id
            WHERE ld.${livestockType} >= $1
            ORDER BY ld.${livestockType} DESC
        `;
        
        const result = await query(text, [minCount]);
        return result.rows;
    }
}

export default LivestockDetails;
