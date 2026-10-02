const assert = require('assert');
const { calculateOrderSummary } = require('../utils/orderCalculator');
const Product = require('../models/Product');

async function runCycle1Test() {
    console.log('=== RUNNING CYCLE 1 TESTS: Server-Side Total Calculation ===');

    // Mock Product.findById
    const mockProducts = {
        'prod1': {
            _id: 'prod1',
            name: 'Banarasi Silk Saree',
            price: 2500,
            image: '/uploads/saree.jpg',
            isActive: true,
            variants: [
                {
                    _id: 'var1',
                    size: 'Free Size',
                    color: 'Royal Red',
                    stock: 5,
                    price: 2800, // Price override
                },
                {
                    _id: 'var2',
                    size: 'Free Size',
                    color: 'Golden Yellow',
                    stock: 1,
                    price: null, // Uses base price
                }
            ]
        },
        'prod2': {
            _id: 'prod2',
            name: 'Velvet Anarkali Suit',
            price: 1500,
            image: '/uploads/anarkali.jpg',
            isActive: true,
            stock: 10,
            variants: [] // Simple product without variants
        }
    };

    const origFindById = Product.findById;
    Product.findById = function (id) {
        return {
            lean: async () => mockProducts[id.toString()] || null
        };
    };

    try {
        // Test 1: Tampered price submission on variant with price override
        console.log('\n--- Test 1.1: Tampered price on variant with price override ---');
        const clientItems1 = [
            {
                product: 'prod1',
                variantId: 'var1',
                qty: 2,
                price: 1, // MALICIOUS CLIENT TAMPERING: tries to pay ₹1 instead of ₹2800!
                totalPrice: 2,
                name: 'Hacked Price'
            }
        ];

        const summary1 = await calculateOrderSummary(clientItems1);
        console.log('Server computed summary 1:', {
            itemsPrice: summary1.itemsPrice,
            shippingPrice: summary1.shippingPrice,
            totalPrice: summary1.totalPrice,
            amountInPaise: summary1.amountInPaise
        });

        // 2 items * 2800 = 5600. Shipping is free (> 5000). Total = 5600. Amount in paise = 560000.
        assert.strictEqual(summary1.formattedOrderItems[0].price, 2800, 'Price must be the DB variant override (2800), ignoring client value 1');
        assert.strictEqual(summary1.itemsPrice, 5600, 'Items price must be 5600');
        assert.strictEqual(summary1.shippingPrice, 0, 'Shipping must be 0 for > 5000');
        assert.strictEqual(summary1.totalPrice, 5600, 'Total price must be 5600');
        assert.strictEqual(summary1.amountInPaise, 560000, 'Amount in paise must be 560000');
        console.log('✓ Test 1.1 Passed: Malicious client price ₹1 was completely ignored! Server charged ₹5600.');

        // Test 2: Variant without override uses product base price + standard shipping (< 5000)
        console.log('\n--- Test 1.2: Variant without override uses base price + shipping ---');
        const clientItems2 = [
            {
                product: 'prod1',
                variantId: 'var2',
                qty: 1,
                price: 999999 // Client inflated price ignored
            }
        ];

        const summary2 = await calculateOrderSummary(clientItems2);
        // Base price = 2500, qty = 1. Shipping = 200 (since 2500 <= 5000). Total = 2700.
        assert.strictEqual(summary2.formattedOrderItems[0].price, 2500, 'Price must fall back to base price 2500');
        assert.strictEqual(summary2.itemsPrice, 2500);
        assert.strictEqual(summary2.shippingPrice, 200);
        assert.strictEqual(summary2.totalPrice, 2700);
        assert.strictEqual(summary2.amountInPaise, 270000);
        console.log('✓ Test 1.2 Passed: Base price fallback and standard shipping applied correctly.');

        // Test 3: Simple product without variants
        console.log('\n--- Test 1.3: Product without variants ---');
        const clientItems3 = [
            {
                product: 'prod2',
                qty: 2
            }
        ];
        const summary3 = await calculateOrderSummary(clientItems3);
        // Base price = 1500 * 2 = 3000 + 200 shipping = 3200
        assert.strictEqual(summary3.itemsPrice, 3000);
        assert.strictEqual(summary3.shippingPrice, 200);
        assert.strictEqual(summary3.totalPrice, 3200);
        console.log('✓ Test 1.3 Passed: Simple product calculated correctly.');

        // Test 4: Insufficient stock throws error
        console.log('\n--- Test 1.4: Insufficient stock rejected ---');
        let stockErrorThrown = false;
        try {
            await calculateOrderSummary([
                {
                    product: 'prod1',
                    variantId: 'var2', // stock is 1
                    qty: 5 // requested 5
                }
            ]);
        } catch (err) {
            stockErrorThrown = true;
            assert.match(err.message, /Insufficient stock/, 'Should throw insufficient stock error');
        }
        assert.strictEqual(stockErrorThrown, true, 'Must reject order when requested qty exceeds stock');
        console.log('✓ Test 1.4 Passed: Over-stock request properly rejected.');

        console.log('\nALL CYCLE 1 TESTS PASSED SUCCESSFULLY! ✅');
    } finally {
        Product.findById = origFindById;
    }
}

runCycle1Test().catch(err => {
    console.error('Cycle 1 test failure:', err);
    process.exit(1);
});
