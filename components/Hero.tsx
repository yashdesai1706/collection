"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative w-full bg-cream overflow-hidden border-b border-[#E8E1F0]">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: Brand Copy & Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 space-y-6 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-secondary/30 shadow-2xs">
                            <Sparkles size={14} className="text-secondary" />
                            <span className="text-[11px] uppercase tracking-widest font-medium text-secondary-dark">
                                Festive & Bridal Collection 2026
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-bold text-primary leading-[1.1] tracking-tight">
                            Timeless Indian <br className="hidden sm:inline" />
                            <span className="italic font-normal text-secondary-dark">Ethnic Elegance</span>
                        </h1>

                        <p className="text-sm sm:text-base text-foreground/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                            Handcrafted Banarasi silk sarees, embellished festive anarkalis, and bespoke bridal ensembles crafted by master artisans across India.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-cream font-medium text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md flex items-center justify-center gap-2 group"
                            >
                                <span>Shop The Collection</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/collections"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-primary border border-secondary/40 font-medium text-xs uppercase tracking-wider hover:bg-cream transition-all shadow-2xs text-center"
                            >
                                View Curated Lookbook
                            </Link>
                        </div>

                        {/* Subtle reassurance points */}
                        <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                            <div>
                                <p className="font-serif text-lg font-bold text-primary">100%</p>
                                <p className="text-[11px] text-foreground/60">Pure Handlooms</p>
                            </div>
                            <div>
                                <p className="font-serif text-lg font-bold text-primary">Custom</p>
                                <p className="text-[11px] text-foreground/60">Bespoke Sizing</p>
                            </div>
                            <div>
                                <p className="font-serif text-lg font-bold text-primary">Worldwide</p>
                                <p className="text-[11px] text-foreground/60">Tracked Express</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: High-Fashion Visual Composition */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-secondary/30 shadow-xl bg-white">
                            <Image
                                src="/logo.jpg"
                                alt="Priti's Collection Royal Ethnic Fashion"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Ambient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent flex items-end p-6">
                                <div className="text-white space-y-1">
                                    <span className="text-[10px] uppercase tracking-widest text-secondary-light font-medium">
                                        Handcrafted Heritage
                                    </span>
                                    <h3 className="font-serif text-xl font-bold text-cream">
                                        Priti&apos;s Signature Atelier
                                    </h3>
                                    <p className="text-xs text-cream/80">
                                        Every drape tells a story of royal Indian legacy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
