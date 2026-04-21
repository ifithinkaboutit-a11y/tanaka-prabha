import { query } from './src/config/db.js';

async function runMigration() {
    try {
        const text = `
      ALTER TABLE public.land_details 
      ADD COLUMN IF NOT EXISTS latitude NUMERIC,
      ADD COLUMN IF NOT EXISTS longitude NUMERIC,
      ADD COLUMN IF NOT EXISTS location_address TEXT;

      ALTER TABLE public.livestock_details 
      ADD COLUMN IF NOT EXISTS horse INTEGER DEFAULT 0 CHECK (horse >= 0);
    `;
        await query(text, []);
        console.log('Migration successful: Added location columns to land_details and horse column to livestock_details');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
