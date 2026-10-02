"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getAdminDashboardStats } from "@/lib/api";
import {
    TrendingUp,
    Package,
    ShoppingBag,
    Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        productCount: 0,
        orderCount: 0,
        totalSales: 0,
        userCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (user?.token) {
                    const data = await getAdminDashboardStats(user.token);
                    setStats(data);
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    useAuthStore.getState().logout();
                    window.location.href = "/login?redirect=/admin";
                    return;
                }
                setError(err.response?.data?.message || "Failed to load stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.token]);

    const statCards = [
        {
            title: "Total Sales",
            value: `₹${stats.totalSales.toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: "bg-blue-500"
        },
        {
            title: "Total Orders",
            value: stats.orderCount,
            icon: ShoppingBag,
            color: "bg-green-500"
        },
        {
            title: "Total Products",
            value: stats.productCount,
            icon: Package,
            color: "bg-purple-500"
        },
        {
            title: "Total Users",
            value: stats.userCount,
            icon: Users,
            color: "bg-orange-500"
        },
    ];

    if (loading) return <div className="text-gray-500">Loading dashboard...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.color} bg-opacity-10 text-opacity-100`}>
                            <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions or Recent Activity could go here later */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center py-12">
                <p className="text-gray-500">More analytics and charts coming soon.</p>
            </div>
        </div>
    );
}
