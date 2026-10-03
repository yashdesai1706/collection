const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    updateUserRole,
    markOrderDelivered,
    updateOrderStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/orders/:id/deliver', protect, admin, markOrderDelivered);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
