import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const REVIEW_USER_MOBILE = '919999999999';

const TABLES_TO_CLEAR = [
    'activity_logs',
    'audit_logs',
    'event_participants',
    'events',
    'appointments',
    'connections',
    'notifications',
    'banners',
    'otps',
    'livestock_details',
    'land_details',
    'professionals',
];

/**
 * Clear all database tables, preserving:
 *  - admin users (admins table)
 *  - the Google Play review user (users.mobile_number = 919999999999)
 *  - schemes data (schemes table)
 */
async function clearDatabase() {
    console.log('🗑️ Starting database cleanup (preserving admin, review user & schemes)...\n');

    try {
        const existing = await query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        const existingTables = new Set(existing.rows.map((r) => r.table_name));

        for (const table of TABLES_TO_CLEAR) {
            if (!existingTables.has(table)) {
                console.log(`Skipping ${table} (does not exist)`);
                continue;
            }
            console.log(`Clearing ${table}...`);
            await query(`DELETE FROM ${table}`);
        }

        console.log(`Clearing users (keeping review user ${REVIEW_USER_MOBILE})...`);
        await query('DELETE FROM users WHERE mobile_number != $1', [REVIEW_USER_MOBILE]);

        console.log('\n✅ Database cleared successfully!');
        console.log('Preserved: admin users, Google Play review user, schemes.');
    } catch (error) {
        console.error('❌ Clearance error:', error);
        process.exit(1);
    }

    process.exit(0);
}

clearDatabase();