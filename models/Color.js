const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    hex: { type: String, default: null }, // Optional color hex for UI swatch
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Color', colorSchema);
