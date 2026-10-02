const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
} = require('../controllers/orderController');
const {
    createPaymentOrder,
    verifyPayment,
    handleWebhook
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/create-payment').post(protect, createPaymentOrder);
router.route('/verify-payment').post(protect, verifyPayment);
router.route('/webhook').post(handleWebhook);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

module.exports = router;
