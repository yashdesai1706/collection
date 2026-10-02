"use client";

import Link from "next/link";
import { User, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-cream flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href="/login" className="block h-full">
                        <div className="h-full bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-primary/20 group text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User size={40} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Welcome Back</h2>
                            <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                                Access your saved items, view order history, and manage your account details.
                            </p>
                            <span className="inline-flex items-center text-primary font-medium group-hover:underline">
                                Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </motion.div>

                {/* Register Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/register" className="block h-full">
                        <div className="h-full bg-primary text-white p-10 rounded-2xl shadow-lg hover:shadow-xl hover:bg-primary-light transition-all duration-300 group text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                <UserPlus size={40} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold mb-4">New Here?</h2>
                            <p className="text-white/80 mb-8 max-w-xs mx-auto">
                                Join our community to unlock exclusive offers, wishlists, and a personalized shopping experience.
                            </p>
                            <span className="inline-flex items-center text-white font-medium group-hover:underline">
                                Create Account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
