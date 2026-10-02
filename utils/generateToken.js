const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
        console.error('CRITICAL WARNING: Using default JWT_SECRET in production! Please set a strong secret in Render environment variables.');
    }

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
