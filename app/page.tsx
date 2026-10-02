"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { ArrowRight, Sparkles, Feather, Crown, HeartHandshake } from "lucide-react";

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
            subtitle: "Handwoven Banarasi & Kanjivaram",
            href: "/shop?search=saree",
            badge: "Bestseller",
        },
        {
            title: "Festive Anarkalis",
            subtitle: "Sequin & Zari Embellishments",
            href: "/shop?search=anarkali",
            badge: "Festive",
        },
        {
            title: "Chanderi Kurtis",
            subtitle: "Everyday Luxury Silhouettes",
            href: "/shop?search=kurti",
            badge: "Popular",
        },
        {
            title: "Bridal Lehengas",
            subtitle: "Bespoke Haute Ensembles",
            href: "/shop?search=lehenga",
            badge: "Bridal",
        },
    ];

    return (
        <div className="w-full min-h-screen bg-cream">
            {/* 1. Hero Section */}
            <Hero />

            {/* 2. Curated Categories Strip */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium">
                        Curated Categories
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">
                        Explore By Silhouette
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.title}
                            href={cat.href}
                            className="group relative bg-white p-6 rounded-2xl border border-[#E8E1F0] shadow-2xs hover:shadow-md hover:border-secondary/40 transition-all duration-300 flex flex-col justify-between min-h-[170px]"
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

            {/* 3. Featured Products Grid */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E8E1F0]">
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 gap-3">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium">
                            Editor&apos;s Selection
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">
                            Signature Festive Arrivals
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

            {/* 4. Craftsmanship Heritage Section */}
            <section className="w-full bg-white border-y border-[#E8E1F0] py-20 my-12">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium flex items-center gap-1.5">
                                <Sparkles size={14} className="text-secondary" /> Master Craftsmanship
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-primary leading-tight">
                                Handwoven Heritage, Crafted For Royalty
                            </h2>
                            <p className="text-sm sm:text-base text-foreground/70 leading-relaxed font-sans">
                                Every saree in Priti&apos;s Collection represents weeks of meticulous handloom craftsmanship. We partner directly with master weavers in Varanasi, Chanderi, and Kanchipuram to preserve generational weaving techniques while presenting silhouettes tailored for contemporary celebrations.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1">
                                    <Feather size={20} className="text-secondary" />
                                    <h4 className="font-serif font-bold text-sm text-gray-900">Pure Silks</h4>
                                    <p className="text-xs text-foreground/60">Certified mulberry and katan silks with genuine zari.</p>
                                </div>
                                <div className="space-y-1">
                                    <Crown size={20} className="text-secondary" />
                                    <h4 className="font-serif font-bold text-sm text-gray-900">Bespoke Fit</h4>
                                    <p className="text-xs text-foreground/60">Custom fall, edging, and blouse stitching on demand.</p>
                                </div>
                                <div className="space-y-1">
                                    <HeartHandshake size={20} className="text-secondary" />
                                    <h4 className="font-serif font-bold text-sm text-gray-900">Direct Artisans</h4>
                                    <p className="text-xs text-foreground/60">Supporting generational weaver communities.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cream rounded-2xl p-8 border border-secondary/20 space-y-6 text-center">
                            <h3 className="font-serif text-2xl font-bold text-primary">
                                Planning a Wedding or Special Celebration?
                            </h3>
                            <p className="text-sm text-foreground/70 max-w-md mx-auto">
                                Our bespoke bridal styling team offers private consultations for matching sets, family trousseaus, and custom size tailoring.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-block px-8 py-3.5 rounded-full bg-primary text-cream font-medium text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md"
                            >
                                Book A Bridal Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
