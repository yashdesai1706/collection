"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { getAdminOrders, markOrderDelivered, updateOrderStatus } from "@/lib/api";
import { Truck, CheckCircle2, Clock, Eye, X, MapPin, Receipt, ShieldCheck, MessageCircle, Send } from "lucide-react";

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
    phone?: string;
}

interface Order {
    _id: string;
    user: { _id: string; name: string; email?: string };
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
    status?: string;
    createdAt: string;
}

export default function OrderList() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [delivering, setDelivering] = useState<string | null>(null);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.token) return;
        getAdminOrders(user.token)
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load orders"))
            .finally(() => setLoading(false));
    }, [user?.token]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!user?.token) return;
        setUpdatingStatus(newStatus);
        setStatusFeedback(null);
        try {
            const updated = await updateOrderStatus(orderId, newStatus, user.token);
            setOrders(prev => prev.map(o => o._id === orderId ? {
                ...o,
                status: newStatus,
                isDelivered: newStatus === 'Delivered',
                deliveredAt: updated.deliveredAt
            } : o));
            if (selectedOrder?._id === orderId) {
                setSelectedOrder(prev => prev ? {
                    ...prev,
                    status: newStatus,
                    isDelivered: newStatus === 'Delivered',
                    deliveredAt: updated.deliveredAt
                } : null);
            }
            setStatusFeedback(`Status updated to "${newStatus}". Notification email sent!`);
        } catch {
            alert("Failed to update order status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getCustomerWhatsAppLink = (order: Order) => {
        const rawPhone = order.shippingAddress?.phone;
        if (!rawPhone) return null;
        let digits = rawPhone.replace(/\D/g, '');
        if (digits.length === 10) digits = '91' + digits;
        const orderId = order._id.substring(order._id.length - 8).toUpperCase();
        const customerName = order.user?.name || 'Customer';
        const status = order.isDelivered ? 'Delivered' : (order.status || 'Processing');
        
        let msg = `Namaste ${customerName}! ✨\n\nYour order #${orderId} from *Priti's Collection* is confirmed and being processed soon.\n🚚 *Delivery:* Within 2-3 working days across India.\n\nThank you for choosing Priti's Collection!`;
        if (status === 'Ready for Delivery') {
            msg = `Namaste ${customerName}! ✨\n\nGreat news from *Priti's Collection*! 📦\nYour order #${orderId} is *ready for delivery* and dispatched for delivery within 2-3 working days.\n\nThank you for shopping with us!`;
        } else if (status === 'Delivered') {
            msg = `Namaste ${customerName}! ✨\n\nYour order #${orderId} from *Priti's Collection* has been *delivered*! 🎉\nWe hope you love your royal ethnic wear!\n\nThank you for choosing Priti's Collection.`;
        }
        return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
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
                                        {order.isDelivered || order.status === 'Delivered' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                Delivered
                                            </span>
                                        ) : order.status === 'Ready for Delivery' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900">
                                                Ready for Delivery
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                                                Processing Soon
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
                                        <p className="text-primary font-medium">
                                            📱 {selectedOrder.shippingAddress?.phone ? selectedOrder.shippingAddress.phone : "No phone provided"}
                                        </p>
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
                                                        sizes="56px"
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

                            {/* Drawer Footer & Tracking Actions */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
                                {statusFeedback && (
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium text-center">
                                        {statusFeedback}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Order Tracking Stage (2-3 working days timeline)
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            disabled={updatingStatus !== null || (!selectedOrder.isDelivered && selectedOrder.status === 'Processing')}
                                            onClick={() => handleStatusChange(selectedOrder._id, 'Processing')}
                                            className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                                                !selectedOrder.isDelivered && selectedOrder.status === 'Processing'
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            1. Processing Soon
                                        </button>

                                        <button
                                            type="button"
                                            disabled={updatingStatus !== null || selectedOrder.status === 'Ready for Delivery'}
                                            onClick={() => handleStatusChange(selectedOrder._id, 'Ready for Delivery')}
                                            className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                                                selectedOrder.status === 'Ready for Delivery' && !selectedOrder.isDelivered
                                                    ? 'bg-amber-600 text-white shadow-xs'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            2. Ready to Deliver
                                        </button>

                                        <button
                                            type="button"
                                            disabled={updatingStatus !== null || selectedOrder.isDelivered || selectedOrder.status === 'Delivered'}
                                            onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')}
                                            className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                                                selectedOrder.isDelivered || selectedOrder.status === 'Delivered'
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            3. Delivered
                                        </button>
                                    </div>
                                </div>

                                {/* 1-Click WhatsApp Button to Customer */}
                                {getCustomerWhatsAppLink(selectedOrder) ? (
                                    <a
                                        href={getCustomerWhatsAppLink(selectedOrder)!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 rounded-full bg-[#25D366] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all shadow-xs"
                                    >
                                        <MessageCircle size={15} />
                                        Send WhatsApp Tracking to Customer
                                    </a>
                                ) : (
                                    <p className="text-[11px] text-gray-400 text-center italic">
                                        No phone number saved for this order to send WhatsApp directly.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
