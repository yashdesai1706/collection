"use client";

import { fetchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ShopClient() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("All");

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    useEffect(() => {
        fetchProducts().then(data => {
            setProducts(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch products", err);
            setLoading(false);
        });
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category?.trim() || "Uncategorized")))];

    const filteredProducts = products.filter(p => {
        const prodCat = (p.category || "").trim().toLowerCase();
        const filterCat = filterCategory.trim().toLowerCase();

        const matchesCategory = filterCat === "all" || prodCat === filterCat;
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.category?.toLowerCase().includes(searchQuery) ||
            p.description?.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    console.log(`[Shop] Loaded ${products.length} products. Filter: ${filterCategory} -> Showing ${filteredProducts.length}`);

    if (loading) return <div className="h-screen flex items-center justify-center text-primary font-serif text-xl">Loading Collection...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        {searchQuery ? `Results for "${searchQuery}"` : "Shop Collection"}
                    </h1>
                    <p className="text-foreground/60 text-sm mt-1">Showing {filteredProducts.length} results</p>
                </div>

                {/* Simple Filter Toggle (Desktop) */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground/80 whitespace-nowrap">
                        <SlidersHorizontal size={16} /> Filter by:
                    </span>
                    {categories.map(cat => (
                        <button
                            key={cat as string}
                            onClick={() => setFilterCategory(cat as string)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${filterCategory === cat
                                ? "bg-primary text-cream border-primary"
                                : "bg-transparent text-foreground/70 border-gray-300 hover:border-primary hover:text-primary"
                                }`}
                        >
                            {cat as string}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    <ProductCard key={product._id || product.id} product={product} />
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-24 text-foreground/50">
                    <p>No products found in this category.</p>
                </div>
            )}
        </div>
    );
}
