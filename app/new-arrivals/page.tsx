"use client";

import { fetchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts().then(data => {
            // Sort by createdAt descending (assuming _id or createdAt field exists, otherwise use array order)
            // Ideally backend should handle sorting, but doing client-side for now
            const sorted = [...data].reverse().slice(0, 12);
            setProducts(sorted);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center font-serif text-xl text-primary">Loading New Arrivals...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <span className="text-secondary font-medium tracking-widest text-sm uppercase">Just In</span>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mt-2">New Arrivals</h1>
                    <p className="text-foreground/70 mt-3 max-w-lg">
                        Explore our latest collection of premium sarees, kurtis, and dresses. Handpicked for the season.
                    </p>
                </div>
                <Link href="/shop" className="group flex items-center gap-2 font-medium text-primary hover:text-primary-light transition-colors">
                    View All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-24 text-foreground/50">
                    <p>No new arrivals at the moment.</p>
                </div>
            )}
        </div>
    );
}
