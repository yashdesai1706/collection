"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQty, itemsPrice, shippingPrice, totalPrice } = useCartStore();

    // Auto-clamp any cart item whose quantity exceeds currently available stock
    useEffect(() => {
        cartItems.forEach((item) => {
            if (item.stock > 0 && item.qty > item.stock) {
                updateQty(item.variantId, item.stock);
            }
        });
    }, [cartItems, updateQty]);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
                    <ShoppingBag size={40} />
                </div>
                <h1 className="text-3xl font-serif text-primary font-bold">Your cart is empty</h1>
                <p className="text-foreground/60 text-sm max-w-sm text-center">
                    Discover our collection of handcrafted Sarees, Anarkalis, and Kurtis designed for festive and bridal moments.
                </p>
                <Link
                    href="/shop"
                    className="mt-4 bg-primary text-cream px-8 py-3 rounded-full text-sm font-medium hover:bg-primary-light transition-all shadow-md"
                >
                    Explore Boutique Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-8 pb-4 border-b border-[#E8E1F0] gap-2">
                <h1 className="text-3xl font-serif font-bold text-primary">Your Shopping Bag</h1>
                <span className="text-xs text-foreground/60 font-medium">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <motion.div
                            key={item.variantId}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col sm:flex-row gap-4 bg-white p-4 sm:p-5 rounded-xl border border-[#E8E1F0] shadow-2xs"
                        >
                            <div className="relative w-full sm:w-28 h-36 flex-shrink-0 bg-cream rounded-lg overflow-hidden border border-gray-100">
                                <Image
                                    src={item.image || "/logo.jpg"}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 112px"
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <Link href={`/product/${item.slug}`} className="font-serif text-base sm:text-lg font-medium text-primary hover:text-primary-light transition-colors line-clamp-1">
                                            {item.name}
                                        </Link>
                                        <button
                                            onClick={() => removeFromCart(item.variantId)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                            title="Remove item"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-foreground/60 mt-1.5">
                                        {item.size && (
                                            <span className="px-2 py-0.5 rounded bg-cream border border-gray-200">
                                                Size: {item.size}
                                            </span>
                                        )}
                                        {item.color && (
                                            <span className="px-2 py-0.5 rounded bg-cream border border-gray-200">
                                                Color: {item.color}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded border ${Number(item.deliveryCharge || 0) > 0 ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'}`}>
                                            Delivery: {Number(item.deliveryCharge || 0) > 0 ? `₹${item.deliveryCharge} / unit` : 'Free'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.variantId, item.qty - 1)}
                                                disabled={item.qty <= 1}
                                                className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.variantId, item.qty + 1)}
                                                disabled={item.qty >= item.stock}
                                                className="px-2.5 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        {item.stock > 0 && item.qty >= item.stock && (
                                            <span className="text-[11px] text-amber-700 font-medium">
                                                Max stock reached
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-base sm:text-lg text-primary">
                                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary Rail */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-[#E8E1F0] shadow-2xs space-y-5">
                        <h2 className="font-serif text-lg font-bold text-primary pb-3 border-b border-gray-100">
                            Order Summary
                        </h2>

                        <div className="space-y-3 text-xs text-foreground/80">
                            <div className="flex justify-between">
                                <span>Bag Total</span>
                                <span className="font-medium text-gray-900">₹{itemsPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping Charges</span>
                                <span className="font-medium">
                                    {shippingPrice === 0 ? (
                                        <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">Free</span>
                                    ) : (
                                        `₹${shippingPrice}`
                                    )}
                                </span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                                Inclusive of all applicable taxes & GST.
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                            <span className="font-medium text-sm text-gray-900">Estimated Total</span>
                            <span className="font-bold text-xl text-primary font-serif">
                                ₹{totalPrice.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full bg-primary text-cream py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:bg-primary-light transition-all shadow-md active:scale-98"
                        >
                            Proceed to Checkout <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
                        <ShieldCheck size={16} className="text-secondary" />
                        <span>100% Encrypted & Secure Checkout</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
