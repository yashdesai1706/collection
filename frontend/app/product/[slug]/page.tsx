"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchProductBySlug } from '@/lib/api';
import { ShoppingBag, Star, Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    stock: number;
    colors: string[];
    sizes: string[];
    fabric: string;
    category: string;
    slug: string;
    numReviews?: number;
    rating?: number;
}

export default function ProductDetail() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [qty, setQty] = useState(1);

    const { addToCart } = useCartStore();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (product && isHydrated) {
            const exists = wishlistItems.some(item => item._id === product._id);
            setIsWishlisted(exists);
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
                })
        }
    }, [slug]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    const resolveImage = (img: string) => {
        if (!img) return "/placeholder.jpg";
        return img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
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
                        />
                    </div>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                        {[product.image, ...product.images].filter(Boolean).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`relative w-20 h-24 flex-shrink-0 border-2 rounded-md overflow-hidden ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                            >
                                <Image src={resolveImage(img)} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <span className="text-secondary font-medium tracking-widest text-sm uppercase">{product.category}</span>
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
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <p className="text-3xl font-sans font-medium">₹{product.price.toLocaleString('en-IN')}</p>

                    <div className="prose prose-sm text-foreground/80 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    {/* Selectors */}
                    <div className="space-y-4">
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm mb-2">Select Size</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border font-medium transition-all ${selectedSize === size
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-foreground border-gray-300 hover:border-primary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 text-white text-base">
                        <button
                            onClick={() => {
                                addToCart({
                                    _id: product._id,
                                    name: product.name,
                                    image: product.image,
                                    price: product.price,
                                    qty,
                                    stock: product.stock,
                                    color: product.colors[0],
                                    size: selectedSize || product.sizes[0],
                                    slug: product.slug
                                });
                                alert("Added to cart!");
                            }}
                            disabled={product.stock === 0}
                            className="flex-1 bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-primary/20"
                        >
                            <ShoppingBag size={20} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleWishlistToggle}
                            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-500'}`}
                        >
                            <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                        <p><span className="font-semibold text-foreground">Fabric:</span> {product.fabric || "Premium Quality"}</p>
                        <p><span className="font-semibold text-foreground">Care:</span> Dry Clean Only</p>
                        <p><span className="font-semibold text-foreground">Shipping:</span> Free shipping across India</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
