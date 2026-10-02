"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative w-full max-w-full bg-cream overflow-hidden border-b border-[#E8E1F0]">
            {/* Subtle background glow - safely contained */}
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-2xl sm:blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 bg-primary/5 rounded-full blur-2xl sm:blur-3xl pointer-events-none -translate-x-1/4 translate-y-1/4" />

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                    {/* Left Column: Brand Copy & Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-secondary/30 shadow-2xs">
                            <Sparkles size={14} className="text-secondary" />
                            <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-medium text-secondary-dark">
                                Festive & Bridal Collection 2026
                            </span>
                        </div>

                        <h1 className="w-full text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-primary leading-[1.15] tracking-tight break-words text-center lg:text-left">
                            Timeless Indian <br className="hidden sm:inline" />
                            <span className="italic font-normal text-secondary-dark">Ethnic Elegance</span>
                        </h1>

                        <p className="w-full text-sm sm:text-base text-foreground/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans text-center lg:text-left">
                            Handcrafted Banarasi silk sarees, embellished festive anarkalis, and bespoke bridal ensembles crafted by master artisans across India.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-cream font-medium text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md flex items-center justify-center gap-2 group text-center"
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
                        <div className="w-full pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-200/80 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                            <div>
                                <p className="font-serif text-base sm:text-lg font-bold text-primary">100%</p>
                                <p className="text-[10px] sm:text-[11px] text-foreground/60 leading-tight mt-0.5">Pure Handlooms</p>
                            </div>
                            <div>
                                <p className="font-serif text-base sm:text-lg font-bold text-primary">Custom</p>
                                <p className="text-[10px] sm:text-[11px] text-foreground/60 leading-tight mt-0.5">Bespoke Sizing</p>
                            </div>
                            <div>
                                <p className="font-serif text-base sm:text-lg font-bold text-primary">Worldwide</p>
                                <p className="text-[10px] sm:text-[11px] text-foreground/60 leading-tight mt-0.5">Tracked Express</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: High-Fashion Visual Composition */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full lg:col-span-5 relative flex justify-center"
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
