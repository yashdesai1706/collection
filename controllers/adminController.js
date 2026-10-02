const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const productCount = await Product.countDocuments({ isActive: { $ne: false } });
        const orderCount = await Order.countDocuments();
        const userCount = await User.countDocuments();

        // Audit Fix: Use native MongoDB aggregation pipeline instead of loading all orders into memory
        const salesAggregation = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalSales = salesAggregation.length > 0 ? salesAggregation[0].total : 0;

        res.json({ productCount, orderCount, totalSales, userCount });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user admin role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent self-demotion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot change your own admin role' });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();
        res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark order as delivered
// @route   PUT /api/admin/orders/:id/deliver
// @access  Private/Admin
const markOrderDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardStats, getUsers, updateUserRole, markOrderDelivered };
