const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log("Attempting to connect...");
        // Log first few chars of URI to verify it's loaded without leaking full creds
        const uri = process.env.MONGO_URI || "";
        console.log(`URI loaded: ${uri.substring(0, 20)}...`);

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error(`FULL ERROR DETAILS:`);
        console.error(error);
        process.exit(1);
    }
};

connectDB();
