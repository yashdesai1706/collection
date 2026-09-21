const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with keys from .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890', // Fallback for dev safety
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key'
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in rupees

        const options = {
            amount: amount * 100, // Razorpay takes amount in paisa
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ message: "Payment initialization failed", error: error.message });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database order creation happens separately after this verification on client side, 
            // OR ideally, we create the order here. 
            // For now, adhering to instruction: user creates order in DB after verification success.
            // We just return success status here.
            res.json({
                success: true,
                message: "Payment verified successfully",
                paymentId: razorpay_payment_id
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};

module.exports = { createPaymentOrder, verifyPayment };
