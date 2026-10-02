const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateOrderSummary } = require('../utils/orderCalculator');

// Initialize Razorpay instance from environment variables
function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials missing in environment variables');
    }
    return new Razorpay({ key_id, key_secret });
}

/**
 * Shared helper to fulfill an order and atomically deduct variant stock.
 * Idempotent: safe against repeated calls.
 */
async function fulfillOrder(order, paymentId, razorpayOrderId, emailAddress) {
    if (order.isPaid) {
        return order; // Already fulfilled, prevent double fulfillment
    }

    // Atomically deduct inventory for each item
    for (const item of order.orderItems) {
        if (item.variantId) {
            // Atomic decrement with stock guard
            await Product.findOneAndUpdate(
                { _id: item.product, 'variants._id': item.variantId, 'variants.stock': { $gte: Number(item.qty) } },
                { $inc: { 'variants.$.stock': -Number(item.qty), stock: -Number(item.qty) } }
            );
        } else {
            // Legacy / simple product atomic deduction
            await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: Number(item.qty) } },
                { $inc: { stock: -Number(item.qty) } }
            );
        }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Processing';
    order.paymentResult = {
        id: paymentId,
        status: 'paid',
        update_time: new Date().toISOString(),
        email_address: emailAddress || (order.user && order.user.email) || '',
        razorpay_order_id: razorpayOrderId
    };

    return await order.save();
}

// @desc    Create Razorpay Order from server-calculated cart total
// @route   POST /api/payment/create-order (or /api/orders/create-payment)
// @access  Private
const createPaymentOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, existingOrderId } = req.body;

        // If retrying an existing unpaid order
        if (existingOrderId) {
            const existingOrder = await Order.findById(existingOrderId);
            if (!existingOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (existingOrder.isPaid) {
                return res.status(400).json({ message: 'Order is already paid' });
            }

            const razorpay = getRazorpayInstance();
            const amountInPaise = Math.round(existingOrder.totalPrice * 100);

            if (amountInPaise < 100) {
                return res.status(400).json({ message: 'Order amount must be at least ₹1' });
            }

            const rzpOrder = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `order_${existingOrder._id.toString()}`,
                notes: {
                    internalOrderId: existingOrder._id.toString(),
                    userId: req.user._id.toString()
                }
            });

            existingOrder.paymentResult = {
                ...(existingOrder.paymentResult || {}),
                razorpay_order_id: rzpOrder.id,
                status: 'created'
            };
            await existingOrder.save();

            return res.status(200).json({
                success: true,
                orderId: existingOrder._id,
                razorpayOrderId: rzpOrder.id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            });
        }

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
            return res.status(400).json({ message: 'Please provide a valid shipping address with street, city, and postal code' });
        }

        // Cycle 1: Server-side calculation entirely from database — client amount/price is strictly ignored
        const {
            formattedOrderItems,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            amountInPaise
        } = await calculateOrderSummary(orderItems);

        // Reject amounts below Razorpay's minimum (100 paise = ₹1)
        if (amountInPaise < 100) {
            return res.status(400).json({ message: 'Order amount must be at least ₹1 (100 paise)' });
        }

        // 1. Create internal order in pending payment state BEFORE charging
        const order = new Order({
            user: req.user._id,
            orderItems: formattedOrderItems,
            shippingAddress: {
                address: shippingAddress.address,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country || 'India'
            },
            paymentMethod: 'Razorpay',
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: false,
            status: 'Pending Payment',
            paymentResult: {}
        });

        await order.save();

        // 2. Call Razorpay Orders API
        const razorpay = getRazorpayInstance();
        const rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${order._id.toString()}`,
            notes: {
                internalOrderId: order._id.toString(),
                userId: req.user._id.toString()
            }
        });

        // 3. Link Razorpay order ID to internal order
        order.paymentResult = {
            razorpay_order_id: rzpOrder.id,
            status: 'created'
        };
        await order.save();

        res.status(201).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Payment initialization failed',
            error: error.message
        });
    }
};

// @desc    Verify Razorpay Payment Signature and fulfill order
// @route   POST /api/payment/verify (or /api/orders/verify-payment)
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification fields'
            });
        }

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            return res.status(500).json({ message: 'Server configuration error: Key Secret not configured' });
        }

        // Cycle 4: Recompute HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
        const expectedSignature = crypto
            .createHmac('sha256', key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Timing-safe comparison to prevent timing attacks
        let isAuthentic = false;
        try {
            isAuthentic = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'utf-8'),
                Buffer.from(razorpay_signature, 'utf-8')
            );
        } catch {
            isAuthentic = false;
        }

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature. Verification failed.'
            });
        }

        // Find internal order by razorpay_order_id
        const order = await Order.findOne({ 'paymentResult.razorpay_order_id': razorpay_order_id })
            .populate('user', 'email name');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Order not found for Razorpay order: ${razorpay_order_id}`
            });
        }

        // Cycle 5: Idempotency check — if already fulfilled, return success without double-fulfilling
        if (order.isPaid) {
            return res.json({
                success: true,
                message: 'Order already fulfilled and paid',
                orderId: order._id,
                isPaid: true
            });
        }

        // Fulfill order & atomically deduct inventory
        const fulfilled = await fulfillOrder(
            order,
            razorpay_payment_id,
            razorpay_order_id,
            req.user?.email || order.user?.email
        );

        res.json({
            success: true,
            message: 'Payment verified and order fulfilled successfully',
            orderId: fulfilled._id,
            isPaid: true
        });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// @desc    Handle Razorpay Webhook Events
// @route   POST /api/payment/webhook (or /api/orders/webhook)
// @access  Public (Signature Verified)
const handleWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

        if (!webhookSignature || !webhookSecret) {
            return res.status(400).json({ message: 'Missing signature or webhook secret' });
        }

        // Use raw body buffer captured by express.json({ verify })
        const rawBody = req.rawBody || JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        let isAuthentic = false;
        try {
            isAuthentic = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'utf-8'),
                Buffer.from(webhookSignature, 'utf-8')
            );
        } catch {
            isAuthentic = false;
        }

        if (!isAuthentic) {
            console.warn('Webhook signature mismatch!');
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body;
        console.log(`Razorpay Webhook received event: ${event?.event}`);

        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const paymentEntity = event.payload?.payment?.entity;
            const rzpOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
            const rzpPaymentId = paymentEntity?.id;
            const email = paymentEntity?.email;

            if (rzpOrderId) {
                const order = await Order.findOne({ 'paymentResult.razorpay_order_id': rzpOrderId });
                if (order) {
                    if (order.isPaid) {
                        console.log(`Webhook: Order ${order._id} already fulfilled.`);
                        return res.status(200).json({ status: 'already_fulfilled' });
                    }
                    await fulfillOrder(order, rzpPaymentId || 'webhook_captured', rzpOrderId, email);
                    console.log(`Webhook: Order ${order._id} successfully fulfilled.`);
                } else {
                    console.warn(`Webhook: No internal order matched Razorpay order ${rzpOrderId}`);
                }
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ message: 'Webhook processing error', error: error.message });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    handleWebhook
};
