import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { query } from '../config/db.js';

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admin = await Admin.findByEmail(email);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (admin.is_active === false) {
            return res.status(403).json({ error: 'Account deactivated. Contact your administrator.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        // Update last_login_at
        await query(
            'UPDATE public.admins SET last_login_at = timezone(\'utc\', now()) WHERE id = $1',
            [admin.id]
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ error: 'Server error while logging in' });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Server error while fetching admins' });
    }
};

export const createAdmin = async (req, res) => {
    try {
        await Admin.createTable();

        const { name, email, password, role = 'admin' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingAdmin = await Admin.findByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.createWithRole(email, hashedPassword, name, role);

        res.status(201).json({
            message: 'Admin user successfully created',
            admin
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        if (error.message && error.message.startsWith('Invalid role')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error while creating admin' });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const updated = await Admin.updateById(id, { name, email, role });
        if (!updated) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin updated successfully', admin: updated });
    } catch (error) {
        console.error('Error updating admin:', error);
        if (error.message && error.message.startsWith('Invalid role')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email already in use' });
        }
        res.status(500).json({ error: 'Server error while updating admin' });
    }
};

export const setAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ error: 'is_active must be a boolean' });
        }

        const updated = await Admin.setActive(id, is_active);
        if (!updated) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin status updated successfully', admin: updated });
    } catch (error) {
        console.error('Error updating admin status:', error);
        res.status(500).json({ error: 'Server error while updating admin status' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin?.id;

        if (!adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const result = await query('SELECT * FROM public.admins WHERE id = $1', [adminId]);
        const admin = result.rows[0];

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Admin.updatePassword(adminId, hashedPassword);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Server error while changing password' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const adminId = req.admin?.id;

        if (!adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (email) {
            const updated = await Admin.updateEmail(adminId, email);
            if (!updated) {
                return res.status(404).json({ error: 'Admin not found' });
            }
            return res.status(200).json({ message: 'Profile updated successfully', admin: updated });
        }

        res.status(400).json({ error: 'No fields to update' });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email already in use' });
        }
        res.status(500).json({ error: 'Server error while updating profile' });
    }
};
