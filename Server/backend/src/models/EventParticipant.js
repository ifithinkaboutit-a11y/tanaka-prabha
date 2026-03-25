import { query } from '../config/db.js';

class EventParticipant {
    static async register(event_id, user_id, mobile_number, name) {
        const text = `
            INSERT INTO public.event_participants (
                event_id, user_id, mobile_number, name, status
            ) VALUES (
                $1, $2, $3, $4, 'registered'
            )
            ON CONFLICT (event_id, mobile_number) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                name = EXCLUDED.name,
                updated_at = timezone('utc', now())
            RETURNING *
        `;
        const values = [event_id, user_id || null, mobile_number, name];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async markAttendance(event_id, mobile_number) {
        const text = `
            UPDATE public.event_participants
            SET status = 'attended', updated_at = timezone('utc', now())
            WHERE event_id = $1 AND mobile_number = $2
            RETURNING *
        `;
        const result = await query(text, [event_id, mobile_number]);
        return result.rows[0];
    }

    static async findByEventId(event_id) {
        const text = `
            SELECT ep.*, u.photo_url 
            FROM public.event_participants ep
            LEFT JOIN public.users u ON ep.user_id = u.id
            WHERE ep.event_id = $1
            ORDER BY ep.created_at DESC
        `;
        const result = await query(text, [event_id]);
        return result.rows;
    }

    static async findAttendance(event_id, mobile_number) {
        const text = `
            SELECT * FROM public.event_participants
            WHERE event_id = $1 AND mobile_number = $2
        `;
        const result = await query(text, [event_id, mobile_number]);
        return result.rows[0] || null;
    }

    static async findByUserId(user_id) {
        const text = `
            SELECT ep.*, e.title, e.date, e.start_time, e.location_name 
            FROM public.event_participants ep
            JOIN public.events e ON ep.event_id = e.id
            WHERE ep.user_id = $1
            ORDER BY e.date ASC
        `;
        const result = await query(text, [user_id]);
        return result.rows;
    }
}

export default EventParticipant;
