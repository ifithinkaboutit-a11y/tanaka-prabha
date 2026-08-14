import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const REVIEW_USER_MOBILE = '919999999999';
const ADMIN_EMAIL_TO_KEEP = 'admin@tanakprabha.com';

// All data tables to fully clear (system tables like spatial_ref_sys are excluded)
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
    'schemes',
];

/**
 * Wipe the entire database for a clean release, preserving ONLY:
 *  - the primary admin account (admin@tanakprabha.com)
 *  - the Google Play review user (users.mobile_number = 919999999999)
 */
async function wipeDatabase() {
    console.log('🗑️  Starting full database wipe (preserving admin@tanakprabha.com & Play review user)...\n');

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

        console.log(`Pruning admins (keeping only ${ADMIN_EMAIL_TO_KEEP})...`);
        await query('DELETE FROM admins WHERE email != $1', [ADMIN_EMAIL_TO_KEEP]);

        console.log('\n✅ Database wiped successfully!');
        console.log('Preserved: admin@tanakprabha.com (admin), Google Play review user.');

        const counts = await query(`
            SELECT 'admins' AS t, COUNT(*) FROM admins
            UNION ALL SELECT 'users', COUNT(*) FROM users
            UNION ALL SELECT 'schemes', COUNT(*) FROM schemes
            UNION ALL SELECT 'banners', COUNT(*) FROM banners
            UNION ALL SELECT 'events', COUNT(*) FROM events
            UNION ALL SELECT 'professionals', COUNT(*) FROM professionals
        `);
        counts.rows.forEach((r) => console.log(`  ${r.t}: ${r.count}`));
    } catch (error) {
        console.error('❌ Wipe error:', error);
        process.exit(1);
    }

    process.exit(0);
}

wipeDatabase();