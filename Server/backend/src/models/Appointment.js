import { query } from '../config/db.js';

class Appointment {
    /**
     * Valid appointment statuses
     */
    static STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

    /**
     * Default time slots available for appointments
     */
    static TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

    /**
     * Maximum appointments per professional per day
     */
    static MAX_PER_DAY = 3;

    /**
     * Create a new appointment
     */
    static async create(appointmentData) {
        const { user_id, professional_id, appointment_date, appointment_time, notes } = appointmentData;

        // Validate status if provided
        const status = appointmentData.status || 'pending';
        if (!this.STATUSES.includes(status)) {
            throw new Error(`Invalid status. Valid statuses: ${this.STATUSES.join(', ')}`);
        }

        const text = `
            INSERT INTO public.appointments (
                user_id, professional_id, appointment_date, appointment_time, status, notes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [user_id, professional_id, appointment_date, appointment_time, status, notes];
        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Find appointment by ID
     */
    static async findById(id) {
        const text = `
            SELECT 
                a.*,
                p.name as professional_name,
                p.role as professional_role,
                p.department as professional_department,
                p.image_url as professional_image,
                p.phone_number as professional_phone,
                u.name as user_name,
                u.mobile_number as user_mobile
            FROM public.appointments a
            LEFT JOIN public.professionals p ON a.professional_id = p.id
            LEFT JOIN public.users u ON a.user_id = u.id
            WHERE a.id = $1
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get appointments for a user
     */
    static async findByUserId(user_id, options = {}) {
        const { limit = 50, offset = 0, status, upcoming_only = false } = options;

        let text = `
            SELECT 
                a.*,
                p.name as professional_name,
                p.role as professional_role,
                p.department as professional_department,
                p.image_url as professional_image,
                p.phone_number as professional_phone
            FROM public.appointments a
            LEFT JOIN public.professionals p ON a.professional_id = p.id
            WHERE a.user_id = $1
        `;
        const values = [user_id];
        let paramCount = 2;

        if (status) {
            text += ` AND a.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        if (upcoming_only) {
            text += ` AND a.appointment_date >= CURRENT_DATE AND a.status NOT IN ('cancelled', 'completed')`;
        }

        text += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await query(text, values);
        return result.rows;
    }

    /**
     * Get appointments for a professional
     */
    static async findByProfessionalId(professional_id, options = {}) {
        const { limit = 50, offset = 0, date, status, exclude_cancelled = true } = options;

        let text = `
            SELECT 
                a.*,
                u.name as user_name,
                u.mobile_number as user_mobile,
                u.village,
                u.district
            FROM public.appointments a
            LEFT JOIN public.users u ON a.user_id = u.id
            WHERE a.professional_id = $1
        `;
        const values = [professional_id];
        let paramCount = 2;

        if (date) {
            text += ` AND a.appointment_date = $${paramCount}`;
            values.push(date);
            paramCount++;
        }

        if (status) {
            text += ` AND a.status = $${paramCount}`;
            values.push(status);
            paramCount++;
        } else if (exclude_cancelled) {
            text += ` AND a.status != 'cancelled'`;
        }

        text += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await query(text, values);
        return result.rows;
    }

    /**
     * Get count of appointments for a professional on a specific date
     */
    static async getCountForDate(professional_id, date) {
        const text = `
            SELECT COUNT(*)::INT as count
            FROM public.appointments
            WHERE professional_id = $1
            AND appointment_date = $2
            AND status != 'cancelled'
        `;
        const result = await query(text, [professional_id, date]);
        return result.rows[0]?.count || 0;
    }

    /**
     * Check if a professional is fully booked on a date
     */
    static async isFullyBooked(professional_id, date) {
        const count = await this.getCountForDate(professional_id, date);
        return count >= this.MAX_PER_DAY;
    }

    /**
     * Check if a specific time slot is available
     */
    static async isSlotAvailable(professional_id, date, time) {
        const text = `
            SELECT COUNT(*) as count
            FROM public.appointments
            WHERE professional_id = $1
            AND appointment_date = $2
            AND appointment_time = $3
            AND status != 'cancelled'
        `;
        const result = await query(text, [professional_id, date, time]);
        return (result.rows[0]?.count || 0) === 0;
    }

    /**
     * Get available time slots for a professional on a date
     */
    static async getAvailableSlots(professional_id, date) {
        const text = `
            SELECT appointment_time
            FROM public.appointments
            WHERE professional_id = $1
            AND appointment_date = $2
            AND status != 'cancelled'
        `;
        const result = await query(text, [professional_id, date]);
        const bookedSlots = result.rows.map(r => r.appointment_time);
        return this.TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
    }

    /**
     * Update appointment
     */
    static async update(id, appointmentData) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        // Validate status if provided
        if (appointmentData.status && !this.STATUSES.includes(appointmentData.status)) {
            throw new Error(`Invalid status. Valid statuses: ${this.STATUSES.join(', ')}`);
        }

        Object.keys(appointmentData).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            values.push(appointmentData[key]);
            paramCount++;
        });

        values.push(id);

        const text = `
            UPDATE public.appointments
            SET ${fields.join(', ')}, updated_at = timezone('utc', now())
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    /**
     * Cancel an appointment
     */
    static async cancel(id) {
        return this.update(id, { status: 'cancelled' });
    }

    /**
     * Confirm an appointment
     */
    static async confirm(id) {
        return this.update(id, { status: 'confirmed' });
    }

    /**
     * Mark appointment as completed
     */
    static async complete(id) {
        return this.update(id, { status: 'completed' });
    }

    /**
     * Delete appointment (hard delete)
     */
    static async delete(id) {
        const text = 'DELETE FROM public.appointments WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    /**
     * Get upcoming appointments for a user
     */
    static async getUpcomingByUserId(user_id, limit = 10) {
        return this.findByUserId(user_id, { limit, upcoming_only: true });
    }

    /**
     * Get appointment statistics for a professional
     */
    static async getStatsByProfessionalId(professional_id) {
        const text = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN appointment_date = CURRENT_DATE AND status IN ('pending', 'confirmed') THEN 1 END) as today
            FROM public.appointments
            WHERE professional_id = $1
        `;
        const result = await query(text, [professional_id]);
        return result.rows[0];
    }

    /**
     * Get appointment statistics for a user
     */
    static async getStatsByUserId(user_id) {
        const text = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN appointment_date >= CURRENT_DATE AND status IN ('pending', 'confirmed') THEN 1 END) as upcoming
            FROM public.appointments
            WHERE user_id = $1
        `;
        const result = await query(text, [user_id]);
        return result.rows[0];
    }
}

export default Appointment;
