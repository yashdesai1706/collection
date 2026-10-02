const express = require('express');
const next = require('next');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = require('./lib/expressApp');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// Connect to MongoDB and prepare Next.js before accepting traffic
Promise.all([connectDB(), nextApp.prepare()]).then(() => {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Next.js request handling for all UI routes and assets (Express 5 compatible fallback)
    app.use((req, res) => {
        return handle(req, res);
    });

    app.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Priti's Collection Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Error preparing Next.js server:", err);
    process.exit(1);
});
