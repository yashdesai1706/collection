"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchMyOrders } from '@/lib/api';
import { motion } from 'framer-motion';
import { Package, User, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user) {
            fetchMyOrders(user.token)
                .then(data => {
                    setOrders(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch orders", err);
                    setLoading(false);
                });
        }
    }, [isAuthenticated, user, router]);

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / User Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary/10">
                        <div className="text-center mb-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                                <User size={40} />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-primary">{user.name}</h2>
                            <p className="text-sm text-foreground/60">{user.email}</p>
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <button onClick={logout} className="w-full text-left text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-md transition-colors">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content / Orders */}
                <div className="lg:col-span-3">
                    <h1 className="text-3xl font-serif font-bold text-primary mb-6">My Orders</h1>

                    {loading ? (
                        <div className="text-center py-12 text-foreground/60">Loading your orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                            <Package size={48} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-6">You haven't placed any orders properly.</p>
                            <Link href="/shop" className="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-light">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow-sm border border-secondary/10 overflow-hidden"
                                >
                                    <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground">Order <span className="text-primary font-mono">#{order._id.substring(order._id.length - 8)}</span></p>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Total Amount</p>
                                                <p className="font-bold text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {order.isPaid ? (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                        <CheckCircle size={12} /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                                {/* Delivery Status Mock */}
                                                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                    Processing
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {order.orderItems.map((item: any) => (
                                                <div key={item._id} className="flex items-center gap-4">
                                                    <div className="w-16 h-20 bg-gray-100 rounded-md relative overflow-hidden flex-shrink-0">
                                                        {/* Assuming image is a full URL, otherwise use a placeholder */}
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-serif font-medium text-primary line-clamp-1">{item.name}</h4>
                                                        <p className="text-sm text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
