"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, MessageCircle, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOOKS = [
    {
        id: "saree",
        title: "Curated Silk & Festive Sarees",
        subtitle: "Rich colors, elegant borders & festive drapes",
        badge: "Bestseller Collection",
        tag: "Sarees & Drapes",
        priceHint: "Starts ₹1,899",
        image: "/images/hero/hero_saree.jpg",
        href: "/shop?search=saree",
    },
    {
        id: "anarkali",
        title: "Festive Anarkalis & Party Suits",
        subtitle: "Graceful flares, embroidery & celebration wear",
        badge: "Trending Styles",
        tag: "Suits & Gowns",
        priceHint: "Starts ₹2,199",
        image: "/images/hero/hero_anarkali.jpg",
        href: "/shop?search=anarkali",
    },
    {
        id: "kurti",
        title: "Designer Chanderi & Daily Kurtis",
        subtitle: "Trendy prints, comfortable fits & casual glam",
        badge: "Everyday Favorites",
        tag: "Kurtis & Sets",
        priceHint: "Starts ₹799",
        image: "/images/hero/hero_kurti.jpg",
        href: "/shop?search=kurti",
    },
];

export default function Hero() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto rotate looks smoothly every 5 seconds
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % LOOKS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const currentLook = LOOKS[activeIndex];

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? LOOKS.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % LOOKS.length);
    };

    return (
        <section className="relative w-full max-w-full bg-cream overflow-hidden border-b border-[#E8E1F0]">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/15 rounded-full blur-2xl sm:blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-primary/10 rounded-full blur-2xl sm:blur-3xl pointer-events-none -translate-x-1/4 translate-y-1/4" />

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left Column: Clean & Minimal Boutique Intro */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
                    >
                        {/* Festive Announcement Pill */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-secondary/40 shadow-2xs">
                            <Sparkles size={14} className="text-secondary shrink-0" />
                            <span className="text-[11px] sm:text-xs font-semibold text-secondary-dark tracking-wide">
                                Fresh Festive Arrivals • Direct Boutique Pricing
                            </span>
                        </div>

                        {/* Direct & Warm Headline */}
                        <h1 className="w-full text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary leading-[1.15] tracking-tight break-words text-center lg:text-left">
                            Celebrate Every Occasion in <br className="hidden sm:inline" />
                            <span className="italic font-normal text-secondary-dark">Handpicked Ethnic Charm</span>
                        </h1>

                        {/* Honest, Warm, Relatable Copy (No Fake Claims) */}
                        <p className="w-full text-sm sm:text-base text-foreground/75 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans text-center lg:text-left">
                            Explore our handpicked collection of beautiful festive sarees, stylish anarkalis, and everyday designer kurtis — carefully curated and delivered right to your doorstep across India.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full">
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary text-cream font-medium text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md flex items-center justify-center gap-2 group text-center"
                            >
                                <span>Explore Collection</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* WhatsApp Direct Help for Local Customers */}
                            <a
                                href="https://wa.me/917387937278?text=Hello%20Priti's%20Collection!%20I'm%20looking%20for%20festive%20sarees%20and%20dresses."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group text-center"
                                title="Chat directly with us on WhatsApp"
                            >
                                <MessageCircle size={15} />
                                <span>WhatsApp Order & Help</span>
                            </a>
                        </div>

                        {/* Quick Category Discovery Bar */}
                        <div className="w-full pt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60 mb-2.5 flex items-center gap-1.5 justify-center lg:justify-start">
                                <span>Popular right now:</span>
                            </p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                <Link
                                    href="/shop?search=saree"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-primary hover:text-cream text-primary border border-secondary/30 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                >
                                    🥻 Sarees
                                </Link>
                                <Link
                                    href="/shop?search=anarkali"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-primary hover:text-cream text-primary border border-secondary/30 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                >
                                    👗 Anarkalis & Suits
                                </Link>
                                <Link
                                    href="/shop?search=kurti"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-primary hover:text-cream text-primary border border-secondary/30 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                >
                                    ✨ Designer Kurtis
                                </Link>
                                <Link
                                    href="/shop?sort=price_low"
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/20 hover:bg-secondary hover:text-primary-dark text-secondary-dark border border-secondary/50 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                >
                                    🏷️ Under ₹1,499
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Clean, Minimal Image Showcase (No Tabs) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full lg:col-span-5 relative flex flex-col items-center"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Minimal Image Showcase Card */}
                        <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-secondary/30 shadow-2xl bg-white group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentLook.id}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src={currentLook.image}
                                        alt={currentLook.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        priority
                                    />

                                    {/* Top Social Proof Pill */}
                                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                                        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-primary/90 text-cream backdrop-blur-md shadow-md border border-white/20">
                                            {currentLook.badge}
                                        </span>
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/95 text-primary backdrop-blur-md shadow-md border border-secondary/30">
                                            <Star size={12} className="text-secondary fill-secondary" />
                                            <span>4.9 (1,200+ Happy Customers)</span>
                                        </div>
                                    </div>

                                    {/* Subtle Prev / Next Navigation Arrows */}
                                    <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrev();
                                            }}
                                            aria-label="Previous look"
                                            className="pointer-events-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNext();
                                            }}
                                            aria-label="Next look"
                                            className="pointer-events-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    {/* Minimal Bottom Details & Direct Link */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/30 to-transparent flex items-end p-5 sm:p-6">
                                        <div className="text-white w-full space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase tracking-widest text-secondary-light font-medium">
                                                    {currentLook.tag}
                                                </span>
                                                <span className="text-xs font-semibold text-secondary-light bg-secondary/20 px-2 py-0.5 rounded-full border border-secondary/30">
                                                    {currentLook.priceHint}
                                                </span>
                                            </div>
                                            <h3 className="font-serif text-lg sm:text-xl font-bold text-cream leading-tight">
                                                {currentLook.title}
                                            </h3>
                                            <p className="text-xs text-cream/80 line-clamp-1">
                                                {currentLook.subtitle}
                                            </p>
                                            <div className="pt-1.5">
                                                <Link
                                                    href={currentLook.href}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary-light text-primary font-semibold text-xs transition-colors shadow-sm"
                                                >
                                                    <span>View In Shop</span>
                                                    <ArrowRight size={13} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Minimal Dot Indicators */}
                            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                {LOOKS.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            activeIndex === idx ? "w-5 bg-secondary" : "w-1.5 bg-white/50"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
