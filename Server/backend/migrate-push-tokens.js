// migrate-push-tokens.js  — run from: Server/backend/
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    await pool.query(`
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS expo_push_token TEXT,
        ADD COLUMN IF NOT EXISTS push_token_platform TEXT DEFAULT 'unknown';
    `);
    console.log('✅ Migration complete: expo_push_token + push_token_platform added to users table.');
} catch (e) {
    console.error('❌ Migration failed:', e.message);
} finally {
    await pool.end();
}
