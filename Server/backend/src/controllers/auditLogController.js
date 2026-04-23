import AuditLog from '../models/AuditLog.js';

/**
 * Log an audit event (scheme view, SOS trigger, etc.)
 */
export const logAuditEvent = async (req, res) => {
    try {
        const { action, entity_id, metadata } = req.body;
        const user_id = req.user?.userId || null;
        const ip_address = req.ip || req.connection?.remoteAddress || null;
        const user_agent = req.get('user-agent') || null;

        if (!action) {
            return res.status(400).json({ status: 'error', message: 'action is required' });
        }

        const log = await AuditLog.create({
            user_id,
            action,
            entity_id,
            metadata,
            ip_address,
            user_agent,
        });

        res.status(201).json({
            status: 'success',
            data: { log },
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create audit log' });
    }
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { action, user_id, entity_id, limit, offset } = req.query;

        const logs = await AuditLog.findAll({
            action,
            user_id,
            entity_id,
            limit: limit || 50,
            offset: offset || 0,
        });

        res.status(200).json({
            status: 'success',
            data: { logs },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch audit logs' });
    }
};

/**
 * Get audit log action counts (for dashboard stats)
 */
export const getAuditStats = async (req, res) => {
    try {
        const { since } = req.query;
        const counts = await AuditLog.getActionCounts({ since });

        res.status(200).json({
            status: 'success',
            data: { counts },
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch audit stats' });
    }
};
