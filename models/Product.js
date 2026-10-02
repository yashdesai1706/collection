const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size:  { type: String, required: true },   // per-product: "S", "Free Size", "28", etc.
    color: { type: String, default: null },    // null = no color distinction
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number, default: null },    // null = use product basePrice
    image: { type: String, default: null },    // null = use product.image
    sku:   { type: String },                   // auto-set: slug-size-color
}, { _id: true });

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    // Renamed from price → basePrice. Variant price overrides this when set.
    price:       { type: Number, required: true },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', default: null },
    image:       { type: String, required: true },
    images:      [{ type: String }],
    fabric:      { type: String },
    isBestSeller: { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    // Legacy fallback: kept for migration safety. New products use variants[].stock
    stock:       { type: Number, default: 0 },
    // Per-variant inventory: each size+color pair has independent stock
    variants:    [variantSchema],
}, { timestamps: true });

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });

module.exports = mongoose.model('Product', productSchema);
