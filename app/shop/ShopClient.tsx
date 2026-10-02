"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, ArrowUpDown, X, Sparkles } from "lucide-react";

export default function ShopClient() {
    const [products, setProducts] = useState<any[]>([]);
    const [dbCategories, setDbCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("All");
    const [sortBy, setSortBy] = useState("featured");

    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams?.get("search")?.toLowerCase().trim() || "";

    useEffect(() => {
        Promise.all([
            fetchProducts(),
            getCategories().catch(() => [])
        ]).then(([prodData, catData]) => {
            setProducts(Array.isArray(prodData) ? prodData : []);
            setDbCategories(Array.isArray(catData) ? catData : []);
        }).catch((err) => {
            console.error("Failed to load catalog:", err);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const getCatName = (cat: any): string => {
        if (!cat) return "";
        if (typeof cat === "string") return cat;
        if (typeof cat === "object" && typeof cat.name === "string") return cat.name;
        return "";
    };

    // Aggregate unique category names from DB + products
    const allCategoryNames = useMemo(() => {
        const set = new Set<string>();
        dbCategories.forEach((c) => { if (c.name) set.add(c.name.trim()); });
        products.forEach((p) => {
            const name = getCatName(p.category).trim();
            if (name) set.add(name);
        });
        return ["All", ...Array.from(set)];
    }, [dbCategories, products]);

    // Filter and Sort
    const filteredProducts = useMemo(() => {
        let result = products.filter((p) => {
            const prodCat = getCatName(p.category).trim().toLowerCase();
            const filterCat = filterCategory.trim().toLowerCase();

            const matchesCategory = filterCat === "all" || prodCat === filterCat;
            const matchesSearch = !searchQuery ||
                p.name?.toLowerCase().includes(searchQuery) ||
                prodCat.includes(searchQuery) ||
                p.description?.toLowerCase().includes(searchQuery) ||
                p.fabric?.toLowerCase().includes(searchQuery);

            return matchesCategory && matchesSearch;
        });

        // Sorting
        if (sortBy === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === "newest") {
            result.sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
        }

        return result;
    }, [products, filterCategory, searchQuery, sortBy]);

    const clearSearch = () => {
        router.push("/shop");
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 min-h-[60vh]">
                <div className="flex items-center justify-center gap-3 text-primary font-serif text-lg">
                    <Sparkles className="animate-spin text-secondary" size={20} />
                    <span>Curating Boutique Collection...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 border-b border-[#E8E1F0] gap-4">
                <div>
                    <span className="text-xs uppercase tracking-widest text-secondary-dark font-medium">
                        Boutique Catalog
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary mt-1">
                        {searchQuery ? `Search Results for "${searchQuery}"` : "The Festive Collection"}
                    </h1>
                    <p className="text-xs text-foreground/60 mt-1">
                        Showing {filteredProducts.length} authentic handcrafted {filteredProducts.length === 1 ? 'creation' : 'creations'}
                    </p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <ArrowUpDown size={14} className="text-gray-400" />
                    <label htmlFor="shop-sort" className="sr-only">Sort products</label>
                    <select
                        id="shop-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-[#E8E1F0] text-xs font-medium text-gray-700 py-2 px-3 rounded-full focus:outline-none focus:border-secondary shadow-2xs cursor-pointer"
                    >
                        <option value="featured">Featured & Curated</option>
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Category Filter Pills & Search Badge Bar */}
            <div className="py-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full md:w-auto">
                    <span className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5 mr-1 flex-shrink-0">
                        <SlidersHorizontal size={14} /> Filter:
                    </span>
                    {allCategoryNames.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                filterCategory === cat
                                    ? "bg-primary text-cream shadow-xs"
                                    : "bg-white text-foreground/80 border border-[#E8E1F0] hover:border-secondary/60 hover:text-primary"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Active search filter tag */}
                {searchQuery && (
                    <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-3 py-1 rounded-full text-xs">
                        <span className="text-primary font-medium">Search: &ldquo;{searchQuery}&rdquo;</span>
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id || product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E1F0] space-y-4 my-8">
                    <p className="text-base font-serif text-primary">No designs matched your criteria.</p>
                    <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                        Try clearing active filters or searching for terms like &ldquo;silk&rdquo;, &ldquo;kurti&rdquo;, or &ldquo;banarasi&rdquo;.
                    </p>
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => { setFilterCategory("All"); if (searchQuery) clearSearch(); }}
                            className="px-6 py-2.5 rounded-full bg-primary text-cream text-xs font-medium hover:bg-primary-light transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
