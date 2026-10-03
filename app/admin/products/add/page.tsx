"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { createProduct } from "@/lib/api";
import ProductForm from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formDataToSend: FormData) => {
        if (!user?.token) return;
        setLoading(true);
        setError("");
        try {
            await createProduct(formDataToSend, user.token);
            router.push("/admin/products");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create product");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors mb-1 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Products</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-xs text-gray-500">Create a new ethnic garment with variants and stock</p>
                </div>
            </div>

            <ProductForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
            />
        </div>
    );
}
