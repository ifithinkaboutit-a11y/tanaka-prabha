import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Admin from '../models/Admin.js';

async function setup() {
    try {
        console.log('Creating admins table if not exists...');
        await Admin.createTable();

        const email = 'admin@example.com';
        const password = 'password123';

        const existingAdmin = await Admin.findByEmail(email);
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        console.log(`Creating default admin user: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create(email, hashedPassword);

        console.log('Admin created successfully:', admin);
        process.exit(0);
    } catch (error) {
        console.error('Error setting up admin:', error);
        process.exit(1);
    }
}

setup();
