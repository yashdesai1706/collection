require('dotenv').config();
const assert = require('assert');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { createPaymentOrder } = require('../controllers/paymentController');

async function testCycle2() {
    console.log('=== RUNNING CYCLE 2 TESTS: Real Razorpay Order Creation & Pending Order State ===');

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB.');

    // Find or create a test product and test user
    let user = await User.findOne({ email: 'test_checkout_user@example.com' });
    if (!user) {
        user = await User.create({
            name: 'Test Customer',
            email: 'test_checkout_user@example.com',
            password: 'hashed_password_123',
            isAdmin: false
        });
    }

    let product = await Product.findOne({ isActive: true, 'variants.0': { $exists: true } });
    if (!product) {
        product = await Product.create({
            name: 'Test Banarasi Saree',
            slug: 'test-banarasi-saree-' + Date.now(),
            description: 'Luxury handwoven saree',
            price: 2499,
            image: '/uploads/sample.jpg',
            category: new mongoose.Types.ObjectId(),
            variants: [
                {
                    size: 'Free Size',
                    color: 'Royal Red',
                    stock: 10,
                    price: 2999 // variant override
                }
            ],
            stock: 10
        });
    }

    const targetVariant = product.variants[0];
    const expectedItemPrice = targetVariant.price || product.price;
    const qty = 2;
    const expectedItemsTotal = expectedItemPrice * qty; // 2999 * 2 = 5998
    const expectedShipping = expectedItemsTotal > 5000 ? 0 : 200;
    const expectedTotal = expectedItemsTotal + expectedShipping; // 5998
    const expectedAmountInPaise = expectedTotal * 100;

    console.log(`Product: "${product.name}", Variant Price: ₹${expectedItemPrice}, Qty: ${qty}`);
    console.log(`Expected Server Total: ₹${expectedTotal} (${expectedAmountInPaise} paise)`);

    // Mock Express req and res
    const req = {
        user: { _id: user._id, email: user.email, name: user.name },
        body: {
            orderItems: [
                {
                    product: product._id.toString(),
                    variantId: targetVariant._id.toString(),
                    qty: qty,
                    price: 1 // Malicious client price tampering attempt
                }
            ],
            shippingAddress: {
                address: '101 Marine Drive',
                city: 'Mumbai',
                postalCode: '400020',
                country: 'India'
            }
        }
    };

    let responseStatus = 200;
    let responseData = null;

    const res = {
        status: function (code) {
            responseStatus = code;
            return this;
        },
        json: function (data) {
            responseData = data;
            return this;
        }
    };

    await createPaymentOrder(req, res);

    console.log('Response Status:', responseStatus);
    console.log('Response Data:', responseData);

    assert.strictEqual(responseStatus, 201, 'Response status should be 201 Created');
    assert.strictEqual(responseData.success, true, 'Response success must be true');
    assert.ok(responseData.razorpayOrderId.startsWith('order_'), 'Must return valid Razorpay order ID starting with order_');
    assert.strictEqual(responseData.amount, expectedAmountInPaise, `Amount in paise must match server-computed total (${expectedAmountInPaise})`);
    assert.strictEqual(responseData.currency, 'INR');

    // Verify internal Order record in MongoDB
    const savedOrder = await Order.findById(responseData.orderId);
    assert.ok(savedOrder, 'Internal Order must exist in database');
    assert.strictEqual(savedOrder.isPaid, false, 'Internal order MUST NOT be marked paid yet');
    assert.strictEqual(savedOrder.status, 'Pending Payment', 'Internal order status must be "Pending Payment"');
    assert.strictEqual(savedOrder.totalPrice, expectedTotal, `Internal order totalPrice must be ${expectedTotal}`);
    assert.strictEqual(savedOrder.paymentResult.razorpay_order_id, responseData.razorpayOrderId, 'Saved order must link to the Razorpay order ID');

    console.log('\n✓ CYCLE 2 VERIFIED:');
    console.log(`- Real Razorpay Order Created: ${responseData.razorpayOrderId}`);
    console.log(`- Internal Order ID: ${savedOrder._id}`);
    console.log(`- Status: "${savedOrder.status}", isPaid: ${savedOrder.isPaid}`);
    console.log(`- Total: ₹${savedOrder.totalPrice} (Tampered ₹1 ignored)`);
    console.log('ALL CYCLE 2 TESTS PASSED! ✅\n');

    await mongoose.disconnect();
    process.exit(0);
}

testCycle2().catch(err => {
    console.error('Cycle 2 test error:', err);
    process.exit(1);
});
