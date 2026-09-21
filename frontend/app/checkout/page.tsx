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
    const [paymentMethod, setPaymentMethod] = useState("Razorpay");
    const [loading, setLoading] = useState(false);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>
                    Your cart is empty.{" "}
                    <Link href="/shop" className="text-primary hover:underline">
                        Go Shopping
                    </Link>
                </p>
            </div>
        );
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("Please login to place an order");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                orderItems: cartItems,
                shippingAddress: { address, city, postalCode, country },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
            };

            // ✅ CASH ON DELIVERY
            if (paymentMethod === "COD") {
                const res = await createOrder(orderData, user.token);
                if (res?.success) {
                    clearCart();
                    alert("Order placed successfully!");
                    router.push("/profile");
                }
                setLoading(false);
                return;
            }

            // ✅ RAZORPAY PAYMENT
            const paymentOrder = await createPaymentOrder(
                totalPrice,
                user.token
            );

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                name: "Pritis Collection",
                description: "Premium Ethnic Wear Purchase",
                image: "/logo.png",
                order_id: paymentOrder.id,

                handler: async function (response: any) {
                    try {
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        };

                        const verifyRes = await verifyPayment(
                            verificationData,
                            user.token
                        );

                        if (!verifyRes.success) {
                            alert("Payment verification failed");
                            setLoading(false);
                            return;
                        }

                        const finalOrder = {
                            ...orderData,
                            paymentResult: {
                                id: response.razorpay_payment_id,
                                status: "success",
                                update_time: new Date().toISOString(),
                                email_address: user.email,
                                razorpay_order_id: response.razorpay_order_id,
                            },
                            isPaid: true,
                            paidAt: Date.now(),
                        };

                        await createOrder(finalOrder, user.token);
                        clearCart();
                        alert("Payment successful! Order placed.");
                        router.push("/profile");
                    } catch (err) {
                        console.error(err);
                        alert(
                            "Payment successful but order creation failed. Contact support."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                prefill: {
                    name: user.name,
                    email: user.email,
                },

                theme: {
                    color: "#6D121F",
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                alert(response.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (error: any) {
            console.error(error);
            alert(error?.response?.data?.message || "Order failed");
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
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                        />

                        {/* PAYMENT */}
                        <div className="pt-6">
                            <h2 className="text-xl font-medium mb-2">Payment Method</h2>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={paymentMethod === "Razorpay"}
                                    onChange={() => setPaymentMethod("Razorpay")}
                                />
                                Razorpay (UPI / Card / Netbanking)
                            </label>

                            <label className="flex items-center gap-2 mt-2">
                                <input
                                    type="radio"
                                    checked={paymentMethod === "COD"}
                                    onChange={() => setPaymentMethod("COD")}
                                />
                                Cash on Delivery
                            </label>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full py-4 rounded-md mt-6 font-medium transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-primary text-cream hover:bg-primary-light"
                                }`}
                        >
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </form>
                </div>

                {/* SUMMARY */}
                <div className="bg-gray-50 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>

                    {cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between text-sm mb-2">
                            <span>
                                {item.name} × {item.qty}
                            </span>
                            <span>
                                ₹{(item.price * item.qty).toLocaleString("en-IN")}
                            </span>
                        </div>
                    ))}

                    <div className="border-t pt-4 flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{itemsPrice.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span>
                    </div>

                    <div className="border-t pt-4 flex justify-between font-bold text-primary">
                        <span>Total</span>
                        <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
        </div>
    );
}
