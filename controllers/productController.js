const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const {
    uploadToCloudinary,
    deleteFromCloudinary,
    extractCloudinaryPublicId
} = require('../config/cloudinary');

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
    } catch {
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

// @desc    Permanently delete a product and remove all Cloudinary assets
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Collect all Cloudinary asset public IDs
        const publicIdsToDelete = [];

        // Primary image public ID
        if (product.imagePublicId) {
            publicIdsToDelete.push(product.imagePublicId);
        } else if (product.image) {
            const extracted = extractCloudinaryPublicId(product.image);
            if (extracted) publicIdsToDelete.push(extracted);
        }

        // Gallery images public IDs
        if (Array.isArray(product.images)) {
            for (const img of product.images) {
                if (img && typeof img === 'object' && img.publicId) {
                    publicIdsToDelete.push(img.publicId);
                } else {
                    const rawUrl = typeof img === 'string' ? img : img?.url;
                    const extracted = extractCloudinaryPublicId(rawUrl);
                    if (extracted) publicIdsToDelete.push(extracted);
                }
            }
        }

        // Unique non-null public IDs
        const uniqueIds = Array.from(new Set(publicIdsToDelete.filter(Boolean)));

        // Delete all images from Cloudinary with error logging
        const deletionErrors = [];
        for (const pid of uniqueIds) {
            try {
                await deleteFromCloudinary(pid);
                console.log(`[Cloudinary] Deleted asset: ${pid}`);
            } catch (err) {
                console.error(`[Cloudinary] Error deleting asset ${pid}:`, err.message);
                deletionErrors.push({ publicId: pid, error: err.message });
            }
        }

        // Remove document permanently from MongoDB
        await Product.findByIdAndDelete(req.params.id);
        console.log(`[MongoDB] Deleted product document: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Product and associated Cloudinary assets deleted successfully',
            deletedAssetsCount: uniqueIds.length,
            partialErrors: deletionErrors.length > 0 ? deletionErrors : undefined
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, deliveryCharge, description, category, subcategory, slug, variants } = req.body;

        let primaryImage = 'https://placehold.co/600x800';
        let primaryPublicId = null;
        const galleryImages = [];

        // Support files from upload.any() or upload.single()
        const files = req.files || (req.file ? [req.file] : []);

        const primaryFile = files.find(f => f.fieldname === 'image');
        if (primaryFile) {
            const uploadResult = await uploadToCloudinary(primaryFile.buffer, 'pritis_collection/products');
            primaryImage = uploadResult.url;
            primaryPublicId = uploadResult.publicId;
        } else if (req.body.image) {
            primaryImage = req.body.image;
            primaryPublicId = extractCloudinaryPublicId(req.body.image);
        }

        // Multiple gallery images
        const additionalFiles = files.filter(f => f.fieldname === 'images' || f.fieldname === 'gallery');
        for (const file of additionalFiles) {
            const upResult = await uploadToCloudinary(file.buffer, 'pritis_collection/products');
            galleryImages.push({
                url: upResult.url,
                publicId: upResult.publicId,
            });
        }

        // Parse variants from JSON string
        let parsedVariants = [];
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            } catch { parsedVariants = []; }
        }

        const productSlug = slug || toSlug(name);

        // Attach SKUs to each variant - Price Override removed: normal product pricing applies
        const variantsWithSku = parsedVariants.map(v => ({
            size: v.size,
            color: v.color || null,
            stock: Number(v.stock ?? 0),
            sku: `${productSlug}-${toSlug(v.size)}${v.color ? `-${toSlug(v.color)}` : ''}`,
        }));

        const catId = await resolveCategoryId(category);

        const product = new Product({
            name: name.trim(),
            price: Number(price),
            deliveryCharge: Math.max(0, Number(deliveryCharge || 0)),
            image: primaryImage,
            imagePublicId: primaryPublicId,
            images: galleryImages,
            category: catId,
            subcategory: subcategory || null,
            description,
            slug: productSlug,
            isActive: true,
            variants: variantsWithSku,
            stock: variantsWithSku.reduce((sum, v) => sum + v.stock, 0),
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, deliveryCharge, description, category, subcategory, slug, variants } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (name !== undefined) product.name = name.trim();
        if (price !== undefined) product.price = Number(price);
        if (deliveryCharge !== undefined) product.deliveryCharge = Math.max(0, Number(deliveryCharge));
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = await resolveCategoryId(category);
        if (subcategory !== undefined) product.subcategory = subcategory || null;
        if (slug !== undefined) product.slug = slug.trim();

        const files = req.files || (req.file ? [req.file] : []);

        // Replace primary image if new one provided
        const primaryFile = files.find(f => f.fieldname === 'image');
        if (primaryFile) {
            // Delete old primary image if in Cloudinary
            const oldId = product.imagePublicId || extractCloudinaryPublicId(product.image);
            if (oldId) {
                try { await deleteFromCloudinary(oldId); } catch (e) { console.warn('Old image delete warning:', e.message); }
            }
            const uploadResult = await uploadToCloudinary(primaryFile.buffer, 'pritis_collection/products');
            product.image = uploadResult.url;
            product.imagePublicId = uploadResult.publicId;
        } else if (req.body.image !== undefined && req.body.image !== product.image) {
            product.image = req.body.image;
            product.imagePublicId = extractCloudinaryPublicId(req.body.image);
        }

        // Additional gallery images
        const additionalFiles = files.filter(f => f.fieldname === 'images' || f.fieldname === 'gallery');
        if (additionalFiles.length > 0) {
            const currentImages = Array.isArray(product.images) ? [...product.images] : [];
            for (const file of additionalFiles) {
                const upResult = await uploadToCloudinary(file.buffer, 'pritis_collection/products');
                currentImages.push({
                    url: upResult.url,
                    publicId: upResult.publicId,
                });
            }
            product.images = currentImages;
        }

        // Variants - Price Override removed
        if (variants !== undefined) {
            let parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            const productSlug = product.slug;
            product.variants = parsedVariants.map(v => ({
                size: v.size,
                color: v.color || null,
                stock: Number(v.stock ?? 0),
                sku: `${productSlug}-${toSlug(v.size)}${v.color ? `-${toSlug(v.color)}` : ''}`,
            }));
            product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
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
