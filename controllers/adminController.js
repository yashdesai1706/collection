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

const { sendOrderEmail, getWhatsAppUrlForCustomer, formatWhatsAppMessage } = require('../utils/notificationService');

// @desc    Update order status with notifications
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const validStatuses = ['Processing', 'Ready for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        } else {
            order.isDelivered = false;
            order.deliveredAt = undefined;
        }

        const updated = await order.save();

        // Send email update to customer asynchronously
        sendOrderEmail({ order: updated, statusOverride: status }).catch(err => {
            console.error('[NotificationService] Status email error:', err.message);
        });

        const whatsappUrl = getWhatsAppUrlForCustomer(updated, status);
        const whatsappMessage = formatWhatsAppMessage(updated, status);

        res.json({
            ...updated.toObject(),
            whatsappUrl,
            whatsappMessage
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark order as delivered (Legacy alias)
// @route   PUT /api/admin/orders/:id/deliver
// @access  Private/Admin
const markOrderDelivered = async (req, res) => {
    req.body = { status: 'Delivered' };
    return updateOrderStatus(req, res);
};

module.exports = {
    getDashboardStats,
    getUsers,
    updateUserRole,
    markOrderDelivered,
    updateOrderStatus
};

