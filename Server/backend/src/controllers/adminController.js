import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const createAdmin = async (req, res) => {
    try {
        await Admin.createTable();

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if any admin exists
        const existingAdmin = await Admin.findByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create(email, hashedPassword);

        res.status(201).json({
            message: 'Admin user successfully created',
            admin
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Server error while creating admin' });
    }
};

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

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ error: 'Server error while logging in' });
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

        // Find admin by ID - query directly since we only have findByEmail
        const { query } = await import('../config/db.js');
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
