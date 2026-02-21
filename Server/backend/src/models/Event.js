import { query } from '../config/db.js';

class Event {
    static async create(eventData) {
        const {
            title, description, date, start_time, end_time,
            location_name, location_address, instructors,
            guidelines_and_rules, requirements, hero_image_url, status
        } = eventData;

        const text = `
            INSERT INTO public.events (
                title, description, date, start_time, end_time,
                location_name, location_address, instructors,
                guidelines_and_rules, requirements, hero_image_url, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING *
        `;

        const values = [
            title, description, date, start_time, end_time,
            location_name, location_address,
            instructors ? JSON.stringify(instructors) : '[]',
            guidelines_and_rules, requirements, hero_image_url,
            status || 'upcoming'
        ];

        const result = await query(text, values);
        return result.rows[0];
    }

    static async findById(id) {
        const text = 'SELECT * FROM public.events WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    static async findAll(limit = 50, offset = 0) {
        const text = `
            SELECT * FROM public.events 
            ORDER BY date ASC, start_time ASC
            LIMIT $1 OFFSET $2
        `;
        const result = await query(text, [limit, offset]);
        return result.rows;
    }

    static async update(id, eventData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(eventData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            if (key === 'instructors') {
                values.push(JSON.stringify(eventData[key]));
            } else {
                values.push(eventData[key]);
            }
            paramCount++;
        });

        if (fields.length === 0) return this.findById(id);

        fields.push(`updated_at = timezone('utc', now())`);
        values.push(id);

        const text = `
            UPDATE public.events 
            SET ${fields.join(', ')} 
            WHERE id = $${paramCount} 
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    static async delete(id) {
        const text = 'DELETE FROM public.events WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }
}

export default Event;
