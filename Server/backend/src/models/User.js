import { query } from '../config/db.js';

class User {
    /**
     * Create a new user (farmer)
     */
    static async create(userData) {
        const {
            name, age, gender, photo_url, mobile_number, aadhaar_number,
            fathers_name, mothers_name, educational_qualification,
            sons_married, sons_unmarried, daughters_married, daughters_unmarried,
            other_family_members, village, gram_panchayat, nyay_panchayat,
            post_office, tehsil, block, district, pin_code, state,
            latitude, longitude
        } = userData;

        const text = `
            INSERT INTO public.users (
                name, age, gender, photo_url, mobile_number, aadhaar_number,
                fathers_name, mothers_name, educational_qualification,
                sons_married, sons_unmarried, daughters_married, daughters_unmarried,
                other_family_members, village, gram_panchayat, nyay_panchayat,
                post_office, tehsil, block, district, pin_code, state, location
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23,
                ${latitude && longitude ? 'ST_SetSRID(ST_MakePoint($24, $25), 4326)' : 'NULL'}
            )
            RETURNING *
        `;

        const values = [
            name, age, gender, photo_url, mobile_number, aadhaar_number,
            fathers_name, mothers_name, educational_qualification,
            sons_married || 0, sons_unmarried || 0, daughters_married || 0,
            daughters_unmarried || 0, other_family_members || 0,
            village, gram_panchayat, nyay_panchayat, post_office, tehsil,
            block, district, pin_code, state
        ];

        if (latitude && longitude) {
            values.push(longitude, latitude);
        }

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const text = `
            SELECT 
                id, name, age, gender, photo_url, mobile_number, aadhaar_number,
                fathers_name, mothers_name, educational_qualification,
                sons_married, sons_unmarried, daughters_married, daughters_unmarried,
                other_family_members, village, gram_panchayat, nyay_panchayat,
                post_office, tehsil, block, district, pin_code, state,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                location_address, location_accuracy, location_set_at, location_method,
                is_new_user, created_at, updated_at
            FROM public.users
            WHERE id = $1
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Find user by mobile number
     */
    static async findByMobile(mobile_number) {
        const text = `
            SELECT 
                id, name, age, gender, photo_url, mobile_number, aadhaar_number,
                fathers_name, mothers_name, educational_qualification,
                sons_married, sons_unmarried, daughters_married, daughters_unmarried,
                other_family_members, village, gram_panchayat, nyay_panchayat,
                post_office, tehsil, block, district, pin_code, state,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                location_address, location_accuracy, location_set_at, location_method,
                is_new_user, created_at, updated_at
            FROM public.users
            WHERE mobile_number = $1
        `;
        const result = await query(text, [mobile_number]);
        return result.rows[0];
    }

    /**
     * Get all users with pagination
     */
    static async findAll(limit = 50, offset = 0) {
        const text = `
            SELECT 
                id, name, age, gender, photo_url, mobile_number,
                village, district, state,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                created_at
            FROM public.users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(userData).forEach(key => {
            if (key === 'latitude' || key === 'longitude') return;
            fields.push(`${key} = $${paramCount}`);
            values.push(userData[key]);
            paramCount++;
        });

        if (userData.latitude && userData.longitude) {
            fields.push(`location = ST_SetSRID(ST_MakePoint($${paramCount}, $${paramCount + 1}), 4326)`);
            values.push(userData.longitude, userData.latitude);
            paramCount += 2;
        }

        fields.push(`updated_at = timezone('utc', now())`);
        values.push(id);

        const text = `
            UPDATE public.users
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Delete user
     */
    static async delete(id) {
        const text = 'DELETE FROM public.users WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get users by location (for heatmap)
     */
    static async getUsersByLocation(bounds) {
        const text = `
            SELECT 
                id, name, mobile_number, village, district,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM public.users
            WHERE location IS NOT NULL
            AND ST_Within(
                location::geometry,
                ST_MakeEnvelope($1, $2, $3, $4, 4326)
            )
        `;
        const { minLng, minLat, maxLng, maxLat } = bounds;
        const result = await query(text, [minLng, minLat, maxLng, maxLat]);
        return result.rows;
    }

    /**
     * Search users by district, village, or name
     */
    static async search(searchTerm, limit = 50) {
        const text = `
            SELECT 
                id, name, mobile_number, village, district, state,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM public.users
            WHERE 
                name ILIKE $1 OR
                village ILIKE $1 OR
                district ILIKE $1 OR
                mobile_number ILIKE $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await query(text, [`%${searchTerm}%`, limit]);
        return result.rows;
    }

    /**
     * Get user count by district
     */
    static async getCountByDistrict() {
        const text = `
            SELECT district, COUNT(*) as count
            FROM public.users
            WHERE district IS NOT NULL
            GROUP BY district
            ORDER BY count DESC
        `;
        const result = await query(text);
        return result.rows;
    }
}

export default User;
