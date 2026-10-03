"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const { isAuthenticated, user, logout } = useAuthStore();
    const { cartItems } = useCartStore();
    const { wishlistItems } = useWishlistStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    // Alt+A quick shortcut for admin
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.altKey || e.key.toLowerCase() !== "a") return;
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            if (!useAuthStore.getState().user?.isAdmin) return;
            e.preventDefault();
            router.push("/admin");
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setIsOpen(false);
            setSearchQuery("");
        }
    };

    const navLinks = [
        { name: "Shop All", href: "/shop" },
        { name: "Sarees", href: "/shop?search=saree" },
        { name: "Kurtis", href: "/shop?search=kurti" },
        { name: "Dresses", href: "/shop?search=dress" },
        { name: "Collections", href: "/collections" },
        { name: "Our Story", href: "/about" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E1F0] w-full max-w-full">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 min-w-0">

                    {/* ZONE 1: BRAND LOGO */}
                    <div className="flex-shrink-0 min-w-0">
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
                            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-secondary/30 bg-white shadow-xs group-hover:border-secondary transition-colors shrink-0">
                                <Image
                                    src="/logo.jpg"
                                    alt="Priti's Collection"
                                    fill
                                    sizes="(max-width: 640px) 32px, 44px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-serif text-base sm:text-xl md:text-2xl text-primary font-bold tracking-tight leading-none group-hover:text-primary-light transition-colors whitespace-nowrap">
                                    Priti&apos;s Collection
                                </span>
                                <span className="text-[8px] sm:text-[10px] tracking-[0.14em] uppercase text-secondary-dark font-medium mt-0.5 whitespace-nowrap hidden sm:block">
                                    Fashion That Defines You
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* ZONE 2: DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center space-x-7">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-foreground/85 hover:text-primary transition-colors text-sm font-medium tracking-wide relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-secondary hover:after:w-full after:transition-all after:duration-300"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* ZONE 3: ACTIONS & UTILITIES */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
                        {/* Desktop Search Input */}
                        <form onSubmit={handleSearch} className="hidden xl:flex items-center relative">
                            <input
                                type="text"
                                placeholder="Search sarees, kurtis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 pl-9 pr-3 py-1.5 rounded-full text-xs bg-white border border-[#E8E1F0] focus:outline-none focus:border-secondary focus:w-60 transition-all shadow-2xs"
                            />
                            <Search size={14} className="absolute left-3 text-foreground/40 pointer-events-none" />
                        </form>

                        {/* Search Icon Button for Mobile/Tablet */}
                        <div className="relative xl:hidden">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="p-1.5 sm:p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-black/5"
                                aria-label="Search"
                            >
                                <Search size={18} className="sm:w-5 sm:h-5" />
                            </button>

                            {isSearchOpen && (
                                <div className="fixed sm:absolute inset-x-4 top-18 sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-72 bg-white p-3 rounded-xl shadow-lg border border-[#E8E1F0] z-50">
                                    <form onSubmit={handleSearch} className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search collection..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                            className="w-full pl-9 pr-8 py-2 text-sm bg-cream/50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                        />
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={() => setIsSearchOpen(false)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Wishlist Link */}
                        <Link
                            href="/wishlist"
                            className="p-1.5 sm:p-2 text-foreground/80 hover:text-primary transition-colors relative rounded-full hover:bg-black/5"
                            aria-label="Wishlist"
                        >
                            <Heart size={18} className="sm:w-5 sm:h-5" />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-primary text-cream text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Link */}
                        <Link
                            href="/cart"
                            className="p-1.5 sm:p-2 text-foreground/80 hover:text-primary transition-colors relative rounded-full hover:bg-black/5"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-secondary text-primary font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {/* User Account / Profile */}
                        {mounted && isAuthenticated ? (
                            <div className="relative group hidden sm:block">
                                <button className="flex items-center gap-2 p-1.5 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-black/5">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium hidden md:inline-block max-w-[100px] truncate">
                                        {user?.name?.split(" ")[0]}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                                    <div className="bg-white rounded-xl shadow-xl py-2 border border-[#E8E1F0]">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                                            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        {user?.isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            My Orders & Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-primary text-cream hover:bg-primary-light transition-colors"
                            >
                                <User size={14} />
                                <span>Sign In</span>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1.5 sm:p-2 text-foreground/80 hover:text-primary transition-colors lg:hidden rounded-md"
                            aria-label="Toggle navigation menu"
                        >
                            {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-cream border-t border-[#E8E1F0] overflow-hidden shadow-lg"
                    >
                        {/* Mobile Search */}
                        <div className="p-4 border-b border-gray-100">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search sarees, kurtis, dresses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E8E1F0] rounded-full focus:outline-none focus:border-secondary"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </form>
                        </div>

                        {/* Links */}
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile User Section */}
                        <div className="p-4 bg-white/60 border-t border-[#E8E1F0] space-y-2">
                            {mounted && isAuthenticated ? (
                                <>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Signed in as <strong className="text-gray-900">{user?.name}</strong>
                                    </div>
                                    {user?.isAdmin && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsOpen(false)}
                                            className="block py-1.5 text-xs font-semibold text-primary"
                                        >
                                            Admin Dashboard →
                                        </Link>
                                    )}
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="block py-1.5 text-xs text-gray-700"
                                    >
                                        My Orders & Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="block py-1.5 text-xs font-medium text-red-600"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center py-2.5 rounded-full text-xs font-medium bg-primary text-cream hover:bg-primary-light transition-colors"
                                >
                                    Sign In / Register
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
