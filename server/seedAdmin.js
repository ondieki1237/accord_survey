import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accord-survey';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // ENFORCE SINGLE USER POLICY
        console.log('Clearing existing users...');
        await User.deleteMany({});

        const email = 'info@accordmedical.co.ke';
        const password = 'password123';
        const role = 'super admin';

        console.log(`Creating super admin: ${email}`);
        await User.create({
            username: email,
            password: password,
            role: role
        });

        console.log('Super admin user created successfully.');
        console.log('Database seeded. Exiting...');
        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
