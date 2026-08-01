import bcrypt from 'bcrypt';
import { query } from '../config/db.js';

const MOBILE = '919999999999';
const PASSWORD = '12345678';
const NAME = 'Google Play Review';
const BCRYPT_ROUNDS = 12;

async function createReviewAccount() {
    const existing = await query(
        'SELECT id FROM public.users WHERE mobile_number = $1',
        [MOBILE]
    );

    if (existing.rows.length > 0) {
        console.log(`Review account already exists (${existing.rows[0].id})`);
        const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
        await query(
            'UPDATE public.users SET password_hash = $1, name = $2 WHERE id = $3',
            [hash, NAME, existing.rows[0].id]
        );
        console.log('Review account password updated');
        return;
    }

    const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
    const result = await query(
        `INSERT INTO public.users (name, mobile_number, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [NAME, MOBILE, hash]
    );
    console.log(`Review account created (${result.rows[0].id})`);
}

createReviewAccount()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Failed to create review account:', err);
        process.exit(1);
    });
