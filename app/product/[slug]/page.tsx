"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchProductBySlug } from '@/lib/api';
import { ShoppingBag, Star, Heart, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface Variant {
    _id: string;
    size: string;
    color: string | null;
    stock: number;
    price: number | null; // null = use base price
    image?: string | null;
}

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    deliveryCharge?: number;
    image: string;
    images: string[];
    stock: number;
    fabric: string;
    category: string | { _id: string; name: string; slug: string };
    slug: string;
    variants: Variant[];
    numReviews?: number;
    rating?: number;
}

export default function ProductDetail() {
    const params = useParams();
    const slug = (params?.slug as string) || '';

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [qty, setQty] = useState(1);

    const { addToCart } = useCartStore();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => { setIsHydrated(true); }, []);

    useEffect(() => {
        if (product && isHydrated) {
            setIsWishlisted(wishlistItems.some(item => item._id === product._id));
        }
    }, [product, wishlistItems, isHydrated]);

    const handleWishlistToggle = () => {
        if (!product) return;
        if (isWishlisted) {
            removeFromWishlist(product._id);
            setIsWishlisted(false);
        } else {
            addToWishlist({
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                stock: product.stock,
                slug: product.slug
            });
            setIsWishlisted(true);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchProductBySlug(slug)
                .then(data => {
                    setProduct(data);
                    setSelectedImage(data.image);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [slug]);

    // Fallback single variant if product has no variants (e.g. legacy products)
    const variants = useMemo<Variant[]>(() => {
        if (product?.variants && product.variants.length > 0) {
            return product.variants;
        }
        if (product) {
            return [{
                _id: product._id,
                size: "Free Size",
                color: null,
                stock: product.stock ?? 0,
                price: product.price,
            }];
        }
        return [];
    }, [product]);

    // Unique sizes from variants
    const availableSizes = useMemo(() => {
        return [...new Set<string>(variants.map(v => v.size))];
    }, [variants]);

    // Auto-select size on load or variant change
    useEffect(() => {
        if (availableSizes.length > 0) {
            if (!selectedSize || !availableSizes.includes(selectedSize)) {
                const inStockSize = availableSizes.find(size =>
                    variants.some(v => v.size === size && v.stock > 0)
                );
                setSelectedSize(inStockSize || availableSizes[0]);
            }
        }
    }, [availableSizes, selectedSize, variants]);

    // Colors available for the selected size
    const colorsForSelectedSize = useMemo(() => {
        if (!selectedSize) return [];
        return variants
            .filter(v => v.size === selectedSize && v.color)
            .map(v => ({ color: v.color!, stock: v.stock }));
    }, [variants, selectedSize]);

    // Auto-select first in-stock color when size changes
    useEffect(() => {
        if (colorsForSelectedSize.length > 0) {
            const hasCurrentColor = colorsForSelectedSize.some(c => c.color === selectedColor);
            if (!hasCurrentColor) {
                const inStock = colorsForSelectedSize.find(c => c.stock > 0);
                setSelectedColor(inStock?.color || colorsForSelectedSize[0].color);
            }
        } else {
            setSelectedColor(null);
        }
    }, [selectedSize, colorsForSelectedSize, selectedColor]);

    // Find the currently active variant
    const activeVariant = useMemo(() => {
        if (!selectedSize || variants.length === 0) return null;
        if (selectedColor) {
            return variants.find(v => v.size === selectedSize && v.color === selectedColor) || null;
        }
        return variants.find(v => v.size === selectedSize && !v.color) ||
               variants.find(v => v.size === selectedSize) || null;
    }, [variants, selectedSize, selectedColor]);

    // Effective price: product price
    const effectivePrice = product?.price ?? activeVariant?.price ?? 0;
    const variantStock = activeVariant?.stock ?? 0;

    // CRITICAL FIX: Clamp quantity whenever active variant or its stock changes.
    // If user selected higher quantity on Color A, and changes to Color B with lower stock,
    // quantity is immediately updated to the maximum stock of Color B.
    useEffect(() => {
        if (activeVariant) {
            if (activeVariant.stock > 0) {
                setQty(prev => {
                    if (prev > activeVariant.stock) {
                        return activeVariant.stock; // Clamp down to max available stock
                    }
                    if (prev < 1) {
                        return 1;
                    }
                    return prev;
                });
            } else {
                setQty(1);
            }
        }
    }, [activeVariant]);

    // Switch image if variant has its own image
    useEffect(() => {
        if (activeVariant?.image) {
            setSelectedImage(activeVariant.image);
        }
    }, [activeVariant]);

    const handleColorClick = (color: string, stock: number) => {
        if (stock <= 0) return;
        setSelectedColor(color);
        // Proactively clamp quantity immediately upon click
        if (qty > stock) {
            setQty(stock);
        }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const resolveImage = (img: string) => {
        if (!img) return "/placeholder.jpg";
        return img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };

    const sizeHasStock = (size: string) => {
        return variants.some(v => v.size === size && v.stock > 0);
    };

    const [addedSuccess, setAddedSuccess] = useState(false);

    const handleAddToCart = () => {
        if (!product || !activeVariant || variantStock <= 0) return;
        const safeQty = Math.max(1, Math.min(qty, variantStock));
        addToCart({
            _id: product._id,
            variantId: activeVariant._id,
            name: product.name,
            image: activeVariant.image || product.image,
            price: effectivePrice,
            deliveryCharge: Number(product.deliveryCharge || 0),
            qty: safeQty,
            stock: variantStock,
            size: activeVariant.size,
            color: activeVariant.color || undefined,
            slug: product.slug,
        });
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2200);
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-primary font-serif text-xl">Loading...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center text-red-500">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={resolveImage(selectedImage || product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                        {[product.image, ...(product.images || [])].filter(Boolean).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`relative w-20 h-24 flex-shrink-0 border-2 rounded-md overflow-hidden ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                            >
                                <Image src={resolveImage(img)} alt="" fill className="object-cover" unoptimized />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <span className="text-secondary font-medium tracking-widest text-sm uppercase">
                            {typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}
                        </span>
                        <h1 className="text-4xl font-serif text-primary mt-2">{product.name}</h1>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-foreground/60">
                            {product.numReviews && product.numReviews > 0 ? (
                                <div className="flex items-center text-yellow-500">
                                    <Star size={16} fill="currentColor" />
                                    <span className="ml-1 text-foreground font-medium">{product.rating} ({product.numReviews} reviews)</span>
                                </div>
                            ) : (
                                <span className="text-secondary/80 italic">No ratings yet</span>
                            )}
                            <span className="text-gray-300">|</span>
                            <span className={`font-medium ${variantStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {variantStock > 0 ? `In Stock (${variantStock} left)` : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-3xl font-sans font-medium">₹{effectivePrice.toLocaleString('en-IN')}</p>
                        <p className="text-sm mt-1">
                            {Number(product.deliveryCharge || 0) > 0 ? (
                                <span className="text-gray-600 font-medium">Delivery: ₹{product.deliveryCharge}</span>
                            ) : (
                                <span className="text-emerald-700 font-semibold">Free Delivery</span>
                            )}
                        </p>
                    </div>

                    <div className="prose prose-sm text-foreground/80 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    {/* Variant Selectors */}
                    <div className="space-y-5">
                        {/* Size Selector */}
                        {availableSizes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">Select Size</h4>
                                    {selectedSize && (
                                        <span className="text-xs text-foreground/60">
                                            Selected: <strong className="text-primary">{selectedSize}</strong>
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map(size => {
                                        const inStock = sizeHasStock(size);
                                        const isSelected = selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    if (!inStock) return;
                                                    setSelectedSize(size);
                                                }}
                                                disabled={!inStock}
                                                className={`min-w-[44px] h-10 px-4 rounded-full flex items-center justify-center text-sm border font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : inStock
                                                            ? 'bg-white text-foreground border-gray-300 hover:border-primary'
                                                            : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selector */}
                        {colorsForSelectedSize.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">Select Color</h4>
                                    {selectedColor && (
                                        <span className="text-xs text-foreground/60">
                                            Selected: <strong className="text-primary">{selectedColor}</strong>
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {colorsForSelectedSize.map(({ color, stock }) => {
                                        const isSelected = selectedColor === color;
                                        const isOutOfStock = stock <= 0;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorClick(color, stock)}
                                                disabled={isOutOfStock}
                                                className={`px-4 py-2 rounded-full text-sm border font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : !isOutOfStock
                                                            ? 'bg-white text-foreground border-gray-300 hover:border-primary'
                                                            : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                                                    }`}
                                            >
                                                {color} {isOutOfStock ? '(Out of Stock)' : `(${stock})`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        {variantStock > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-sm">Quantity</h4>
                                    <span className="text-xs text-foreground/60">
                                        {variantStock <= 5 ? (
                                            <span className="text-amber-600 font-semibold">Only {variantStock} left in stock!</span>
                                        ) : (
                                            <span>{variantStock} available</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center border border-gray-200 rounded-md w-fit bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        disabled={qty <= 1}
                                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center font-medium select-none">{qty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQty(q => Math.min(variantStock, q + 1))}
                                        disabled={qty >= variantStock}
                                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                This option is currently out of stock. Please select another size or color.
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 text-white text-base">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={variantStock <= 0}
                            className={`flex-1 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
                                variantStock <= 0
                                    ? 'bg-gray-400 cursor-not-allowed text-white shadow-none'
                                    : addedSuccess
                                        ? 'bg-green-600 text-white shadow-green-600/20'
                                        : 'bg-primary hover:bg-primary-light text-white shadow-primary/20'
                            }`}
                        >
                            {addedSuccess ? <Check size={20} /> : <ShoppingBag size={20} />}
                            {variantStock <= 0
                                ? 'Out of Stock'
                                : addedSuccess
                                    ? 'Added to Cart! ✓'
                                    : `Add to Cart • ₹${(effectivePrice * qty).toLocaleString('en-IN')}`}
                        </button>
                        <button
                            type="button"
                            onClick={handleWishlistToggle}
                            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-500'}`}
                        >
                            <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                        <p><span className="font-semibold text-foreground">Fabric:</span> {product.fabric || "Premium Quality"}</p>
                        <p><span className="font-semibold text-foreground">Care:</span> Dry Clean Only</p>
                        <p>
                            <span className="font-semibold text-foreground">Shipping:</span>{" "}
                            {Number(product.deliveryCharge || 0) > 0 
                                ? `₹${product.deliveryCharge} delivery charge applies` 
                                : "Free delivery across India"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
