const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { uploadToCloudinary } = require('../config/cloudinary');

const toSlug = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const resolveCategoryId = async (cat) => {
    if (!cat) return null;
    if (mongoose.Types.ObjectId.isValid(cat)) return cat;
    const found = await Category.findOne({ name: cat });
    if (found) return found._id;
    const created = await Category.create({ name: cat.trim(), slug: toSlug(cat) });
    return created._id;
};

// @desc    Fetch all active products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const filter = { isActive: { $ne: false } };
        if (req.query.category) filter.category = req.query.category; // accepts ObjectId
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');
        if (product && product.isActive !== false) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: { $ne: false } })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Soft delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isActive = false;
            await product.save();
            res.json({ message: 'Product archived successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, category, subcategory, slug, variants } = req.body;

        let image = 'https://placehold.co/600x800';
        if (req.file) {
            image = await uploadToCloudinary(req.file.buffer, 'pritis_collection/products');
        } else if (req.body.image) {
            image = req.body.image;
        }

        // Parse variants from JSON string (multipart form sends everything as strings)
        let parsedVariants = [];
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            } catch { parsedVariants = []; }
        }

        const productSlug = slug || toSlug(name);

        // Attach SKUs to each variant
        const variantsWithSku = parsedVariants.map(v => ({
            ...v,
            stock: Number(v.stock ?? 0),
            price: v.price ? Number(v.price) : null,
            sku: `${productSlug}-${toSlug(v.size)}${v.color ? `-${toSlug(v.color)}` : ''}`,
        }));

        const catId = await resolveCategoryId(category);

        const product = new Product({
            name,
            price: Number(price),
            image,
            category: catId,
            subcategory: subcategory || null,
            description,
            slug: productSlug,
            isActive: true,
            variants: variantsWithSku,
            // legacy fallback: total stock = sum of all variants
            stock: variantsWithSku.reduce((sum, v) => sum + v.stock, 0),
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, subcategory, slug, variants } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = Number(price);
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = await resolveCategoryId(category);
        if (subcategory !== undefined) product.subcategory = subcategory || null;
        if (slug !== undefined) product.slug = slug;
        if (req.file) {
            product.image = await uploadToCloudinary(req.file.buffer, 'pritis_collection/products');
        } else if (req.body.image !== undefined) {
            product.image = req.body.image;
        }

        if (variants !== undefined) {
            let parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            const productSlug = product.slug;
            product.variants = parsedVariants.map(v => ({
                ...v,
                stock: Number(v.stock ?? 0),
                price: v.price ? Number(v.price) : null,
                sku: `${productSlug}-${toSlug(v.size)}${v.color ? `-${toSlug(v.color)}` : ''}`,
            }));
            product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductBySlug,
    deleteProduct,
    createProduct,
    updateProduct,
};
