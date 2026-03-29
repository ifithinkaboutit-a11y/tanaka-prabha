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

    static async findAll() {
        const text = `
            SELECT id, email, name, role, is_active, last_login_at, created_at
            FROM public.admins
            ORDER BY created_at DESC
        `;
        const result = await query(text);
        return result.rows;
    }

    static async findById(id) {
        const text = `
            SELECT id, email, name, role, is_active, last_login_at, created_at
            FROM public.admins
            WHERE id = $1
        `;
        const result = await query(text, [id]);
        return result.rows[0];
    }

    static async createWithRole(email, passwordHash, name, role) {
        const validRoles = ['super_admin', 'admin', 'sub_admin', 'volunteer'];
        if (!validRoles.includes(role)) {
            throw new Error(`Invalid role: ${role}. Must be one of ${validRoles.join(', ')}`);
        }
        const text = `
            INSERT INTO public.admins (email, password_hash, name, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, name, role, is_active, created_at
        `;
        const result = await query(text, [email, passwordHash, name, role]);
        return result.rows[0];
    }

    static async updateById(id, fields) {
        const validRoles = ['super_admin', 'admin', 'sub_admin', 'volunteer'];
        const allowed = ['name', 'email', 'role'];
        const setClauses = [];
        const values = [id];

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                if (key === 'role' && !validRoles.includes(fields[key])) {
                    throw new Error(`Invalid role: ${fields[key]}. Must be one of ${validRoles.join(', ')}`);
                }
                values.push(fields[key]);
                setClauses.push(`${key} = $${values.length}`);
            }
        }

        if (setClauses.length === 0) {
            throw new Error('No valid fields provided for update');
        }

        setClauses.push(`updated_at = timezone('utc', now())`);
        const text = `
            UPDATE public.admins
            SET ${setClauses.join(', ')}
            WHERE id = $1
            RETURNING id, email, name, role, is_active, updated_at
        `;
        const result = await query(text, values);
        return result.rows[0];
    }

    static async setActive(id, isActive) {
        const text = `
            UPDATE public.admins
            SET is_active = $2, updated_at = timezone('utc', now())
            WHERE id = $1
            RETURNING id, email, name, role, is_active, updated_at
        `;
        const result = await query(text, [id, isActive]);
        return result.rows[0];
    }
}

export default Admin;
