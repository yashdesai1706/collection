const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const connectDB = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Set security headers

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());

// CORS Configuration
// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'https://pritis-frontend.vercel.app', // Hardcoded Vercel URL as fallback
    process.env.FRONTEND_URL            // Environment variable from Render
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('Pritis Collection API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
