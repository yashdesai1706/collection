"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80"
                    alt="About Us"
                    fill
                    className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif font-bold mb-6"
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl font-light max-w-2xl mx-auto"
                    >
                        Crafting elegance for the modern individual since 2020.
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-serif font-bold text-primary mb-6">The Essence of Pritis Collection</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                            <p>
                                At Pritis Collection, we believe that fashion is more than just clothing—it is an expression of identity, confidence, and art. Founded with a passion for quality and an eye for detail, our brand strives to bring you timeless pieces that seamlessly blend contemporary trends with classic elegance.
                            </p>
                            <p>
                                Every tailored stitch and chosen fabric is a testament to our commitment to excellence. We curate collections that not only look beautiful but feel exceptional to wear, ensuring that you exude confidence in every step you take.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                            alt="Fashion Detail"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="mt-32">
                    <h2 className="text-3xl font-serif font-bold text-center text-primary mb-16">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "Quality", desc: "Uncompromising standards in every fabric and finish." },
                            { title: "Sustainability", desc: "Conscious choices for a better future in fashion." },
                            { title: "Inclusivity", desc: "Celebrating beauty in every form and silhouette." }
                        ].map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="text-center p-8 bg-cream/50 rounded-xl"
                            >
                                <h3 className="text-xl font-bold font-serif text-primary mb-4">{value.title}</h3>
                                <p className="text-gray-600">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
