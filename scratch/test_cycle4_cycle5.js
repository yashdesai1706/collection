require('dotenv').config();
const assert = require('assert');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyPayment, handleWebhook } = require('../controllers/paymentController');

async function testCycles4And5() {
    console.log('=== RUNNING CYCLES 4 & 5 TESTS: Verification, Atomic Stock Deduction, Idempotency & Webhook ===');

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

    const user = await User.findOne({ email: 'test_checkout_user@example.com' });
    const product = await Product.findOne({ isActive: true, 'variants.0': { $exists: true } });
    const variant = product.variants[0];

    // Ensure variant has known stock
    variant.stock = 50;
    await product.save();
    console.log(`Reset initial variant stock to: ${variant.stock}`);

    // Create an order in "Pending Payment" state
    const rzpOrderId1 = 'order_test_' + Date.now();
    const order1 = await Order.create({
        user: user._id,
        orderItems: [
            {
                name: product.name,
                qty: 2,
                image: product.image,
                price: variant.price || product.price,
                size: variant.size,
                color: variant.color,
                product: product._id,
                variantId: variant._id
            }
        ],
        shippingAddress: {
            address: '42 Baker Street',
            city: 'Mumbai',
            postalCode: '400001',
            country: 'India'
        },
        paymentMethod: 'Razorpay',
        itemsPrice: (variant.price || product.price) * 2,
        shippingPrice: 200,
        totalPrice: (variant.price || product.price) * 2 + 200,
        isPaid: false,
        status: 'Pending Payment',
        paymentResult: {
            razorpay_order_id: rzpOrderId1,
            status: 'created'
        }
    });

    console.log(`Created test order ${order1._id} linked to ${rzpOrderId1}`);

    // --- TEST 4.1: Tampered / Invalid Signature ---
    console.log('\n--- Test 4.1: Tampered signature must be rejected and stock untouched ---');
    const fakePaymentId = 'pay_fake_' + Date.now();
    const tamperedSignature = 'deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678';

    let status1 = 200;
    let data1 = null;
    await verifyPayment(
        {
            user: { _id: user._id, email: user.email },
            body: {
                razorpay_order_id: rzpOrderId1,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: tamperedSignature
            }
        },
        {
            status: (code) => { status1 = code; return { json: (d) => { data1 = d; } }; },
            json: (d) => { data1 = d; }
        }
    );

    assert.strictEqual(status1, 400, 'Tampered signature must return status 400');
    assert.strictEqual(data1.success, false);

    // Verify DB order and stock are untouched
    const checkOrder1 = await Order.findById(order1._id);
    assert.strictEqual(checkOrder1.isPaid, false, 'Order must NOT be marked paid after tampered signature');
    assert.strictEqual(checkOrder1.status, 'Pending Payment');

    const checkProduct1 = await Product.findById(product._id);
    assert.strictEqual(checkProduct1.variants.id(variant._id).stock, 50, 'Stock must NOT be touched on tampered signature');
    console.log('✓ Test 4.1 Passed: Tampered signature rejected (400), order is unpaid, stock untouched (50).');

    // --- TEST 4.2: Valid Signature & Atomic Stock Deduction ---
    console.log('\n--- Test 4.2: Genuine signature verification & atomic stock deduction ---');
    const genuinePaymentId = 'pay_valid_' + Date.now();
    const genuineSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${rzpOrderId1}|${genuinePaymentId}`)
        .digest('hex');

    let status2 = 200;
    let data2 = null;
    await verifyPayment(
        {
            user: { _id: user._id, email: user.email },
            body: {
                razorpay_order_id: rzpOrderId1,
                razorpay_payment_id: genuinePaymentId,
                razorpay_signature: genuineSignature
            }
        },
        {
            status: (code) => { status2 = code; return { json: (d) => { data2 = d; } }; },
            json: (d) => { data2 = d; }
        }
    );

    assert.strictEqual(status2, 200, 'Genuine signature must return status 200');
    assert.strictEqual(data2.success, true);
    assert.strictEqual(data2.isPaid, true);

    const paidOrder1 = await Order.findById(order1._id);
    assert.strictEqual(paidOrder1.isPaid, true, 'Order must now be isPaid: true');
    assert.strictEqual(paidOrder1.status, 'Processing');
    assert.strictEqual(paidOrder1.paymentResult.id, genuinePaymentId);
    assert.ok(paidOrder1.paidAt, 'paidAt date must be recorded');

    const productAfterPay = await Product.findById(product._id);
    const stockAfterPay = productAfterPay.variants.id(variant._id).stock;
    assert.strictEqual(stockAfterPay, 48, 'Stock must be decremented by 2 (from 50 to 48)');
    console.log('✓ Test 4.2 Passed: Signature verified, order marked paid, stock decremented exactly once to 48.');

    // --- TEST 5.1: Idempotency (Calling verify twice) ---
    console.log('\n--- Test 5.1: Idempotency guard on repeated verify calls ---');
    let status3 = 200;
    let data3 = null;
    await verifyPayment(
        {
            user: { _id: user._id, email: user.email },
            body: {
                razorpay_order_id: rzpOrderId1,
                razorpay_payment_id: genuinePaymentId,
                razorpay_signature: genuineSignature
            }
        },
        {
            status: (code) => { status3 = code; return { json: (d) => { data3 = d; } }; },
            json: (d) => { data3 = d; }
        }
    );

    assert.strictEqual(status3, 200);
    assert.strictEqual(data3.success, true);
    assert.match(data3.message, /already fulfilled/);

    const productAfterDuplicate = await Product.findById(product._id);
    assert.strictEqual(productAfterDuplicate.variants.id(variant._id).stock, 48, 'Stock must STILL be 48 (no double deduction!)');
    console.log('✓ Test 5.1 Passed: Duplicate verify call did not double-deduct stock (remained 48).');

    // --- TEST 5.2: Webhook Independent Fulfillment ---
    console.log('\n--- Test 5.2: Webhook independent fulfillment when client tab closed ---');
    const rzpOrderId2 = 'order_webhook_' + Date.now();
    const order2 = await Order.create({
        user: user._id,
        orderItems: [
            {
                name: product.name,
                qty: 3,
                image: product.image,
                price: variant.price || product.price,
                size: variant.size,
                color: variant.color,
                product: product._id,
                variantId: variant._id
            }
        ],
        shippingAddress: { address: 'Colaba Causeway', city: 'Mumbai', postalCode: '400005', country: 'India' },
        paymentMethod: 'Razorpay',
        itemsPrice: (variant.price || product.price) * 3,
        shippingPrice: 0,
        totalPrice: (variant.price || product.price) * 3,
        isPaid: false,
        status: 'Pending Payment',
        paymentResult: { razorpay_order_id: rzpOrderId2, status: 'created' }
    });

    const webhookPaymentId = 'pay_webhook_' + Date.now();
    const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: webhookPaymentId,
                    order_id: rzpOrderId2,
                    amount: order2.totalPrice * 100,
                    currency: 'INR',
                    email: user.email
                }
            }
        }
    });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookPayload)
        .digest('hex');

    let webhookStatus = 200;
    let webhookData = null;
    await handleWebhook(
        {
            headers: { 'x-razorpay-signature': webhookSignature },
            rawBody: webhookPayload,
            body: JSON.parse(webhookPayload)
        },
        {
            status: (code) => { webhookStatus = code; return { json: (d) => { webhookData = d; } }; },
            json: (d) => { webhookData = d; }
        }
    );

    assert.strictEqual(webhookStatus, 200);
    const fulfilledByWebhook = await Order.findById(order2._id);
    assert.strictEqual(fulfilledByWebhook.isPaid, true, 'Webhook must fulfill order');
    assert.strictEqual(fulfilledByWebhook.paymentResult.id, webhookPaymentId);

    const productAfterWebhook = await Product.findById(product._id);
    // Stock was 48, order 2 had qty 3 -> 48 - 3 = 45
    assert.strictEqual(productAfterWebhook.variants.id(variant._id).stock, 45, 'Stock must decrement by 3 (from 48 to 45)');
    console.log('✓ Test 5.2 Passed: Webhook independently fulfilled order and deducted stock (48 -> 45).');

    // --- TEST 5.3: Late client verify after webhook arrived ---
    console.log('\n--- Test 5.3: Late client verify call after webhook already fulfilled ---');
    const lateSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${rzpOrderId2}|${webhookPaymentId}`)
        .digest('hex');

    let lateStatus = 200;
    let lateData = null;
    await verifyPayment(
        {
            user: { _id: user._id, email: user.email },
            body: {
                razorpay_order_id: rzpOrderId2,
                razorpay_payment_id: webhookPaymentId,
                razorpay_signature: lateSignature
            }
        },
        {
            status: (code) => { lateStatus = code; return { json: (d) => { lateData = d; } }; },
            json: (d) => { lateData = d; }
        }
    );

    assert.strictEqual(lateStatus, 200);
    assert.strictEqual(lateData.success, true);
    assert.match(lateData.message, /already fulfilled/);

    const productAfterLate = await Product.findById(product._id);
    assert.strictEqual(productAfterLate.variants.id(variant._id).stock, 45, 'Stock must REMAIN 45 (no duplicate fulfillment!)');
    console.log('✓ Test 5.3 Passed: Late client-side call correctly handled as already fulfilled without duplicate stock deduction.');

    console.log('\nALL CYCLES 4 & 5 TESTS PASSED SUCCESSFULLY! ✅\n');
    await mongoose.disconnect();
    process.exit(0);
}

testCycles4And5().catch(err => {
    console.error('Cycle 4 & 5 test failure:', err);
    process.exit(1);
});
