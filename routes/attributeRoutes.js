const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getSizes, createSize, updateSize, deleteSize,
    getColors, createColor, updateColor, deleteColor
} = require('../controllers/attributeController');

// Sizes
router.route('/sizes').get(getSizes).post(protect, admin, createSize);
router.route('/sizes/:id').put(protect, admin, updateSize).delete(protect, admin, deleteSize);

// Colors
router.route('/colors').get(getColors).post(protect, admin, createColor);
router.route('/colors/:id').put(protect, admin, updateColor).delete(protect, admin, deleteColor);

module.exports = router;
