const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getProductBySlug,
    deleteProduct,
    createProduct,
    updateProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);
router.route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, upload.single('image'), updateProduct);
router.route('/slug/:slug').get(getProductBySlug);

module.exports = router;
