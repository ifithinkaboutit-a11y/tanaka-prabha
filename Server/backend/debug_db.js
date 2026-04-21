import { query } from './src/config/db.js';

async function checkData() {
    try {
        const livestock = await query('SELECT * FROM public.livestock_details LIMIT 5');
        console.log('Livestock Rows:', livestock.rows);
        
        const count = await query('SELECT COUNT(*) FROM public.livestock_details');
        console.log('Total Livestock Records:', count.rows[0].count);
        
        const sum = await query('SELECT SUM(cow) as c, SUM(buffalo) as b FROM public.livestock_details');
        console.log('Sums:', sum.rows[0]);

        const land = await query('SELECT SUM(total_land_area) as t FROM public.land_details');
        console.log('Total Land:', land.rows[0].t);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkData();
