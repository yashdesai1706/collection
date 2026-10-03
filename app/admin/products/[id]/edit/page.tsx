"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { fetchProductById, updateProduct } from "@/lib/api";
import ProductForm from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = (params?.id as string) || '';
    const { user } = useAuthStore();

    const [product, setProduct] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        fetchProductById(id)
            .then(setProduct)
            .catch((err) => setError("Failed to fetch product details"))
            .finally(() => setFetching(false));
    }, [id]);

    const handleSubmit = async (formDataToSend: FormData) => {
        if (!user?.token) return;
        setLoading(true);
        setError("");
        try {
            await updateProduct(id, formDataToSend, user.token);
            router.push("/admin/products");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update product");
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="text-gray-500 p-8">Loading product details...</div>;
    }

    if (!product) {
        return <div className="text-red-500 p-8">Product not found.</div>;
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-xs text-gray-500">Updating: {product.name}</p>
                </div>
            </div>

            <ProductForm
                initialData={product}
                isEdit={true}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
            />
        </div>
    );
}
