import { query } from './src/config/db.js';

async function runMigration() {
    try {
        const text = `
      ALTER TABLE public.land_details 
      ADD COLUMN IF NOT EXISTS latitude NUMERIC,
      ADD COLUMN IF NOT EXISTS longitude NUMERIC,
      ADD COLUMN IF NOT EXISTS location_address TEXT;
    `;
        await query(text, []);
        console.log('Migration successful: Added latitude, longitude, and location_address to land_details');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
