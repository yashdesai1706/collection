"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { fetchProducts, deleteProduct } from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string | { _id: string; name: string; slug: string };
    stock: number;
    image: string;
    isActive: boolean;
}

export default function ProductList() {
    const { user } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProducts = async () => {
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch {
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Archive this product? It will be hidden from the shop.")) return;
        try {
            if (user?.token) {
                await deleteProduct(id, user.token);
                setProducts(prev => prev.filter(p => p._id !== id));
            }
        } catch {
            alert("Failed to archive product");
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading products...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <Link
                    href="/admin/products/add"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                                            <Image
                                                src={product.image || "/placeholder.jpg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4">{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</td>
                                    <td className="px-6 py-4">{product.stock ?? 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product._id}/edit`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit product"
                                            >
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Archive product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Start by adding one.
                    </div>
                )}
            </div>
        </div>
    );
}
