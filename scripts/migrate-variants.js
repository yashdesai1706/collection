/**
 * Migration: Cycle 6 — Existing Product Data
 *
 * Uses lean()+updateOne instead of findById+save so Mongoose schema
 * validation doesn't reject old documents that still have category as a string.
 *
 * Idempotent: safe to run multiple times.
 * Usage: node scripts/migrate-variants.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const toSlug = (s) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    const categories = db.collection('categories');

    console.log(`Found ${products.length} products to check`);
    let migrated = 0;
    let catFixed = 0;

    for (const product of products) {
        const update = {};

        // 1. category string → ObjectId
        if (typeof product.category === 'string') {
            const catName = product.category;
            const slug = toSlug(catName);
            let cat = await categories.findOne({ slug });
            if (!cat) {
                const res = await categories.insertOne({
                    name: catName,
                    slug,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                cat = { _id: res.insertedId };
                console.log(`  Created category: ${catName}`);
            }
            update.category = cat._id;
            catFixed++;
        }

        // 2. variants migration (only if array is missing or empty)
        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        if (!hasVariants) {
            const sizes = Array.isArray(product.sizes) ? product.sizes : [];
            const colors = Array.isArray(product.colors) ? product.colors : [];
            const slug = product.slug || toSlug(product.name || 'product');
            const stock = typeof product.stock === 'number' ? product.stock : 0;
            let variants = [];

            if (sizes.length > 0 && colors.length > 0) {
                for (const size of sizes) {
                    for (const color of colors) {
                        variants.push({
                            _id: new mongoose.Types.ObjectId(),
                            size, color,
                            stock: 0, // distribute manually
                            price: null, image: null,
                            sku: `${slug}-${toSlug(size)}-${toSlug(color)}`,
                        });
                    }
                }
                console.log(`  ${product.name}: ${variants.length} variants from sizes×colors (stock=0, update manually)`);
            } else if (sizes.length > 0) {
                const perSize = Math.floor(stock / sizes.length);
                variants = sizes.map(size => ({
                    _id: new mongoose.Types.ObjectId(),
                    size, color: null,
                    stock: perSize,
                    price: null, image: null,
                    sku: `${slug}-${toSlug(size)}`,
                }));
                console.log(`  ${product.name}: ${variants.length} size-only variants`);
            } else {
                variants = [{
                    _id: new mongoose.Types.ObjectId(),
                    size: 'Free Size', color: null,
                    stock,
                    price: null, image: null,
                    sku: `${slug}-free-size`,
                }];
                console.log(`  ${product.name}: single Free Size variant (stock=${stock})`);
            }

            update.variants = variants;
            migrated++;
        }

        // 3. Fix missing image (use placeholder so validation passes on future saves)
        if (!product.image) {
            update.image = '/uploads/sample.jpg';
            console.log(`  ${product.name}: filled missing image with placeholder`);
        }

        if (Object.keys(update).length > 0) {
            await db.collection('products').updateOne(
                { _id: product._id },
                { $set: { ...update, updatedAt: new Date() } }
            );
        }
    }

    console.log(`\nDone. ${migrated} products got variants. ${catFixed} category strings → ObjectIds.`);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
