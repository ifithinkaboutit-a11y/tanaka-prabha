import request from 'supertest';
import app from './src/app.js';

console.log('Starting CSP Verification...');

request(app)
    .get('/log')
    .expect(200)
    .then(res => {
        try {
            // Check CSP header
            const csp = res.headers['content-security-policy'];
            console.log('CSP Header:', csp);

            if (!csp) {
                throw new Error('CSP header missing');
            }

            // Extract nonce
            const nonceMatch = csp.match(/'nonce-(.+?)'/);
            if (!nonceMatch) throw new Error('Nonce not found in CSP header');
            const nonce = nonceMatch[1];
            console.log('Nonce found:', nonce);

            // Check HTML
            if (!res.text.includes(`nonce="${nonce}"`)) {
                throw new Error('Script tag does not contain matching nonce');
            }

            console.log('✅ CSP Verification Passed: Nonce matches in header and script tag.');
            process.exit(0);
        } catch (error) {
            console.error('❌ Verification Failed:', error.message);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Request Failed:', err.message);
        process.exit(1);
    });
