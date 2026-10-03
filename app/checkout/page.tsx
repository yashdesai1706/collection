"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { createOrder, createPaymentOrder, verifyPayment } from "@/lib/api";

export default function CheckoutPage() {
    const { cartItems, itemsPrice, shippingPrice, totalPrice, clearCart } =
        useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();

    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("India");
    const [phone, setPhone] = useState("");
    const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; amount: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const [paymentNotice, setPaymentNotice] = useState<{
        type: "error" | "warning" | "success" | "info";
        message: string;
        action?: { label: string; onClick: () => void };
    } | null>(null);

    if (confirmedOrder) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">Order Confirmed!</h1>
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 my-6 text-left space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <p className="font-semibold text-gray-900 text-sm">
                            Your order is being processed soon
                        </p>
                    </div>
                    <p className="text-xs text-gray-600">
                        🚚 <strong>Delivery Timeline:</strong> Your order will be carefully packaged and delivered within <strong>2-3 working days</strong>.
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                        Order Reference: #{confirmedOrder.id}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href={`https://wa.me/919075271108?text=${encodeURIComponent(`Namaste Priti's Collection! I have confirmed my order #${confirmedOrder.id} for ₹${confirmedOrder.amount}. Please share my delivery updates here.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-medium text-sm shadow hover:bg-[#20bd5a] transition-all"
                    >
                        <span>💬 Receive WhatsApp Updates</span>
                    </a>
                    <Link
                        href="/profile"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-cream font-medium text-sm hover:bg-primary-light transition-all"
                    >
                        View in My Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>
                    Your cart is empty.{" "}
                    <Link href="/shop" className="text-primary hover:underline font-medium">
                        Go Shopping
                    </Link>
                </p>
            </div>
        );
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentNotice(null);

        if (!user) {
            setPaymentNotice({
                type: "warning",
                message: "Please log in to complete your checkout."
            });
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            // Prepare order items and shipping address for server-side verification
            const checkoutPayload = {
                existingOrderId: pendingOrderId || undefined,
                orderItems: cartItems.map((item) => ({
                    product: item._id,
                    variantId: item.variantId,
                    name: item.name,
                    qty: item.qty,
                    size: item.size || "Free Size",
                    color: item.color || null,
                })),
                shippingAddress: { address, city, postalCode, country, phone },
            };

            // 1. Create server-side order and Razorpay order (amounts computed exclusively from DB)
            const paymentOrder = await createPaymentOrder(checkoutPayload, user.token);

            if (!paymentOrder?.razorpayOrderId) {
                throw new Error(paymentOrder?.message || "Failed to initialize payment gateway");
            }

            // Save pending order reference for instant retries
            setPendingOrderId(paymentOrder.orderId);

            // 2. Configure Razorpay Standard Checkout modal
            const options = {
                key: paymentOrder.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TgEvMyIg4zYGxS",
                amount: paymentOrder.amount, // in paise, computed by server
                currency: paymentOrder.currency || "INR",
                name: "Priti's Collection",
                description: "Luxury Ethnic & Bridal Wear",
                image: "/logo.png",
                order_id: paymentOrder.razorpayOrderId,

                // Configure standard payment suite (Cards, UPI, Netbanking, Wallets)
                config: {
                    display: {
                        blocks: {
                            methods: {
                                name: "Pay via Cards, UPI, Netbanking or Wallets",
                                instruments: [
                                    { 
                                        method: "upi",
                                        flows: ["qr", "intent", "collect"] // Collect is likely disabled by Razorpay for this account, so QR/Intent are required for UPI to show up at all
                                    },
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" }
                                ]
                            }
                        },
                        sequence: ["block.methods"],
                        preferences: {
                            show_default_blocks: false
                        }
                    }
                },

                handler: async function (response: any) {
                    try {
                        setLoading(true);
                        setPaymentNotice({
                            type: "info",
                            message: "Verifying payment with bank..."
                        });

                        // 3. Server-side HMAC-SHA256 signature verification & atomic stock deduction
                        const verifyRes = await verifyPayment(
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            user.token
                        );

                        if (!verifyRes.success) {
                            setPaymentNotice({
                                type: "error",
                                message: "Payment verification failed. Please contact boutique support if money was deducted."
                            });
                            setLoading(false);
                            return;
                        }

                        // Payment & stock fulfillment complete
                        clearCart();
                        setConfirmedOrder({
                            id: response.razorpay_order_id || paymentOrder.orderId,
                            amount: paymentOrder.amount ? paymentOrder.amount / 100 : 0
                        });
                        setLoading(false);
                    } catch (err: any) {
                        console.error("Verification error:", err);
                        setPaymentNotice({
                            type: "error",
                            message: err?.response?.data?.message || "Payment verification failed. Please check your bank status."
                        });
                        setLoading(false);
                    }
                },

                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: phone,
                },

                theme: {
                    color: "#6D121F", // Royal Maroon brand tone
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setPaymentNotice({
                            type: "warning",
                            message: "Payment was cancelled. Your details are saved — click 'Pay Now' below whenever you wish to retry."
                        });
                    },
                },
            };

            const RazorpayConstructor = (window as any).Razorpay;
            if (!RazorpayConstructor) {
                // If it's undefined but hasn't explicitly fired onError yet, it's still loading or failed silently
                throw new Error("Razorpay checkout is still loading. Please wait a moment and try again.");
            }

            const rzp = new RazorpayConstructor(options);

            rzp.on("payment.failed", function (response: any) {
                console.warn("Payment failed:", response?.error?.description || "Unknown reason");
                setLoading(false);
                setPaymentNotice({
                    type: "error",
                    message: response?.error?.description || "Payment failed. Please try a different card, UPI or bank."
                });
            });

            rzp.open();
        } catch (error: any) {
            console.error("Checkout submission error:", error);
            setPaymentNotice({
                type: "error",
                message: error?.response?.data?.message || error.message || "Failed to process checkout. Please try again."
            });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">
                Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* SHIPPING */}
                <div>
                    <h2 className="text-xl font-medium mb-4">Shipping Address</h2>

                    {paymentNotice && (
                        <div
                            className={`p-4 rounded-lg mb-6 text-sm flex items-start justify-between ${
                                paymentNotice.type === "error"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : paymentNotice.type === "warning"
                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                        : paymentNotice.type === "success"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                        >
                            <span>{paymentNotice.message}</span>
                            <div className="flex items-center space-x-4">
                                {paymentNotice.action && (
                                    <button
                                        type="button"
                                        onClick={paymentNotice.action.onClick}
                                        className="text-xs font-semibold underline hover:opacity-70"
                                    >
                                        {paymentNotice.action.label}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPaymentNotice(null)}
                                    className="text-xs font-semibold hover:opacity-70"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <input
                            required
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />

                            <input
                                required
                                placeholder="Postal Code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </div>

                        <input
                            required
                            type="tel"
                            placeholder="Mobile / WhatsApp Number (for order & delivery updates)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />

                        <input
                            required
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        {/* PAYMENT */}
                        <div className="pt-6">
                            <h2 className="text-xl font-medium mb-3">Payment Method</h2>

                            <label className="flex items-center gap-3 p-3 border rounded-lg border-primary/40 bg-primary/5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    checked={true}
                                    readOnly
                                    className="accent-primary w-4 h-4"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Razorpay Secure Online Payment</p>
                                    <p className="text-xs text-gray-500">Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking & Wallets</p>
                                </div>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !razorpayLoaded}
                            className={`w-full py-4 rounded-md mt-6 font-medium transition shadow-lg ${
                                loading || !razorpayLoaded
                                    ? "bg-gray-400 cursor-not-allowed text-white shadow-none"
                                    : "bg-primary text-cream hover:bg-primary-light shadow-primary/20 active:scale-[0.99]"
                            }`}
                        >
                            {loading ? "Initializing Secure Payment..." : (!razorpayLoaded ? "Loading secure payment gateway..." : `Pay Now • ₹${totalPrice.toLocaleString("en-IN")}`)}
                        </button>
                    </form>
                </div>

                {/* SUMMARY */}
                <div className="bg-gray-50 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>

                    {cartItems.map((item) => (
                        <div key={item.variantId || item._id} className="flex justify-between text-sm mb-2">
                            <span>
                                {item.name} × {item.qty}
                                {Number(item.deliveryCharge || 0) > 0 && (
                                    <span className="block text-[11px] text-gray-500">
                                        Delivery: ₹{item.deliveryCharge} × {item.qty}
                                    </span>
                                )}
                            </span>
                            <span className="font-medium text-gray-900">
                                ₹{(item.price * item.qty).toLocaleString("en-IN")}
                            </span>
                        </div>
                    ))}

                    <div className="border-t pt-4 flex justify-between">
                        <span>Items Subtotal</span>
                        <span>₹{itemsPrice.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="font-medium">
                            {shippingPrice === 0 ? (
                                <span className="text-emerald-700 font-semibold">Free Delivery</span>
                            ) : (
                                `₹${shippingPrice}`
                            )}
                        </span>
                    </div>

                    <div className="border-t pt-4 flex justify-between font-bold text-primary">
                        <span>Total Payable</span>
                        <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            <Script
                key={`rzp-script-${retryKey}`}
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onLoad={() => setRazorpayLoaded(true)}
                onError={() => {
                    setRazorpayLoaded(false);
                    setPaymentNotice({
                        type: "error",
                        message: "Razorpay checkout failed to load due to a network issue. Please check your connection or ad-blocker.",
                        action: {
                            label: "Try Again",
                            onClick: () => {
                                setPaymentNotice(null);
                                setRetryKey(k => k + 1);
                            }
                        }
                    });
                }}
            />
        </div>
    );
}
