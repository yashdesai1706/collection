const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size:  { type: String, required: true },   // per-product: "S", "Free Size", "28", etc.
    color: { type: String, default: null },    // null = no color distinction
    stock: { type: Number, required: true, default: 0 },
    image: { type: String, default: null },    // null = use product.image
    sku:   { type: String },                   // auto-set: slug-size-color
    // Legacy field retained optionally for old documents; price override removed
    price: { type: Number, default: null },
}, { _id: true });

const imageAssetSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, default: null },
}, { _id: false });

const productSchema = new mongoose.Schema({
    name:           { type: String, required: true },
    slug:           { type: String, required: true, unique: true },
    description:    { type: String, required: true },
    price:          { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, default: 0, min: 0 },
    category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', default: null },
    image:          { type: String, required: true },
    imagePublicId:  { type: String, default: null },
    images: {
        type: [imageAssetSchema],
        default: [],
        set: (val) => {
            if (!Array.isArray(val)) return [];
            return val.map(item => {
                if (typeof item === 'string') {
                    return { url: item, publicId: null };
                }
                return {
                    url: item.url || '',
                    publicId: item.publicId || null,
                };
            }).filter(i => Boolean(i.url));
        }
    },
    fabric:       { type: String },
    isBestSeller: { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    // Legacy fallback: kept for migration safety. Total stock across variants
    stock:        { type: Number, default: 0 },
    variants:     [variantSchema],
}, { timestamps: true });

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });

module.exports = mongoose.model('Product', productSchema);
