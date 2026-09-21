"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const collections = [
    {
        id: 1,
        title: "Summer Breeze",
        description: "Light and airy styles for the warm season.",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        href: "/shop?category=summer",
        size: "large"
    },
    {
        id: 2,
        title: "Winter Elegance",
        description: "Cozy layers and sophisticated textures.",
        image: "https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=800&q=80",
        href: "/shop?category=winter",
        size: "small"
    },
    {
        id: 3,
        title: "Accessories",
        description: "The perfect finishing touches.",
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
        href: "/shop?category=accessories",
        size: "small"
    },
    {
        id: 4,
        title: "Formal Wear",
        description: "Make a statement at every event.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        href: "/shop?category=formal",
        size: "medium"
    },
    {
        id: 5,
        title: "Casual Chic",
        description: "Effortless style for everyday living.",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
        href: "/shop?category=casual",
        size: "medium"
    }
];

export default function CollectionsPage() {
    return (
        <div className="bg-cream min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif text-primary font-bold mb-4"
                    >
                        Our Collections
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg"
                    >
                        Discover curated selections designed to elevate your wardrobe for every season and occasion.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ${collection.size === 'large' ? 'lg:col-span-2' : ''
                                }`}
                        >
                            <Link href={collection.href} className="block h-full w-full">
                                <Image
                                    src={collection.image}
                                    alt={collection.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                <div className="absolute bottom-0 left-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h2 className="text-3xl font-serif text-white mb-2">{collection.title}</h2>
                                    <p className="text-white/80 font-medium mb-4">{collection.description}</p>
                                    <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-semibold tracking-wide uppercase hover:bg-white hover:text-primary transition-colors">
                                        Explore Collection
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
