"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { createProduct } from "@/lib/api";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // File state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        description: "",
        countInStock: "",
        slug: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("File size too large (Max 5MB)");
                return;
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setFormData(prev => ({
            ...prev,
            name,
            slug
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!imageFile) {
            setError("Please ensure a main product image is uploaded.");
            setLoading(false);
            return;
        }

        try {
            if (user?.token) {
                const data = new FormData();
                data.append('name', formData.name);
                data.append('price', formData.price);
                data.append('description', formData.description);
                data.append('category', formData.category);
                data.append('countInStock', formData.countInStock);
                data.append('slug', formData.slug);
                data.append('image', imageFile);

                await createProduct(data, user.token);
                router.push("/admin/products");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create product");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="e.g. Red Silk Saree"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Friendly)</label>
                        <input
                            type="text"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                            <input
                                type="number"
                                name="countInStock"
                                required
                                min="0"
                                value={formData.countInStock}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        >
                            <option value="">Select Category</option>
                            <option value="Sarees">Sarees</option>
                            <option value="Kurtis">Kurtis</option>
                            <option value="Dresses">Dresses</option>
                            <option value="Lehengas">Lehengas</option>
                        </select>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {previewUrl ? (
                                <div className="relative w-full h-64">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain mx-auto" />
                                    <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 rounded shadow text-sm cursor-pointer hover:bg-white text-primary">
                                        Change Image
                                    </label>
                                </div>
                            ) : (
                                <label htmlFor="image-upload" className="cursor-pointer block">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <span className="text-primary font-medium">Click to upload image</span>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                </label>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? "Creating..." : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
