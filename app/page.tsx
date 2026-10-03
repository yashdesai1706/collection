"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts()
            .then((data) => {
                if (Array.isArray(data)) {
                    // Take top 8 active products
                    setFeaturedProducts(data.slice(0, 8));
                }
            })
            .catch((err) => {
                console.error("Failed to load featured products:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const categories = [
        {
            title: "Royal Sarees",
            subtitle: "Festive & Party Silk Sarees",
            href: "/shop?search=saree",
            badge: "Bestseller",
        },
        {
            title: "Festive Anarkalis",
            subtitle: "Embellished Party Suits & Gowns",
            href: "/shop?search=anarkali",
            badge: "Festive",
        },
        {
            title: "Designer Kurtis",
            subtitle: "Daily & Occasion Wear",
            href: "/shop?search=kurti",
            badge: "Popular",
        },
        {
            title: "Party Wear",
            subtitle: "Celebration Sets & Lehengas",
            href: "/shop?search=lehenga",
            badge: "Trending",
        },
    ];

    return (
        <div className="w-full min-h-screen bg-cream">
            {/* 1. Hero Section */}
            <Hero />

            {/* 2. Curated Categories Strip */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium">
                        Curated Categories
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">
                        Explore By Category
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.title}
                            href={cat.href}
                            className="group relative bg-white p-6 rounded-2xl border border-[#E8E1F0] shadow-2xs hover:shadow-md hover:border-secondary/40 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
                        >
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/15 text-primary tracking-wide">
                                    {cat.badge}
                                </span>
                                <h3 className="font-serif text-xl font-bold text-primary group-hover:text-primary-light transition-colors mt-3">
                                    {cat.title}
                                </h3>
                                <p className="text-xs text-foreground/60 mt-1">
                                    {cat.subtitle}
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-secondary-dark group-hover:translate-x-1 transition-transform">
                                <span>Browse Designs</span>
                                <ArrowRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 3. Direct WhatsApp Assistance Banner */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 rounded-2xl p-6 sm:p-8 border border-emerald-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-13 h-13 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <MessageCircle size={28} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                                Personal Boutique Assistance & Orders
                            </span>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                                Chat with us on WhatsApp
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Need help with fabric, sizing, or video call showcase? Message us anytime at{" "}
                                <a
                                    href="https://wa.me/919075271108"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-emerald-700 hover:underline"
                                >
                                    9075271108
                                </a>
                            </p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/919075271108"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2.5 flex-shrink-0 active:scale-95"
                    >
                        <MessageCircle size={18} />
                        <span>WhatsApp: 9075271108</span>
                    </a>
                </div>
            </section>

            {/* 4. Featured Products Grid */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 border-t border-[#E8E1F0]">
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 gap-3">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium">
                            Fresh Collection
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">
                            Signature Arrivals
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors uppercase tracking-wider"
                    >
                        <span>View Full Catalog</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[3/4] rounded-xl bg-white/60 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <p className="text-foreground/60 text-sm">Welcome to Priti&apos;s Collection. Browse our curated boutique catalog.</p>
                        <Link href="/shop" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-primary text-cream text-xs font-semibold">
                            Explore Shop
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
