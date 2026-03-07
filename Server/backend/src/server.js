import './utils/liveLogger.js';
import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection established');

        // Start server - bind to 0.0.0.0 to accept connections from other devices
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('='.repeat(50));
            console.log(`🚀 Tanak Prabha Server is running`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('✅ HTTP server closed');

                try {
                    await pool.end();
                    console.log('✅ Database connections closed');
                    process.exit(0);
                } catch (err) {
                    console.error('❌ Error during shutdown:', err);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        // ── Keep-alive pings (development / staging only) ────────────────────
        // In production the server is assumed to be on a paid plan (always-on),
        // so self-pinging is unnecessary and wastes resources.
        if (process.env.NODE_ENV !== 'production') {
            const HEALTH_URL = process.env.SELF_PING_URL || `http://localhost:${PORT}/health`;
            const PING_INTERVAL_MS = 14 * 60 * 1000;          // 14 minutes — keeps Render free tier awake
            const SUPABASE_KEEPALIVE_MS = 4 * 60 * 60 * 1000; // 4 hours   — keeps Supabase free tier awake

            // Render self-ping
            setInterval(async () => {
                try {
                    const res = await fetch(HEALTH_URL);
                    console.log(`[keep-alive] 🏓 self-ping ${res.status} — ${HEALTH_URL}`);
                } catch (err) {
                    console.warn(`[keep-alive] 🏓 self-ping failed: ${err.message}`);
                }
            }, PING_INTERVAL_MS);

            // Supabase keep-alive (prevents free-tier DB from sleeping)
            setInterval(async () => {
                try {
                    await pool.query('SELECT 1');
                    console.log('[keep-alive] 💚 Supabase keep-alive OK');
                } catch (err) {
                    console.warn(`[keep-alive] 💚 Supabase keep-alive failed: ${err.message}`);
                }
            }, SUPABASE_KEEPALIVE_MS);

            console.log(`[keep-alive] ✅ Active — self-ping every 14 min, Supabase every 4 h`);
            console.log(`[keep-alive] 🎯 Target: ${HEALTH_URL}`);
        } else {
            console.log('[keep-alive] ⏸️  Disabled in production (server is always-on)');
        }


        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (err) => {
            console.error('❌ Uncaught Exception:', err);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
