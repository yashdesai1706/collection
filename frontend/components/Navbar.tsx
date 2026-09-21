"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "Collections", href: "/collections" },
        { name: "About", href: "/about" },
    ];

    const { isAuthenticated, user, logout } = useAuthStore();
    const { cartItems } = useCartStore();
    const { wishlistItems } = useWishlistStore();

    return (
        <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-secondary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-2xl md:text-3xl text-primary font-bold tracking-tight">
                        Pritis Collection
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-foreground/80 hover:text-primary transition-colors font-medium font-sans uppercase text-sm tracking-wide"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6 relative">
                        {isSearchOpen ? (
                            <form onSubmit={handleSearch} className="absolute top-full right-0 mt-2 w-72 bg-white p-3 rounded-lg shadow-xl border border-gray-100 z-50">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-primary text-sm bg-gray-50"
                                />
                                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </form>
                        ) : null}

                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="text-foreground/80 hover:text-primary transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        <Link href="/wishlist" className="text-foreground/80 hover:text-primary transition-colors relative">
                            <Heart size={20} />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>

                        {mounted && isAuthenticated ? (
                            <div className="relative group h-full flex items-center">
                                <button className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors py-2">
                                    <User size={20} />
                                    <span className="text-sm font-medium hidden lg:block">Hi, {user?.name?.split(' ')[0]}</span>
                                </button>
                                {/* Dropdown with bridge (pt-2) to fix hover gap */}
                                <div className="absolute right-0 top-full w-48 pt-2 hidden group-hover:block">
                                    <div className="bg-white rounded-md shadow-xl py-1 border border-gray-100 ring-1 ring-black ring-opacity-5">
                                        {user?.isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-foreground/80 hover:text-primary transition-colors flex items-center">
                                <User size={20} />
                            </Link>
                        )}

                        <Link href="/cart" className="text-foreground/80 hover:text-primary transition-colors relative">
                            <ShoppingBag size={20} />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Menu Button & Cart */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link href="/cart" className="text-foreground relative">
                            <ShoppingBag size={22} />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-cream border-t border-secondary/20 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-4 text-lg font-medium text-foreground border-b border-gray-100 hover:bg-secondary/5 hover:text-primary transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <Link
                                href="/wishlist"
                                className="block px-4 py-4 text-lg font-medium text-foreground border-b border-gray-100 hover:bg-secondary/5 hover:text-primary transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Wishlist ({wishlistItems.length})
                            </Link>
                        </div>

                        {/* Mobile Auth Menu */}
                        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
                            {mounted && isAuthenticated ? (
                                <>
                                    <div className="text-sm font-medium text-gray-500 mb-2">
                                        Signed in as {user?.name}
                                    </div>
                                    {user?.isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="block py-2 text-lg font-medium text-primary"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link
                                        href="/profile"
                                        className="block py-2 text-lg font-medium text-foreground hover:text-primary"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="block py-2 text-lg font-medium text-red-500 hover:text-red-600"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block py-2 text-lg font-medium text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
}
