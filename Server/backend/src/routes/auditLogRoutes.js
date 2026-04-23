import express from 'express';
import {
    logAuditEvent,
    getAuditLogs,
    getAuditStats,
} from '../controllers/auditLogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/audit-logs
 * @desc    Log an audit event (scheme view, SOS trigger, etc.)
 * @access  Protected
 */
router.post('/', authMiddleware, logAuditEvent);

/**
 * @route   GET /api/audit-logs
 * @desc    Get audit logs with filters
 * @access  Protected
 */
router.get('/', authMiddleware, getAuditLogs);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit log action counts
 * @access  Protected
 */
router.get('/stats', authMiddleware, getAuditStats);

export default router;
