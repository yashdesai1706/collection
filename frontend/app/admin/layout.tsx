"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    LogOut,
    Menu,
    X,
    User
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user?.isAdmin) {
            router.push("/login?redirect=/admin");
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user?.isAdmin) {
        return null; // Will redirect via useEffect
    }

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: ShoppingBag },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white rounded-md shadow-md text-gray-700"
                >
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-gray-100">
                        <span className="text-xl font-serif font-bold text-primary">Admin Panel</span>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-primary">
                                <User size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                router.push("/login");
                            }}
                            className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                {children}
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
