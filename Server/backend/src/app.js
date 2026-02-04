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

// Logging middleware
app.use(morgan('dev'));

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
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            land: '/api/land',
            livestock: '/api/livestock',
            schemes: '/api/schemes',
            banners: '/api/banners',
            notifications: '/api/notifications',
            professionals: '/api/professionals',
            connections: '/api/connections',
            analytics: '/api/analytics',
            upload: '/api/upload'
        }
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
