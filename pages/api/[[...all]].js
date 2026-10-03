require('dotenv').config();
const connectDB = require('../../config/db');
const expressApp = require('../../lib/expressApp');

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error("Database connection error in API handler:", err);
    }
    return expressApp(req, res);
}
