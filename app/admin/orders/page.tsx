"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { getAdminOrders, markOrderDelivered } from "@/lib/api";
import { Truck, CheckCircle2, Clock, Eye, X, MapPin, Receipt, ShieldCheck } from "lucide-react";

interface OrderItem {
    name: string;
    qty: number;
    image: string;
    price: number;
    size?: string;
    color?: string;
    product: string;
    variantId?: string;
}

interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

interface Order {
    _id: string;
    user: { _id: string; name: string };
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentResult?: {
        id?: string;
        status?: string;
        razorpay_order_id?: string;
        email_address?: string;
    };
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    createdAt: string;
}

export default function OrderList() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [delivering, setDelivering] = useState<string | null>(null);

    // Selected Order for the Inspection Drawer
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!user?.token) return;
        getAdminOrders(user.token)
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load orders"))
            .finally(() => setLoading(false));
    }, [user?.token]);

    const handleDeliver = async (orderId: string) => {
        if (!user?.token) return;
        setDelivering(orderId);
        try {
            const updated = await markOrderDelivered(orderId, user.token);
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isDelivered: true, deliveredAt: updated.deliveredAt } : o));
            if (selectedOrder?._id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, isDelivered: true, deliveredAt: updated.deliveredAt } : null);
            }
        } catch {
            alert("Failed to mark as delivered");
        } finally {
            setDelivering(null);
        }
    };

    if (loading) return <div className="text-gray-500 p-8">Loading order fulfillment center...</div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Fulfillment</h1>
                <p className="text-xs text-gray-500">Monitor transactions, inspect shipping destinations, and dispatch boutique parcels</p>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-2xs border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                            <tr>
                                <th className="px-5 py-3.5">Order ID</th>
                                <th className="px-5 py-3.5">Customer</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Items</th>
                                <th className="px-5 py-3.5">Total Amount</th>
                                <th className="px-5 py-3.5 text-center">Payment</th>
                                <th className="px-5 py-3.5 text-center">Delivery</th>
                                <th className="px-5 py-3.5 text-right">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-700">
                                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-gray-900">
                                        {order.user?.name || "Customer"}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600">
                                        {order.orderItems?.length || 1} {order.orderItems?.length === 1 ? 'item' : 'items'}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-gray-900 font-serif">
                                        ₹{order.totalPrice.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        {order.isPaid ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                <CheckCircle2 size={11} /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                                <Clock size={11} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        {order.isDelivered ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                                                Delivered
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                                                Processing
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrder(order)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-primary font-medium hover:bg-primary/5 transition-colors"
                                        >
                                            <Eye size={13} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.length === 0 && (
                    <div className="p-12 text-center text-gray-400 text-sm">
                        No orders have been placed yet.
                    </div>
                )}
            </div>

            {/* Slide-Over Order Inspection Drawer */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setSelectedOrder(null)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-cream">
                                <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-secondary-dark font-semibold">
                                        Order Details
                                    </span>
                                    <h2 className="text-xl font-serif font-bold text-primary">
                                        #{selectedOrder._id}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Customer & Shipping Destination */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                                        <MapPin size={14} className="text-primary" />
                                        <span>Shipping Destination</span>
                                    </div>
                                    <div className="text-xs text-gray-700 space-y-1">
                                        <p className="font-semibold text-gray-900">{selectedOrder.user?.name || "Customer"}</p>
                                        <p>{selectedOrder.shippingAddress?.address}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                                        <p className="font-medium text-gray-900">{selectedOrder.shippingAddress?.country || "India"}</p>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                                        <Receipt size={14} className="text-secondary-dark" />
                                        <span>Payment Details</span>
                                    </div>
                                    <div className="text-xs space-y-1 text-gray-700">
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className={`font-semibold ${selectedOrder.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {selectedOrder.isPaid ? 'Paid via Razorpay' : 'Payment Pending'}
                                            </span>
                                        </div>
                                        {selectedOrder.paymentResult?.id && (
                                            <div className="flex justify-between font-mono text-[11px]">
                                                <span>Razorpay Pay ID:</span>
                                                <span className="text-gray-900">{selectedOrder.paymentResult.id}</span>
                                            </div>
                                        )}
                                        {selectedOrder.paymentResult?.razorpay_order_id && (
                                            <div className="flex justify-between font-mono text-[11px]">
                                                <span>Razorpay Order ID:</span>
                                                <span className="text-gray-900">{selectedOrder.paymentResult.razorpay_order_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Purchased Items List */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                        Ordered Garments ({selectedOrder.orderItems?.length || 0})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedOrder.orderItems?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                                                <div className="relative w-14 h-18 rounded bg-cream overflow-hidden flex-shrink-0 border border-gray-100">
                                                    <Image
                                                        src={item.image || "/logo.jpg"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-900 truncate">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-[11px] text-gray-500">
                                                            {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500">Qty: {item.qty}</span>
                                                        <span className="font-semibold text-primary font-serif">
                                                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{(selectedOrder.itemsPrice || selectedOrder.totalPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping Charges</span>
                                        <span>{selectedOrder.shippingPrice === 0 ? "Free" : `₹${selectedOrder.shippingPrice || 0}`}</span>
                                    </div>
                                    <div className="pt-2 border-t flex justify-between font-serif font-bold text-sm text-primary">
                                        <span>Total Amount</span>
                                        <span>₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-2">
                                {!selectedOrder.isDelivered && selectedOrder.isPaid ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDeliver(selectedOrder._id)}
                                        disabled={delivering === selectedOrder._id}
                                        className="w-full py-3 rounded-full bg-primary text-cream font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-light transition-all shadow-md disabled:opacity-50"
                                    >
                                        <Truck size={16} />
                                        {delivering === selectedOrder._id ? "Updating Delivery..." : "Mark Parcel as Delivered"}
                                    </button>
                                ) : selectedOrder.isDelivered ? (
                                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} /> Parcel Delivered to Customer
                                    </div>
                                ) : (
                                    <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold text-center">
                                        Waiting for payment confirmation
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
