"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQty } = useCartStore();

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 5000 ? 0 : 200;
    const totalPrice = itemsPrice + shippingPrice;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                    <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-serif text-primary font-bold">Your cart is empty</h2>
                <p className="text-foreground/60">Looks like you haven't added anything yet.</p>
                <Link
                    href="/shop"
                    className="mt-4 bg-primary text-cream px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-primary mb-8">Shopping Cart ({cartItems.length})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => (
                        <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                        >
                            <div className="relative w-full sm:w-24 h-32 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                <Image src={item.image || "https://placehold.co/600x400?text=No+Image"} alt={item.name} fill className="object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <Link href={`/product/${item.slug}`} className="font-serif text-lg font-medium text-primary hover:underline">
                                            {item.name}
                                        </Link>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-foreground/60 mt-1">
                                        {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex items-center border border-gray-200 rounded-md">
                                        <button
                                            onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                                            className="p-1 hover:bg-gray-50 text-gray-500"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item._id, Math.min(item.stock, item.qty + 1))}
                                            className="p-1 hover:bg-gray-50 text-gray-500"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <p className="font-medium text-lg">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-md h-fit">
                    <h3 className="font-serif text-xl font-bold text-primary mb-6">Order Summary</h3>

                    <div className="space-y-3 text-sm text-foreground/80 pb-6 border-b border-gray-100">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg text-primary pt-4 mb-6">
                        <span>Total</span>
                        <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <Link
                        href="/checkout"
                        className="w-full bg-primary text-cream py-4 rounded-md font-medium text-center flex items-center justify-center gap-2 hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/20"
                    >
                        Proceed to Checkout <ArrowRight size={18} />
                    </Link>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        Secure checkout powered by Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
}
