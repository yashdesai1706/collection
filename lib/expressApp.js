const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const productRoutes = require('../routes/productRoutes');
const userRoutes = require('../routes/userRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const adminRoutes = require('../routes/adminRoutes');
const contactRoutes = require('../routes/contactRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const attributeRoutes = require('../routes/attributeRoutes');

function createExpressApp() {
    const app = express();

    // Security Headers - configured to allow Next.js assets and Razorpay modal
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    // Rate Limiting applied to authentication
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

    app.use(cors({
        origin: true,
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

    return app;
}

let appInstance = null;

function getExpressApp() {
    if (!appInstance) {
        appInstance = createExpressApp();
    }
    return appInstance;
}

module.exports = getExpressApp();
