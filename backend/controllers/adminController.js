const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();

        const orders = await Order.find({ isPaid: true });
        const totalSales = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        const userCount = await User.countDocuments();

        res.json({
            productCount,
            orderCount,
            totalSales,
            userCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardStats };
