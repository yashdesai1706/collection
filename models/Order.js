const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        name:      { type: String, required: true },
        qty:       { type: Number, required: true },
        image:     { type: String, required: true },
        price:     { type: Number, required: true },
        size:      { type: String, default: 'Free Size' },
        color:     { type: String, default: null },
        product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: mongoose.Schema.Types.ObjectId, default: null }, // nullable for pre-migration orders
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
        // TODO: requires product/client decision: Mandatory phone field - whether existing accounts without one get prompted on next login
    },
    // MVP: COD disabled, see TODO: Support Cash on Delivery when courier COD reconciliation is live
    paymentMethod: { type: String, required: true, default: 'Razorpay' },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
        razorpay_order_id: String
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    // TODO: requires product/client decision: Order status state machine (Ready to Ship / In Transit / Out for Delivery / Delivered / RTO)
    status: { type: String, default: "Processing" }
}, { timestamps: true });

// Audit Fix: Critical secondary indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'paymentResult.razorpay_order_id': 1 });
orderSchema.index({ isPaid: 1, totalPrice: 1 });

module.exports = mongoose.model('Order', orderSchema);
