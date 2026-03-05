// migrate-push-tokens.js
// Run: node migrate-push-tokens.js (from Server/ directory)
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, 'backend', '.env') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS expo_push_token TEXT,
            ADD COLUMN IF NOT EXISTS push_token_platform TEXT DEFAULT 'unknown';
        `);
        console.log('✅ Migration complete: expo_push_token and push_token_platform columns added to users table.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
