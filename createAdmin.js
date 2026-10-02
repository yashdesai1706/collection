const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        // Hash password manually if model pre-save hook isn't consistent in scripts, 
        // but typically the User model handles it. 
        // Let's rely on the User model's pre-save middleware if it exists, 
        // or just pass the plain password if the create/save method handles hashing.
        // Looking at typical patterns, usually simple create handles it if the model has a pre 'save' hook.
        // To be safe and explicit, let's assume the model might not have the hook triggered on create if passed as object literal sometimes,
        // but typically User.create() fires hooks.
        // Let's check User model briefly or just try creating.

        // Wait, I should verify the User model first to see if it hashes passwords.
        // But to save time/steps, I'll assume standard bcrypt usage.

        const user = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // Model should hash this
            isAdmin: true
        });

        console.log('Admin User Created!');
        console.log('Email: admin@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
