import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import professionalRoutes from './routes/professionalRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import crypto from 'crypto';

dotenv.config();

const app = express();

// ==================================================================
// MIDDLEWARE
// ==================================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware — skip noisy internal routes
app.use(morgan('dev', {
    skip: (req) => {
        const url = req.originalUrl;
        return url === '/health' || url.startsWith('/api/logs');
    },
    stream: {
        write: (message) => console.log(message.trim())
    }
}));

// Request timestamp
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// ==================================================================
// ROUTES
// ==================================================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Tanak Prabha API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API base route
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Tanak Prabha API v1.0',
    });
});

// Import route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);

// ==================================================================
// LIVE LOGGING ROUTES
// ==================================================================

import liveLogger from './utils/liveLogger.js';

// UI Route
app.get('/log', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Live Tail</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background-color: #0d1117;
                color: #c9d1d9;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                padding: 16px 20px 20px;
                font-size: 13px;
                line-height: 1.6;
            }
            h1 {
                font-size: 14px;
                color: #8b949e;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #21262d;
            }
            #logs { white-space: pre-wrap; word-wrap: break-word; }

            /* ── Base entry ── */
            .log-entry {
                display: flex;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 2px;
                padding: 2px 8px;
                border-radius: 4px;
                border-left: 3px solid transparent;
            }

            /* ── Default / info ── */
            .log-entry.tag-log    { color: #c9d1d9; }

            /* ── OTP — bright amber highlight ── */
            .log-entry.tag-otp {
                background: rgba(255, 200, 0, 0.07);
                border-left-color: #f0c000;
                color: #ffd60a;
                font-weight: bold;
            }
            .log-entry.tag-otp .badge {
                background: #f0c000;
                color: #0d1117;
                border-radius: 3px;
                padding: 0 5px;
                font-size: 11px;
                font-weight: bold;
                flex-shrink: 0;
            }

            /* ── Keep-alive & health — very faded ── */
            .log-entry.tag-keepalive,
            .log-entry.tag-health {
                color: #484f58;
                font-size: 11px;
            }

            /* ── Errors ── */
            .log-entry.tag-error {
                border-left-color: #da3633;
                color: #ff7b72;
            }

            /* ── Warnings ── */
            .log-entry.tag-warn {
                border-left-color: #d29922;
                color: #d29922;
            }

            /* ── Shared sub-elements ── */
            .timestamp { color: #484f58; flex-shrink: 0; }
            .badge {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                flex-shrink: 0;
                opacity: 0.6;
            }

            /* ── Status pill ── */
            .status {
                position: fixed;
                top: 0; right: 0;
                padding: 4px 12px;
                background: #1f6feb;
                color: white;
                font-size: 11px;
                border-bottom-left-radius: 6px;
                letter-spacing: 1px;
            }
            .disconnected { background: #da3633; }
        </style>
    </head>
    <body>
        <div id="status" class="status">Connecting...</div>
        <h1>🖥 Tanak Prabha — Server Live Tail</h1>
        <div id="logs"></div>
        <script nonce="${nonce}">
            const logsDiv = document.getElementById('logs');
            const statusDiv = document.getElementById('status');
            let eventSource;

            function connect() {
                eventSource = new EventSource('/api/logs/stream');

                eventSource.onopen = () => {
                    statusDiv.textContent = '● LIVE';
                    statusDiv.classList.remove('disconnected');
                    addLog('system', 'log', 'Connected to log stream...');
                };

                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    addLog(data.level, data.tag || data.level, data.message, data.timestamp);
                };

                eventSource.onerror = () => {
                    statusDiv.textContent = '✕ Disconnected (Retrying...)';
                    statusDiv.classList.add('disconnected');
                    eventSource.close();
                    setTimeout(connect, 2000);
                };
            }

            function addLog(level, tag, message, timestamp = new Date().toISOString()) {
                // Drop keep-alive & health from the browser view entirely? No — keep them but faded.
                const div = document.createElement('div');
                div.className = 'log-entry tag-' + (tag || level);

                const timeSpan = document.createElement('span');
                timeSpan.className = 'timestamp';
                timeSpan.textContent = timestamp.split('T')[1].split('.')[0];

                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'badge';
                if (tag === 'otp') {
                    badgeSpan.textContent = 'OTP';
                    badgeSpan.style.background = '#f0c000';
                    badgeSpan.style.color = '#0d1117';
                    badgeSpan.style.padding = '0 5px';
                    badgeSpan.style.borderRadius = '3px';
                    badgeSpan.style.opacity = '1';
                } else {
                    badgeSpan.textContent = tag || level;
                }

                const msgSpan = document.createElement('span');
                msgSpan.textContent = message;

                div.appendChild(timeSpan);
                div.appendChild(badgeSpan);
                div.appendChild(msgSpan);
                logsDiv.appendChild(div);

                // Auto-scroll if near bottom
                if (document.body.scrollHeight - window.scrollY - window.innerHeight < 120) {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            }

            connect();
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// SSE Stream Route
app.get('/api/logs/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');
    res.flushHeaders();

    const listener = (log) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
    };

    liveLogger.on('log', listener);

    // Initial connection message
    res.write(`data: ${JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'system',
        message: 'Stream started...'
    })}\n\n`);

    req.on('close', () => {
        liveLogger.off('log', listener);
    });
});

// ==================================================================
// ERROR HANDLING
// ==================================================================

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Handle Multer errors (file upload)
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File is too large. Maximum size allowed is 10MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field.';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded.';
        }
        return res.status(400).json({
            status: 'error',
            message,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle invalid file type error from Cloudinary/Multer
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }

    // Handle specific error types
    if (err.code === '23505') {
        // PostgreSQL unique violation
        return res.status(409).json({
            status: 'error',
            message: 'Duplicate entry. Resource already exists.',
            error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
    }

    if (err.code === '23503') {
        // PostgreSQL foreign key violation
        return res.status(400).json({
            status: 'error',
            message: 'Referenced resource does not exist.',
            error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
    }

    if (err.code === '22P02') {
        // PostgreSQL invalid input syntax
        return res.status(400).json({
            status: 'error',
            message: 'Invalid data format.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
});

export default app;
