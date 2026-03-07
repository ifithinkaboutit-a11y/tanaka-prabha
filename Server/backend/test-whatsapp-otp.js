/**
 * MSG91 WhatsApp OTP — Diagnostic + Smoke Test
 *
 * Usage:
 *   node test-whatsapp-otp.js [en|hi]
 *
 * Steps:
 *   1. Validates authkey & integrated_number from .env
 *   2. Lists your WhatsApp integrated numbers via MSG91 API (diagnostic)
 *   3. Sends a test OTP to +91 7307464595
 */

import 'dotenv/config';
import axios from 'axios';

// ── Config ────────────────────────────────────────────────────────────────────
const TARGET_PHONE = '917307464595';
const TEST_OTP = '123456';
const TEST_LANGUAGE = process.argv[2] || 'en';
const AUTH_KEY = (process.env.MSG91_AUTH_KEY || '').trim();
const INTEGRATED_NUMBER = (process.env.MSG91_INTEGRATED_NUMBER).trim();

// ── Pre-flight ────────────────────────────────────────────────────────────────
if (!AUTH_KEY || AUTH_KEY === '<your_msg91_authkey_here>') {
    console.error('\n❌  MSG91_AUTH_KEY is not set in .env\n');
    process.exit(1);
}

console.log('\n══════════════════════════════════════════════════');
console.log('  MSG91 WhatsApp OTP — Diagnostic + Test');
console.log('══════════════════════════════════════════════════');
console.log(`  Auth key     : ${AUTH_KEY.slice(0, 6)}${'*'.repeat(Math.max(0, AUTH_KEY.length - 6))}`);
console.log(`  Integrated # : ${INTEGRATED_NUMBER}`);
console.log(`  Target phone : +91 ${TARGET_PHONE.slice(2)}`);
console.log(`  Language     : ${TEST_LANGUAGE}`);
console.log('══════════════════════════════════════════════════\n');

// ── Step 1: Fetch integrated numbers linked to this authkey ───────────────────
console.log('🔍  Step 1: Fetching your MSG91 WhatsApp integrated numbers...\n');
try {
    const listResp = await axios.get(
        'https://api.msg91.com/api/v5/whatsapp/integrated-number/',
        { headers: { authkey: AUTH_KEY } }
    );
    const data = listResp.data;
    console.log('   Raw response:', JSON.stringify(data, null, 4));

    const numbers = data?.data || data?.integrated_numbers || [];
    if (Array.isArray(numbers) && numbers.length > 0) {
        console.log('\n   ✅ Integrated numbers on this account:');
        numbers.forEach((n, i) => {
            const num = n.number || n.integrated_number || n.phone || JSON.stringify(n);
            console.log(`      [${i + 1}] ${num}`);
            if (String(num).replace(/\D/g, '') === INTEGRATED_NUMBER.replace(/\D/g, '')) {
                console.log(`          ← ✅ Matches MSG91_INTEGRATED_NUMBER in .env`);
            }
        });

        const allNums = numbers.map(n =>
            String(n.number || n.integrated_number || n.phone || '').replace(/\D/g, '')
        );
        if (!allNums.includes(INTEGRATED_NUMBER.replace(/\D/g, ''))) {
            console.log(`\n   ⚠️  WARNING: ${INTEGRATED_NUMBER} is NOT in your account's integrated numbers!`);
            console.log(`   → Update MSG91_INTEGRATED_NUMBER in .env to one of the numbers above.`);
        }
    } else {
        console.log('\n   ⚠️  No integrated numbers found, or different response shape.');
        console.log('   → Make sure WhatsApp is enabled for this authkey on msg91.com');
    }
} catch (diagErr) {
    console.warn('   ⚠️  Could not fetch integrated numbers (non-fatal):', diagErr.response?.data || diagErr.message);
}

// ── Step 2: Send the test OTP ─────────────────────────────────────────────────
console.log('\n📤  Step 2: Sending test OTP via WhatsApp...\n');

const payload = {
    integrated_number: INTEGRATED_NUMBER,
    content_type: 'template',
    payload: {
        messaging_product: 'whatsapp',
        type: 'template',
        template: {
            name: 'tanak_prabha_otp',
            language: {
                code: TEST_LANGUAGE,
                policy: 'deterministic'
            },
            namespace: '3d70d0bd_fd9c_4c0a_a8b1_507056ef9ec9',
            to_and_components: [
                {
                    to: [TARGET_PHONE],
                    components: {
                        body_1: { type: 'text', value: TEST_OTP },
                        button_1: { subtype: 'url', type: 'text', value: TEST_OTP }
                    }
                }
            ]
        }
    }
};

try {
    const response = await axios.post(
        'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
        payload,
        { headers: { 'Content-Type': 'application/json', authkey: AUTH_KEY } }
    );
    console.log('✅  SUCCESS — MSG91 response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n📱  Check WhatsApp on +91 ${TARGET_PHONE.slice(2)} for OTP: ${TEST_OTP}\n`);
} catch (err) {
    console.error('❌  Send failed:');
    if (err.response) {
        console.error(`   HTTP Status : ${err.response.status}`);
        console.error('   Body        :', JSON.stringify(err.response.data, null, 2));
        console.error('\n   Common causes of 401/418:');
        console.error('     1. MSG91_INTEGRATED_NUMBER in .env does not belong to this authkey\'s account');
        console.error('        → Check Step 1 output above for your real integrated number(s)');
        console.error('     2. WhatsApp is not enabled for this authkey');
        console.error('        → Login at msg91.com → WhatsApp → check Integrated Numbers');
        console.error('     3. Template "tanak_prabha_otp" is not approved yet');
        console.error('        → msg91.com → WhatsApp → Templates → check status\n');
    } else {
        console.error('  ', err.message);
    }
    process.exit(1);
}
