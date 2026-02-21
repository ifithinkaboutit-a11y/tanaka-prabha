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
