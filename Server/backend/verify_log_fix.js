
import http from 'http';

const verify = () => {
    console.log('Verifying fixes...');

    // 1. Verify Stream Route
    const req = http.request('http://localhost:5000/api/logs/stream', (res) => {
        console.log(`Stream Route Status: ${res.statusCode}`);
        console.log(`Stream Headers: ${JSON.stringify(res.headers)}`);

        if (res.headers['content-type'] === 'text/event-stream') {
            console.log('Stream Content-Type: OK');
        } else {
            console.error('Stream Content-Type: FAILED');
        }

        let chunkCount = 0;
        res.on('data', (chunk) => {
            console.log(`Stream Data [${chunkCount}]: ${chunk.toString()}`);
            chunkCount++;

            // Trigger a log by hitting another endpoint
            if (chunkCount === 1) {
                console.log('Triggering a log event...');
                http.get('http://localhost:5000/health', (healthRes) => {
                    console.log(`Health check trigger status: ${healthRes.statusCode}`);
                });
            }

            // If we get a second chunk, it means streaming is working!
            if (chunkCount >= 2) {
                console.log('✅ Streaming verified! Received dynamic log event.');
                req.destroy();
                process.exit(0);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Stream Route Error: ${e.message}`);
        process.exit(1);
    });

    req.end();
};

verify();
