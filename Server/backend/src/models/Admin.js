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
}

export default Admin;
