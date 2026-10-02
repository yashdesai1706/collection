require('dotenv').config();
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');

async function runFullTestSuite() {
    console.log('================================================================');
    console.log('  FULL END-TO-END RAZORPAY INTEGRATION TEST SUITE (CYCLES 6 & 7)');
    console.log('================================================================\n');

    // ── 1. SECURITY & ENV AUDIT ──────────────────────────────────────────────
    console.log('[1/7] Auditing environment variables and secret leaks...');
    assert.ok(process.env.RAZORPAY_KEY_ID, 'RAZORPAY_KEY_ID must exist in .env');
    assert.ok(process.env.RAZORPAY_KEY_SECRET, 'RAZORPAY_KEY_SECRET must exist in .env');
    assert.ok(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 'NEXT_PUBLIC_RAZORPAY_KEY_ID must exist in .env');

    // Verify .gitignore ignores .env
    const gitignoreContent = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    const gitignoreLines = gitignoreContent.split('\n').map(l => l.trim());
    assert.ok(gitignoreLines.includes('.env'), '.gitignore must explicitly contain .env');

    // Scan all frontend source files in app/ components/ store/ lib/
    const frontendDirs = ['app', 'components', 'store', 'lib'];
    const secretValue = process.env.RAZORPAY_KEY_SECRET;
    for (const dir of frontendDirs) {
        const fullDir = path.join(__dirname, '..', dir);
        if (fs.existsSync(fullDir)) {
            const files = getAllFiles(fullDir);
            for (const file of files) {
                if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
                    const content = fs.readFileSync(file, 'utf8');
                    assert.ok(
                        !content.includes(secretValue),
                        `CRITICAL SECURITY VIOLATION: RAZORPAY_KEY_SECRET leaked in frontend file ${file}`
                    );
                    assert.ok(
                        !content.includes('process.env.RAZORPAY_KEY_SECRET'),
                        `CRITICAL SECURITY VIOLATION: RAZORPAY_KEY_SECRET referenced in frontend file ${file}`
                    );
                }
            }
        }
    }
    console.log('✓ PASS: All credentials secured in .env, .gitignore confirmed, 0 leaks in frontend.\n');

    // ── 2. DATABASE & TEST SETUP ─────────────────────────────────────────────
    console.log('[2/7] Connecting to database and setting up test records...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

    let testUser = await User.findOne({ email: 'e2e_test_shopper@example.com' });
    if (!testUser) {
        testUser = await User.create({
            name: 'Priti Shopper',
            email: 'e2e_test_shopper@example.com',
            password: 'secret_hash_password_123'
        });
    }

    let testProduct = await Product.findOne({ isActive: true, 'variants.0': { $exists: true } });
    if (!testProduct) {
        testProduct = await Product.create({
            name: 'E2E Banarasi Katan Silk Saree',
            slug: 'e2e-banarasi-katan-silk-' + Date.now(),
            description: 'Luxury handwoven pure katan silk',
            price: 3999,
            image: '/uploads/saree.jpg',
            category: new mongoose.Types.ObjectId(),
            variants: [
                {
                    size: 'Free Size',
                    color: 'Crimson Maroon',
                    stock: 25,
                    price: 4499 // price override
                }
            ],
            stock: 25
        });
    }

    const testVariant = testProduct.variants[0];
    testVariant.stock = 25;
    await testProduct.save();
    console.log(`✓ PASS: Test user & product ready. Variant stock reset to ${testVariant.stock}.\n`);

    // ── 3. ERROR HANDLING: MINIMUM AMOUNT & TAMPERING ────────────────────────
    console.log('[3/7] Testing error handling: minimum amount and price manipulation...');

    // Minimum amount check (< ₹1 = 100 paise)
    let minAmountFailed = false;
    await createPaymentOrder(
        {
            user: { _id: testUser._id },
            body: {
                orderItems: [], // empty items
                shippingAddress: { address: 'A', city: 'B', postalCode: '123456' }
            }
        },
        {
            status: (code) => {
                if (code >= 400) minAmountFailed = true;
                return { json: () => {} };
            },
            json: () => {}
        }
    );
    assert.ok(minAmountFailed, 'Empty order items must be rejected with 400 error');
    console.log('✓ PASS: Invalid/empty order rejected with 400.');

    // Price manipulation: client attempts price: 1
    const qty = 2;
    const realUnitPrice = testVariant.price || testProduct.price; // 4499 or 100
    const expectedSubtotal = realUnitPrice * qty;
    const expectedShipping = expectedSubtotal > 5000 ? 0 : 200;
    const expectedTotal = expectedSubtotal + expectedShipping;
    const expectedPaise = expectedTotal * 100;

    let orderCreationStatus = 200;
    let orderCreationData = null;
    await createPaymentOrder(
        {
            user: { _id: testUser._id },
            body: {
                orderItems: [
                    {
                        product: testProduct._id.toString(),
                        variantId: testVariant._id.toString(),
                        qty: qty,
                        price: 1 // Malicious client attempt to pay ₹1
                    }
                ],
                shippingAddress: {
                    address: '74 Linking Road, Bandra West',
                    city: 'Mumbai',
                    postalCode: '400050',
                    country: 'India'
                }
            }
        },
        {
            status: (code) => { orderCreationStatus = code; return { json: (d) => { orderCreationData = d; } }; },
            json: (d) => { orderCreationData = d; }
        }
    );

    assert.strictEqual(orderCreationStatus, 201);
    assert.strictEqual(orderCreationData.success, true);
    assert.strictEqual(orderCreationData.amount, expectedPaise, `Server total must be ${expectedPaise} paise, ignoring client price 1`);
    console.log(`✓ PASS: Server charged ₹${expectedTotal} (${expectedPaise} paise), client-submitted ₹1 was ignored.\n`);

    // ── 4. ORDER CREATION & PENDING STATE ────────────────────────────────────
    console.log('[4/7] Verifying pending internal order state in MongoDB...');
    const pendingOrder = await Order.findById(orderCreationData.orderId);
    assert.ok(pendingOrder, 'Order must exist in database');
    assert.strictEqual(pendingOrder.isPaid, false, 'Order must be isPaid: false before payment');
    assert.strictEqual(pendingOrder.status, 'Pending Payment', 'Status must be "Pending Payment"');
    assert.strictEqual(pendingOrder.paymentResult.razorpay_order_id, orderCreationData.razorpayOrderId);
    console.log(`✓ PASS: Internal Order ${pendingOrder._id} saved in "Pending Payment" state.\n`);

    // ── 5. SIGNATURE VERIFICATION & ATOMIC STOCK DEDUCTION ───────────────────
    console.log('[5/7] Testing signature verification & atomic stock deduction...');

    // Tampered signature rejected
    let tamperedStatus = 200;
    await verifyPayment(
        {
            user: { _id: testUser._id },
            body: {
                razorpay_order_id: orderCreationData.razorpayOrderId,
                razorpay_payment_id: 'pay_test_tampered',
                razorpay_signature: 'invalid_tampered_signature_hex_1234567890abcdef'
            }
        },
        {
            status: (code) => { tamperedStatus = code; return { json: () => {} }; },
            json: () => {}
        }
    );
    assert.strictEqual(tamperedStatus, 400, 'Tampered signature must return 400 Bad Request');

    const productAfterTamper = await Product.findById(testProduct._id);
    assert.strictEqual(productAfterTamper.variants.id(testVariant._id).stock, 25, 'Stock must NOT be deducted on tampered signature');

    // Genuine signature accepted
    const genuinePaymentId = 'pay_test_' + Date.now();
    const genuineSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderCreationData.razorpayOrderId}|${genuinePaymentId}`)
        .digest('hex');

    let verifyStatus = 200;
    let verifyData = null;
    await verifyPayment(
        {
            user: { _id: testUser._id },
            body: {
                razorpay_order_id: orderCreationData.razorpayOrderId,
                razorpay_payment_id: genuinePaymentId,
                razorpay_signature: genuineSignature
            }
        },
        {
            status: (code) => { verifyStatus = code; return { json: (d) => { verifyData = d; } }; },
            json: (d) => { verifyData = d; }
        }
    );

    assert.strictEqual(verifyStatus, 200);
    assert.strictEqual(verifyData.success, true);
    assert.strictEqual(verifyData.isPaid, true);

    const paidOrder = await Order.findById(orderCreationData.orderId);
    assert.strictEqual(paidOrder.isPaid, true, 'Order must now be marked paid');
    assert.strictEqual(paidOrder.status, 'Processing');
    assert.strictEqual(paidOrder.paymentResult.id, genuinePaymentId);

    const productAfterGenuine = await Product.findById(testProduct._id);
    const stockAfterGenuine = productAfterGenuine.variants.id(testVariant._id).stock;
    assert.strictEqual(stockAfterGenuine, 25 - qty, `Stock must be decremented by ${qty} (from 25 to ${25 - qty})`);
    console.log(`✓ PASS: Signature validated, order marked paid, stock decremented to ${stockAfterGenuine}.\n`);

    // ── 6. IDEMPOTENCY CHECK ────────────────────────────────────────────────
    console.log('[6/7] Testing idempotency (preventing double stock deduction)...');
    let duplicateStatus = 200;
    let duplicateData = null;
    await verifyPayment(
        {
            user: { _id: testUser._id },
            body: {
                razorpay_order_id: orderCreationData.razorpayOrderId,
                razorpay_payment_id: genuinePaymentId,
                razorpay_signature: genuineSignature
            }
        },
        {
            status: (code) => { duplicateStatus = code; return { json: (d) => { duplicateData = d; } }; },
            json: (d) => { duplicateData = d; }
        }
    );
    assert.strictEqual(duplicateStatus, 200);
    assert.strictEqual(duplicateData.success, true);

    const productAfterDup = await Product.findById(testProduct._id);
    assert.strictEqual(productAfterDup.variants.id(testVariant._id).stock, 25 - qty, 'Stock must NOT be deducted again');
    console.log('✓ PASS: Idempotency verified. Repeated verification calls do not double-deduct stock.\n');

    // ── 7. WEBHOOK INDEPENDENT CONFIRMATION ──────────────────────────────────
    console.log('[7/7] Testing Razorpay webhook independent fulfillment...');
    const webhookRzpOrderId = 'order_webhook_e2e_' + Date.now();
    const webhookOrder = await Order.create({
        user: testUser._id,
        orderItems: [
            {
                name: testProduct.name,
                qty: 1,
                image: testProduct.image,
                price: realUnitPrice,
                size: testVariant.size,
                color: testVariant.color,
                product: testProduct._id,
                variantId: testVariant._id
            }
        ],
        shippingAddress: { address: 'Colaba', city: 'Mumbai', postalCode: '400005', country: 'India' },
        paymentMethod: 'Razorpay',
        itemsPrice: realUnitPrice,
        shippingPrice: 200,
        totalPrice: realUnitPrice + 200,
        isPaid: false,
        status: 'Pending Payment',
        paymentResult: { razorpay_order_id: webhookRzpOrderId, status: 'created' }
    });

    const webhookPaymentId = 'pay_webhook_e2e_' + Date.now();
    const payloadObj = {
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: webhookPaymentId,
                    order_id: webhookRzpOrderId,
                    amount: webhookOrder.totalPrice * 100,
                    currency: 'INR',
                    email: testUser.email
                }
            }
        }
    };
    const payloadString = JSON.stringify(payloadObj);
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookSig = crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('hex');

    let hookStatus = 200;
    await handleWebhook(
        {
            headers: { 'x-razorpay-signature': webhookSig },
            rawBody: payloadString,
            body: payloadObj
        },
        {
            status: (code) => { hookStatus = code; return { json: () => {} }; },
            json: () => {}
        }
    );

    assert.strictEqual(hookStatus, 200);
    const orderFulfilledByWebhook = await Order.findById(webhookOrder._id);
    assert.strictEqual(orderFulfilledByWebhook.isPaid, true);
    assert.strictEqual(orderFulfilledByWebhook.paymentResult.id, webhookPaymentId);

    const productAfterHook = await Product.findById(testProduct._id);
    assert.strictEqual(productAfterHook.variants.id(testVariant._id).stock, 25 - qty - 1, 'Stock must decrement by 1 via webhook');
    console.log('✓ PASS: Webhook independently confirmed payment and fulfilled order.\n');

    console.log('================================================================');
    console.log('  ALL 7 E2E INTEGRATION & SECURITY TESTS PASSED! ✅');
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

runFullTestSuite().catch(err => {
    console.error('E2E Test Suite Error:', err);
    process.exit(1);
});
