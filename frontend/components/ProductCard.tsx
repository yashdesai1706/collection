"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductProps {
    product: {
        id?: number;
        _id?: string;
        name: string;
        price: number;
        category: string;
        image: string;
        slug: string;
    }
}

export default function ProductCard({ product }: ProductProps) {
    const { addToCart } = useCartStore();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setIsWishlisted(wishlistItems.some((item) => item._id === product._id || item._id === String(product.id)));
        }
    }, [wishlistItems, product, isHydrated]);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isWishlisted) {
            removeFromWishlist(product._id || String(product.id));
        } else {
            addToWishlist({
                _id: product._id || String(product.id),
                name: product.name,
                image: product.image,
                price: product.price,
                stock: 10, // Default fallback
                slug: product.slug
            });
        }
    };

    const handleAddToCart = () => {
        addToCart({
            _id: product._id || String(product.id),
            name: product.name,
            image: product.image,
            price: product.price,
            qty: 1,
            stock: 10, // Default stock if not provided
            slug: product.slug,
            category: product.category
        } as any);
        alert(`${product.name} added to cart!`);
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    // Remove /api suffix if present to get the base URL
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    const imageUrl = product.image?.startsWith('http')
        ? product.image
        : `${baseUrl}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

    return (
        <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image Container */}
            <div className="aspect-[3/4] w-full bg-gray-200 relative overflow-hidden">
                <Image
                    src={imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <button
                    onClick={toggleWishlist}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm z-10"
                >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
                </button>

                {/* Overlay Actions - Desktop Hover / Mobile Visible */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
                    <button
                        onClick={handleAddToCart}
                        className="bg-white text-primary px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95"
                    >
                        <ShoppingBag size={16} />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-2">
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">{product.category}</p>
                <Link href={`/product/${product.slug}`} className="block group-hover:text-primary transition-colors">
                    <h3 className="font-serif text-lg font-medium text-primary line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <p className="font-sans text-foreground/80 font-semibold text-lg">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    {/* Mobile Cart Button (Visible for better touch access) */}
                    <button
                        onClick={handleAddToCart}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary active:bg-primary active:text-white transition-colors"
                    >
                        <ShoppingBag size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
