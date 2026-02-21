import { query } from './src/config/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'migrations/003_add_events_tables.sql'), 'utf-8');
        await query(sql, []);
        console.log('Migration successful: Created events and event_participants tables');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

runMigration();
