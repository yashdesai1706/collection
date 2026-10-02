"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative h-[80vh] w-full bg-cream overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-full transform translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-secondary/10 rounded-tr-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <span className="text-secondary font-medium tracking-widest text-sm uppercase">Pritis Collection</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-tight">
                            Timeless <br className="hidden md:block" /> Ethnic Elegance
                        </h1>
                        <p className="text-lg text-foreground/70 max-w-md leading-relaxed">
                            Discover our handcrafted collection of Sarees, Kurtis, and Dresses designed to make every moment special.
                        </p>
                        <div className="pt-4 flex space-x-4">
                            <Link href="/shop" className="bg-primary text-cream px-8 py-3 rounded-md font-medium hover:bg-primary-light transition-all shadow-lg hover:shadow-xl">
                                Shop Now
                            </Link>
                            <Link href="/about" className="px-8 py-3 rounded-md font-medium text-primary border border-primary hover:bg-primary/5 transition-colors">
                                Our Story
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden md:block relative h-[600px] w-full"
                    >
                        {/* Placeholder for Hero Image */}
                        <div className="absolute inset-0 rounded-t-full overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80" // Authentic Indian Saree Image
                                alt="Elegant Saree Collection"
                                fill
                                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                                priority
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
