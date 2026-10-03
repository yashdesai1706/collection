"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useState, useEffect } from "react";

interface ProductProps {
    product: {
        id?: number;
        _id?: string;
        name: string;
        price: number;
        deliveryCharge?: number;
        category: any;
        image: string;
        slug: string;
        stock?: number;
        variants?: Array<{
            _id: string;
            size: string;
            color: string | null;
            stock: number;
            image?: string | null;
        }>;
    };
}

export default function ProductCard({ product }: ProductProps) {
    const { addToCart } = useCartStore();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

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
                stock: 10,
                slug: product.slug,
            });
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const firstVariant = product.variants?.[0];
        const stock = firstVariant ? firstVariant.stock : (product.stock ?? 10);
        if (stock <= 0) return;

        addToCart({
            _id: product._id || String(product.id),
            variantId: firstVariant?._id || product._id || String(product.id),
            name: product.name,
            image: firstVariant?.image || product.image,
            price: product.price,
            deliveryCharge: Number(product.deliveryCharge || 0),
            qty: 1,
            stock: stock,
            size: firstVariant?.size || "Free Size",
            color: firstVariant?.color || undefined,
            slug: product.slug,
        });

        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1800);
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    const imageUrl = product.image?.startsWith('http')
        ? product.image
        : `${baseUrl}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;

    const categoryName = typeof product.category === 'object' && product.category !== null
        ? product.category.name
        : product.category || 'Ethnic Wear';

    const firstVariant = product.variants?.[0];
    const totalStock = product.stock ?? firstVariant?.stock ?? 10;
    const isOutOfStock = totalStock <= 0;

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden border border-[#E8E1F0] shadow-2xs hover:shadow-md hover:border-secondary/30 transition-all duration-300 flex flex-col">
            {/* Image Container with 3:4 Aspect Ratio */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] w-full bg-cream overflow-hidden">
                <Image
                    src={imageUrl || "/logo.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized={imageUrl.startsWith('http')}
                />

                {/* Stock Tag */}
                {isOutOfStock && (
                    <span className="absolute top-3 left-3 bg-red-800 text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                        Sold Out
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    type="button"
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white shadow-xs transition-colors z-10"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        size={16}
                        fill={isWishlisted ? "#DC2626" : "none"}
                        className={isWishlisted ? "text-red-600" : ""}
                    />
                </button>

                {/* Slide-Up Desktop Quick Add Action */}
                {!isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:flex justify-center bg-gradient-to-t from-black/50 via-black/25 to-transparent">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={justAdded}
                            className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                                justAdded
                                    ? "bg-emerald-700 text-white"
                                    : "bg-white text-primary hover:bg-primary hover:text-cream"
                            }`}
                        >
                            {justAdded ? (
                                <>
                                    <Check size={14} /> Added to Bag
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={14} /> Quick Add
                                </>
                            )}
                        </button>
                    </div>
                )}
            </Link>

            {/* Product Meta Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-white">
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-medium block">
                        {categoryName}
                    </span>
                    <Link href={`/product/${product.slug}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="font-serif text-sm sm:text-base font-medium text-gray-900 line-clamp-1 mt-0.5">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-end justify-between pt-1">
                    <div>
                        <p className="font-serif text-base font-bold text-primary">
                            ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] font-sans">
                            {Number(product.deliveryCharge || 0) > 0 ? (
                                <span className="text-gray-500">+ ₹{product.deliveryCharge} delivery</span>
                            ) : (
                                <span className="text-emerald-700 font-medium">Free Delivery</span>
                            )}
                        </p>
                    </div>

                    {/* Mobile Quick Add Button */}
                    {!isOutOfStock && (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={justAdded}
                            className={`sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                justAdded
                                    ? "bg-emerald-700 text-white"
                                    : "bg-primary/10 text-primary active:bg-primary active:text-white"
                            }`}
                            aria-label="Add to cart"
                        >
                            {justAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
