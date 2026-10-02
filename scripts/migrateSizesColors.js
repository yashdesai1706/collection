const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Size = require('../models/Size');
const Color = require('../models/Color');

dotenv.config();

const runMigration = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products.`);

        const sizeSet = new Set();
        const colorSet = new Set();

        products.forEach(p => {
            p.variants?.forEach(v => {
                if (v.size && v.size.trim()) sizeSet.add(v.size.trim());
                if (v.color && v.color.trim()) colorSet.add(v.color.trim());
            });
        });

        console.log(`Found ${sizeSet.size} unique sizes.`);
        console.log(`Found ${colorSet.size} unique colors.`);

        // Insert Sizes
        let sizesAdded = 0;
        for (const s of sizeSet) {
            const exists = await Size.findOne({ name: s });
            if (!exists) {
                await Size.create({ name: s });
                sizesAdded++;
            }
        }
        console.log(`Added ${sizesAdded} new sizes to master list.`);

        // Insert Colors
        let colorsAdded = 0;
        for (const c of colorSet) {
            const exists = await Color.findOne({ name: c });
            if (!exists) {
                await Color.create({ name: c });
                colorsAdded++;
            }
        }
        console.log(`Added ${colorsAdded} new colors to master list.`);

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
