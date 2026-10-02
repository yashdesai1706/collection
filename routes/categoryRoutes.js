const express = require('express');
const router = express.Router();
const {
    getCategories, createCategory, updateCategory, deleteCategory,
    getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Categories — GET is public (used in shop dropdowns), mutations are admin-only
router.route('/categories')
    .get(getCategories)
    .post(protect, admin, createCategory);
router.route('/categories/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

// Subcategories — same access pattern
router.route('/subcategories')
    .get(getSubcategories)
    .post(protect, admin, createSubcategory);
router.route('/subcategories/:id')
    .put(protect, admin, updateSubcategory)
    .delete(protect, admin, deleteSubcategory);

module.exports = router;
