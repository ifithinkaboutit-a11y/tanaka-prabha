import cron from 'node-cron';
import { query } from '../config/db.js';

/**
 * Marks events as "completed" if their scheduled time has passed.
 * Scheduled to run every 6 hours as requested.
 * Logic:
 * 1. Date is in the past
 * OR
 * 2. Date is today but the end_time has passed
 */
export const initEventStatusCron = () => {
    // Cron schedule: "0 */6 * * *" means at minute 0 of every 6th hour.
    const task = cron.schedule('0 */6 * * *', async () => {
        await updateExpiredEvents();
    });

    // Run once on startup to ensure consistency
    updateExpiredEvents();

    console.log('[cron] ⏰ Event status auto-updater initialized (Runs every 6 hours)');
};

async function updateExpiredEvents() {
    console.log('[cron] 🔄 Checking for expired events...');
    try {
        const text = `
            UPDATE public.events 
            SET status = 'completed'
            WHERE status NOT IN ('completed', 'cancelled')
            AND (
                date < CURRENT_DATE 
                OR (date = CURRENT_DATE AND COALESCE(end_time, '23:59:59')::TIME < CURRENT_TIME)
            )
            RETURNING id, title;
        `;
        const result = await query(text);
        if (result.rowCount > 0) {
            console.log(`[cron] ✅ Successfully marked ${result.rowCount} events as completed:`);
            result.rows.forEach(event => {
                console.log(`   - ${event.title} (ID: ${event.id})`);
            });
        } else {
            console.log('[cron] ℹ️ No events found to mark as completed at this time.');
        }
    } catch (error) {
        console.error('[cron] ❌ Error updating event statuses:', error);
    }
}
