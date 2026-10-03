const Product = require('../models/Product');

/**
 * Computes exact order totals and validates inventory entirely from the database.
 * Client-submitted prices and totals are strictly ignored.
 * Delivery charges are computed directly from each product's configured deliveryCharge.
 *
 * @param {Array} rawItems - Array of { product, variantId, qty } from client
 * @returns {Promise<{ formattedOrderItems: Array, itemsPrice: number, shippingPrice: number, taxPrice: number, totalPrice: number, amountInPaise: number }>}
 */
async function calculateOrderSummary(rawItems) {
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
        const error = new Error('Order items must be a non-empty list');
        error.statusCode = 400;
        throw error;
    }

    const formattedOrderItems = [];

    for (const item of rawItems) {
        const productId = item.product || item._id;
        if (!productId) {
            const error = new Error('Product ID is required for each cart item');
            error.statusCode = 400;
            throw error;
        }

        const qty = Math.floor(Number(item.qty));
        if (isNaN(qty) || qty < 1) {
            const error = new Error(`Invalid quantity for item: ${qty}`);
            error.statusCode = 400;
            throw error;
        }

        const product = await Product.findById(productId).lean();
        if (!product || product.isActive === false) {
            const error = new Error(`Product "${item.name || productId}" is no longer available`);
            error.statusCode = 400;
            throw error;
        }

        let variantId = null;
        let size = 'Free Size';
        let color = null;
        let itemImage = product.image;

        if (item.variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(
                (v) => v._id.toString() === item.variantId.toString()
            );

            if (!variant) {
                const error = new Error(`Variant not found for product "${product.name}"`);
                error.statusCode = 400;
                throw error;
            }

            if (variant.stock < qty) {
                const desc = `${variant.size}${variant.color ? ' / ' + variant.color : ''}`;
                const error = new Error(`Insufficient stock for "${product.name}" (${desc}). Available: ${variant.stock}, requested: ${qty}`);
                error.statusCode = 400;
                throw error;
            }

            variantId = variant._id;
            size = variant.size;
            color = variant.color || null;
            if (variant.image) itemImage = variant.image;
        } else if (product.variants && product.variants.length > 0) {
            // Client didn't pass variantId but product has variants: use the first variant
            const firstVariant = product.variants[0];
            if (firstVariant.stock < qty) {
                const error = new Error(`Insufficient stock for "${product.name}". Available: ${firstVariant.stock}, requested: ${qty}`);
                error.statusCode = 400;
                throw error;
            }
            variantId = firstVariant._id;
            size = firstVariant.size;
            color = firstVariant.color || null;
            if (firstVariant.image) itemImage = firstVariant.image;
        } else {
            // Legacy / simple product without variants
            if ((product.stock ?? 0) < qty) {
                const error = new Error(`Insufficient stock for "${product.name}". Available: ${product.stock ?? 0}, requested: ${qty}`);
                error.statusCode = 400;
                throw error;
            }
        }

        // Single clean product price (Price Override removed)
        const effectivePrice = Number(product.price);
        const itemDeliveryCharge = Number(product.deliveryCharge || 0);

        formattedOrderItems.push({
            product: product._id,
            variantId,
            name: product.name,
            image: itemImage,
            price: effectivePrice,
            deliveryCharge: itemDeliveryCharge,
            qty,
            size,
            color
        });
    }

    // Recompute monetary totals from scratch on the server
    const itemsPrice = formattedOrderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    // Shipping price is the sum of product delivery charges for all items in the order
    const shippingPrice = formattedOrderItems.reduce((acc, item) => acc + (item.deliveryCharge * item.qty), 0);
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    const amountInPaise = Math.round(totalPrice * 100);

    return {
        formattedOrderItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        amountInPaise
    };
}

module.exports = { calculateOrderSummary };
