const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paidAt
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    // MVP: COD disabled
    if (paymentMethod === 'COD') {
        return res.status(400).json({
            message: 'Cash on Delivery is currently disabled. Please checkout using Razorpay online payment.'
        });
    }

    // Validate variant stock and build formatted items
    const formattedOrderItems = [];
    for (const item of orderItems) {
        const product = await Product.findById(item.product || item._id);
        if (!product || !product.isActive) {
            return res.status(400).json({ message: `Product "${item.name}" is no longer available` });
        }

        if (item.variantId && product.variants?.length > 0) {
            // ponytail: Atomic variant stock deduction — prevents overselling race condition
            const result = await Product.findOneAndUpdate(
                { _id: product._id, 'variants._id': item.variantId, 'variants.stock': { $gte: Number(item.qty) } },
                { $inc: { 'variants.$.stock': -Number(item.qty), stock: -Number(item.qty) } },
                { new: true }
            );
            if (!result) {
                const variant = product.variants.id(item.variantId);
                return res.status(400).json({
                    message: `"${item.name}" (${variant?.size || '?'}${variant?.color ? ' / ' + variant.color : ''}) is out of stock or insufficient quantity`
                });
            }
        } else if (product.variants?.length === 0) {
            // Legacy product — atomic flat stock deduction
            const result = await Product.findOneAndUpdate(
                { _id: product._id, stock: { $gte: Number(item.qty) } },
                { $inc: { stock: -Number(item.qty) } },
                { new: true }
            );
            if (!result) {
                return res.status(400).json({ message: `"${item.name}" is out of stock` });
            }
        }

        formattedOrderItems.push({
            name:      item.name,
            qty:       Number(item.qty),
            image:     item.image,
            price:     Number(item.price),
            size:      item.size || 'Free Size',
            color:     item.color || null,
            product:   product._id,
            variantId: item.variantId || null,
        });
    }

    const order = new Order({
        orderItems: formattedOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay',
        paymentResult: paymentResult || {},
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: Boolean(isPaid),
        paidAt: paidAt || (isPaid ? Date.now() : undefined),
        // TODO: requires product/client decision: Order status state machine stages (Ready to Ship / In Transit / Out for Delivery / Delivered / RTO)
        status: 'Processing'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    // Uses composite index { user: 1, createdAt: -1 }
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
};
