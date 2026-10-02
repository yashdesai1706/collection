// Centralized e-commerce shipping & tax configuration
// Eliminates magic numbers across frontend stores and backend calculations.

export const SHIPPING_CONFIG = {
    // Orders equal to or above this amount in INR (₹) qualify for 100% free delivery
    FREE_SHIPPING_MIN: 1999,

    // Flat standard shipping fee in INR (₹) when cart total is below the free threshold
    STANDARD_FEE: 150,

    // Goods and Services Tax standard rate (18% for boutique apparel)
    GST_RATE: 0.18,
};

// CommonJS compatible export for backend Express scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SHIPPING_CONFIG };
}
