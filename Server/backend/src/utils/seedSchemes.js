import { query } from '../config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMES_FILE = join(__dirname, '../data/schemesSeed.json');

/**
 * Seed the database with the 108 government schemes (English + Hindi).
 * Data source: "Aspects of the Yojanas in Excel.xlsx" — details verified
 * against official ministry portals / PIB releases before seeding.
 */
async function seedSchemes() {
    console.log('🌱 Seeding schemes from schemesSeed.json...\n');

    const raw = readFileSync(SCHEMES_FILE, 'utf8').replace(/^\uFEFF/, '');
    const schemes = JSON.parse(raw);

    if (!Array.isArray(schemes) || schemes.length === 0) {
        throw new Error('No schemes found in seed file');
    }

    console.log(`Found ${schemes.length} schemes to seed\n`);

    // Normalise the agent-generated payload to the schemes table schema
    const normalised = schemes.map((s) => ({
        title: s.title,
        title_hi: s.title_hi || null,
        description: s.description || null,
        description_hi: s.description_hi || null,
        overview: s.overview || null,
        overview_hi: s.overview_hi || null,
        process: s.process || null,
        process_hi: s.process_hi || null,
        eligibility: s.eligibility || null,
        eligibility_hi: s.eligibility_hi || null,
        key_objectives: Array.isArray(s.key_objectives) ? s.key_objectives : [],
        key_objectives_hi: Array.isArray(s.key_objectives_hi) ? s.key_objectives_hi : [],
        category: s.category || 'Uncategorized',
        image_url: s.image_url || null,
        hero_image_url: s.hero_image_url || null,
        location: s.location || null,
        event_date: s.event_date || null,
        documents_required: Array.isArray(s.documents_required) ? s.documents_required : [],
        tags: Array.isArray(s.tags) ? s.tags : [],
        support_contact: s.support_contact || null,
        apply_url: s.apply_url || null,
        is_active: s.is_active !== false,
        is_featured: s.is_featured === true,
    }));

    let inserted = 0;
    for (const scheme of normalised) {
        const text = `
            INSERT INTO public.schemes (
                title, description, overview, process, eligibility, key_objectives,
                title_hi, description_hi, overview_hi, process_hi, eligibility_hi, key_objectives_hi,
                category, image_url, hero_image_url,
                location, event_date, documents_required, tags,
                support_contact, apply_url, is_active, is_featured
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12,
                $13, $14, $15,
                $16, $17, $18, $19,
                $20, $21, $22, $23
            )
        `;
        const values = [
            scheme.title, scheme.description, scheme.overview, scheme.process, scheme.eligibility, scheme.key_objectives,
            scheme.title_hi, scheme.description_hi, scheme.overview_hi, scheme.process_hi, scheme.eligibility_hi, scheme.key_objectives_hi,
            scheme.category, scheme.image_url, scheme.hero_image_url,
            scheme.location, scheme.event_date, scheme.documents_required, scheme.tags,
            scheme.support_contact, scheme.apply_url, scheme.is_active, scheme.is_featured,
        ];
        await query(text, values);
        inserted++;
    }

    console.log(`✅ Successfully inserted ${inserted} schemes\n`);

    const count = await query('SELECT COUNT(*) FROM public.schemes');
    console.log(`Total schemes in DB: ${count.rows[0].count}`);
}

seedSchemes()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seed error:', err);
        process.exit(1);
    });