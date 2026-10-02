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

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const attributeRoutes = require('./routes/attributeRoutes');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// Connect to MongoDB and prepare Next.js before accepting traffic
Promise.all([connectDB(), nextApp.prepare()]).then(() => {
    const app = express();

    // Security Headers - configured to allow Next.js assets and Razorpay modal
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    // Rate Limiting applied to authentication to protect against brute force
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/users/login', authLimiter);

    app.use(express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({ extended: true }));

    // CORS Configuration (unified same-origin by default, supports explicit origins if configured)
    const allowedOrigins = [
        `http://localhost:${PORT}`,
        process.env.FRONTEND_URL
    ].filter(Boolean);

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1 || dev) {
                callback(null, true);
            } else {
                callback(null, true); // Allow same origin / proxy
            }
        },
        credentials: true
    }));

    // Express API Routes
    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api', categoryRoutes);
    app.use('/api/attributes', attributeRoutes);
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
