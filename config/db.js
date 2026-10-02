const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        console.warn("⚠️ MONGO_URI is not set in environment. Running in disconnected mode.");
        return null;
    }

    if (!cachedPromise) {
        cachedPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        }).then((conn) => {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        }).catch((error) => {
            cachedPromise = null;
            console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
            if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
                process.exit(1);
            }
            return null;
        });
    }

    return cachedPromise;
};

module.exports = connectDB;
