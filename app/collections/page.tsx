"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

const ethnicCollections = [
    {
        id: "banarasi",
        title: "The Royal Banarasi Edit",
        subtitle: "Heritage Katan Silks with Intricate Zari",
        description: "Handwoven in the ancient alleys of Varanasi, featuring delicate floral jaals and regal gold zari pallus designed for milestone celebrations.",
        href: "/shop?search=banarasi",
        tag: "Heritage Craft",
    },
    {
        id: "anarkali",
        title: "Noor: Festive Anarkalis",
        subtitle: "Flowy Georgettes & Gota Patti Ensembles",
        description: "Flared silhouettes adorned with sequin work, delicate mirror borders, and ethereal dupattas tailored for sangeet, mehendi, and reception evenings.",
        href: "/shop?search=anarkali",
        tag: "Festive Glamour",
    },
    {
        id: "kurti",
        title: "Everyday Chanderi & Cotton",
        subtitle: "Effortless Handloom Kurtis & Sets",
        description: "Lightweight, breathable fabrics with handcrafted block prints and minimalist embroidery—perfect for boutique workwear and intimate gatherings.",
        href: "/shop?search=kurti",
        tag: "Everyday Luxury",
    },
    {
        id: "bridal",
        title: "The Bridal Trousseau",
        subtitle: "Opulent Lehengas & Velvet Ensembles",
        description: "Heavy zardozi embroidery, rich royal maroon and jewel-toned velvets, paired with ornate blouses and dramatic bridal can-can volume.",
        href: "/shop?search=lehenga",
        tag: "Haute Bridal",
    },
    {
        id: "kanjivaram",
        title: "Kanjivaram Temple Weaves",
        subtitle: "Lustrous South Silk with Contrast Borders",
        description: "Authentic temple motifs and contrast borders woven with pure gold and silver dipped zari, treasured for generations as family heirlooms.",
        href: "/shop?search=saree",
        tag: "Pure Silk",
    },
    {
        id: "fusion",
        title: "Contemporary Indo-Western",
        subtitle: "Cape Sets, Drape Sarees & Evening Gowns",
        description: "Modernized traditional silhouettes offering pre-stitched ease, dramatic asymmetrical capes, and sculpted bodices for the modern woman.",
        href: "/shop?search=dress",
        tag: "Modern Couturier",
    },
];

export default function CollectionsPage() {
    return (
        <div className="bg-cream min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium flex items-center justify-center gap-1.5">
                        <Sparkles size={14} className="text-secondary" /> Curated Atelier Edits
                    </span>
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-serif text-primary font-bold"
                    >
                        Signature Collections
                    </motion.h1>
                    <p className="text-sm text-foreground/70 leading-relaxed font-sans">
                        Explore our handcrafted thematic capsules, each dedicated to a distinct Indian textile art form, weaving tradition, and festive occasion.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ethnicCollections.map((col, index) => (
                        <motion.div
                            key={col.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                        >
                            <Link
                                href={col.href}
                                className="group block bg-white rounded-2xl p-7 border border-[#E8E1F0] shadow-2xs hover:shadow-md hover:border-secondary/40 transition-all duration-300 h-full flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-secondary/15 text-primary">
                                            {col.tag}
                                        </span>
                                        <span className="text-xs font-serif text-secondary-dark font-semibold">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-primary group-hover:text-primary-light transition-colors">
                                            {col.title}
                                        </h3>
                                        <p className="text-xs font-medium text-secondary-dark mt-1">
                                            {col.subtitle}
                                        </p>
                                    </div>

                                    <p className="text-xs text-foreground/70 leading-relaxed">
                                        {col.description}
                                    </p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-secondary-dark transition-colors">
                                    <span>Explore Edit</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Custom Consultation Banner */}
                <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-primary text-cream text-center space-y-4 relative overflow-hidden shadow-lg">
                    <div className="relative z-10 max-w-xl mx-auto space-y-3">
                        <span className="text-xs uppercase tracking-widest text-secondary font-medium">
                            Custom Trousseau Assistance
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-cream">
                            Looking for Matching Sets or Specific Color Themes?
                        </h2>
                        <p className="text-xs sm:text-sm text-cream/80">
                            Our boutique stylist team coordinates custom dyeing, blouse embroidery, and bridal packages with direct artisan customization.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/contact"
                                className="inline-block px-7 py-3 rounded-full bg-secondary text-primary font-semibold text-xs uppercase tracking-wider hover:bg-secondary-light transition-all shadow-md"
                            >
                                Contact Our Atelier
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
