import pkg from 'pg';
const { Pool } = pkg;
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL connection pool configuration for direct SQL queries
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout for slower connections
});

// Supabase client for Auth, Storage, and Realtime features
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Test database connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Query wrapper with error handling
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export { pool, query, supabase };
export default { pool, query, supabase };
