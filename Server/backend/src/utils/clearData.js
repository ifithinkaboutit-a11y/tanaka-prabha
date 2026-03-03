import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Clear all database tables
 * As requested: "For clearing data remove all"
 */
async function clearDatabase() {
    console.log('🗑️ Starting complete database cleanup...\n');

    try {
        console.log('Clearing activity logs...');
        await query('DELETE FROM activity_logs');

        console.log('Clearing appointments...');
        await query('DELETE FROM appointments');

        console.log('Clearing connections...');
        await query('DELETE FROM connections');

        console.log('Clearing notifications...');
        await query('DELETE FROM notifications');

        console.log('Clearing banners...');
        await query('DELETE FROM banners');

        console.log('Clearing schemes...');
        await query('DELETE FROM schemes');

        console.log('Clearing otps...');
        await query('DELETE FROM otps');

        console.log('Clearing livestock details...');
        await query('DELETE FROM livestock_details');

        console.log('Clearing land details...');
        await query('DELETE FROM land_details');

        console.log('Clearing professionals...');
        await query('DELETE FROM professionals');

        console.log('Clearing users...');
        await query('DELETE FROM users');

        console.log('\n✅ All data cleared successfully!');
    } catch (error) {
        console.error('❌ Clearance error:', error);
        process.exit(1);
    }

    process.exit(0);
}

clearDatabase();
