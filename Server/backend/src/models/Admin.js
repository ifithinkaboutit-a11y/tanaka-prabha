import { query } from '../config/db.js';

class Admin {
    static async createTable() {
        const text = `
            CREATE TABLE IF NOT EXISTS public.admins (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
            )
        `;
        await query(text);
    }

    static async findByEmail(email) {
        const text = 'SELECT * FROM public.admins WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0];
    }

    static async create(email, passwordHash) {
        const text = `
            INSERT INTO public.admins (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, created_at
        `;
        const result = await query(text, [email, passwordHash]);
        return result.rows[0];
    }

    static async updatePassword(id, passwordHash) {
        const text = `
            UPDATE public.admins
            SET password_hash = $2, updated_at = timezone('utc', now())
            WHERE id = $1
            RETURNING id, email, updated_at
        `;
        const result = await query(text, [id, passwordHash]);
        return result.rows[0];
    }

    static async updateEmail(id, email) {
        const text = `
            UPDATE public.admins
            SET email = $2, updated_at = timezone('utc', now())
            WHERE id = $1
            RETURNING id, email, updated_at
        `;
        const result = await query(text, [id, email]);
        return result.rows[0];
    }
}

export default Admin;
