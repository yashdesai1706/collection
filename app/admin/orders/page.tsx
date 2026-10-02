"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getAdminOrders, markOrderDelivered } from "@/lib/api";
import { X, Truck } from "lucide-react";

interface Order {
    _id: string;
    user: { _id: string; name: string };
    totalPrice: number;
    isPaid: boolean;
    paidAt: string;
    isDelivered: boolean;
    deliveredAt: string;
    createdAt: string;
}

export default function OrderList() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [delivering, setDelivering] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.token) return;
        getAdminOrders(user.token)
            .then(setOrders)
            .catch(() => setError("Failed to load orders"))
            .finally(() => setLoading(false));
    }, [user?.token]);

    const handleDeliver = async (orderId: string) => {
        if (!user?.token) return;
        setDelivering(orderId);
        try {
            const updated = await markOrderDelivered(orderId, user.token);
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isDelivered: true, deliveredAt: updated.deliveredAt } : o));
        } catch {
            alert("Failed to mark as delivered");
        } finally {
            setDelivering(null);
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading orders...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-center">Paid</th>
                                <th className="px-6 py-4 text-center">Delivered</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{order._id.substring(0, 10)}...</td>
                                    <td className="px-6 py-4">{order.user?.name || "Deleted User"}</td>
                                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-center">
                                        {order.isPaid ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {new Date(order.paidAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <X size={12} className="mr-1" /> No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {order.isDelivered ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {new Date(order.deliveredAt).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {!order.isDelivered && order.isPaid && (
                                            <button
                                                onClick={() => handleDeliver(order._id)}
                                                disabled={delivering === order._id}
                                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                                            >
                                                <Truck size={14} />
                                                {delivering === order._id ? "..." : "Mark Delivered"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found.</div>
                )}
            </div>
        </div>
    );
}
