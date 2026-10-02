"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function WishlistPage() {
    const { wishlistItems } = useWishlistStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading...</div>;

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <Heart size={48} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-serif text-primary font-bold mb-4">Your Wishlist is Empty</h1>
                <p className="text-foreground/70 mb-8 max-w-md">
                    You haven't added any items to your wishlist yet. Browse our collection and find your favorites!
                </p>
                <Link
                    href="/shop"
                    className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-primary font-bold mb-8 text-center">My Wishlist</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {wishlistItems.map((item) => (
                    <ProductCard
                        key={item._id}
                        product={{
                            ...item,
                            category: "Wishlist" // Fallback or fetch if needed, but item usually has it
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
