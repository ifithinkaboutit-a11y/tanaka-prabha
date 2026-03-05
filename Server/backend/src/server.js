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
        const HEALTH_URL = 'https://tanak-prabha.onrender.com/health';
        const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
        const SUPABASE_KEEPALIVE_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
        setInterval(async () => {
            try {
                const res = await fetch(HEALTH_URL);
                console.log(`[keep-alive] 🏓 ping ${res.status} — ${HEALTH_URL}`);
            } catch (err) {
                console.warn(`[keep-alive] 🏓 ping failed: ${err.message}`);
            }
        }, SUPABASE_KEEPALIVE_INTERVAL , PING_INTERVAL);

        // Fire once immediately on boot so we confirm connectivity at startup
        pool.query('SELECT 1').then(() => {
            console.log('[keep-alive] 💚 Supabase keep-alive cron started (every 4h)');
        });


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
