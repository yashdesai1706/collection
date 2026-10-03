"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getCategories, getSubcategories, getSizes, getColors } from "@/lib/api";
import { Upload, X, AlertCircle } from "lucide-react";

interface Category { _id: string; name: string; }
interface Subcategory { _id: string; name: string; category: { _id: string }; }
interface Size { _id: string; name: string; }
interface Color { _id: string; name: string; hex: string; }
interface Variant { size: string; color: string | null; stock: number; }

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
    onSubmit: (formDataToSend: FormData) => Promise<void>;
    loading: boolean;
    error: string;
}

export default function ProductForm({
    initialData,
    isEdit = false,
    onSubmit,
    loading,
    error,
}: ProductFormProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(initialData?.image || "");
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
        initialData?.images?.map((img: any) => typeof img === "string" ? img : img.url) || []
    );

    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<Subcategory[]>([]);
    const [masterSizes, setMasterSizes] = useState<Size[]>([]);
    const [masterColors, setMasterColors] = useState<Color[]>([]);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price ? String(initialData.price) : "",
        deliveryCharge: initialData?.deliveryCharge !== undefined ? String(initialData.deliveryCharge) : "0",
        category: typeof initialData?.category === "object" ? initialData?.category?._id : (initialData?.category || ""),
        subcategory: typeof initialData?.subcategory === "object" ? initialData?.subcategory?._id : (initialData?.subcategory || ""),
        fabric: initialData?.fabric || "",
        description: initialData?.description || "",
        slug: initialData?.slug || "",
    });

    const [variants, setVariants] = useState<Variant[]>(
        initialData?.variants && initialData.variants.length > 0
            ? initialData.variants.map((v: any) => ({
                size: v.size,
                color: v.color || null,
                stock: v.stock || 0,
            }))
            : []
    );

    useEffect(() => {
        getCategories().then(setCategories).catch(() => {});
        getSizes().then(setMasterSizes).catch(() => {});
        getColors().then(setMasterColors).catch(() => {});
    }, []);

    useEffect(() => {
        if (!formData.category) {
            setFilteredSubs([]);
            return;
        }
        getSubcategories(formData.category)
            .then(setFilteredSubs)
            .catch(() => setFilteredSubs([]));
    }, [formData.category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        setFormData(prev => ({
            ...prev,
            name,
            slug: isEdit ? prev.slug : slug,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 8 * 1024 * 1024) {
                alert("File size must be under 8MB");
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setGalleryFiles(prev => [...prev, ...files]);
            const urls = files.map(f => URL.createObjectURL(f));
            setGalleryPreviews(prev => [...prev, ...urls]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleSize = (sizeName: string) => {
        setVariants(prev => {
            const hasSize = prev.some(v => v.size === sizeName);
            if (hasSize) {
                return prev.filter(v => v.size !== sizeName);
            } else {
                return [...prev, { size: sizeName, color: null, stock: 5 }];
            }
        });
    };

    const toggleColorForSize = (sizeName: string, colorName: string) => {
        setVariants(prev => {
            const existingForSize = prev.filter(v => v.size === sizeName);
            const hasThisColor = existingForSize.some(v => v.color === colorName);
            let next = [...prev];

            if (hasThisColor) {
                next = next.filter(v => !(v.size === sizeName && v.color === colorName));
                const remainingColors = next.filter(v => v.size === sizeName);
                if (remainingColors.length === 0) {
                    next.push({ size: sizeName, color: null, stock: 5 });
                }
            } else {
                next = next.filter(v => !(v.size === sizeName && v.color === null));
                next.push({ size: sizeName, color: colorName, stock: 5 });
            }
            return next;
        });
    };

    const updateVariantStock = (index: number, stock: number) => {
        setVariants(prev => prev.map((v, i) => i === index ? { ...v, stock: Math.max(0, stock) } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name.trim());
        data.append("price", formData.price);
        data.append("deliveryCharge", formData.deliveryCharge || "0");
        data.append("category", formData.category);
        data.append("description", formData.description);
        data.append("slug", formData.slug.trim());
        if (formData.subcategory) data.append("subcategory", formData.subcategory);
        if (formData.fabric) data.append("fabric", formData.fabric.trim());
        if (imageFile) data.append("image", imageFile);

        galleryFiles.forEach((file) => {
            data.append("images", file);
        });

        const cleanVariants = variants.map(v => ({
            size: v.size,
            color: v.color || null,
            stock: Number(v.stock) || 0,
        }));
        data.append("variants", JSON.stringify(cleanVariants));

        await onSubmit(data);
    };

    const selectedSizes = Array.from(new Set(variants.map(v => v.size)));

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs max-w-4xl">
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* 1. Basic Details */}
            <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-gray-900 border-b pb-2">
                    1. Product Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Royal Maroon Banarasi Silk Saree"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            placeholder="e.g. 12999"
                            value={formData.price}
                            onChange={handleChange}
                            name="price"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Charges (₹) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            placeholder="0 for Free Delivery, or e.g. 80"
                            value={formData.deliveryCharge}
                            onChange={handleChange}
                            name="deliveryCharge"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">Enter 0 for Free Delivery</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                        <select
                            required
                            value={formData.category}
                            onChange={handleChange}
                            name="category"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary bg-white"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Subcategory (Optional)</label>
                        <select
                            value={formData.subcategory}
                            onChange={handleChange}
                            name="subcategory"
                            disabled={!formData.category}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary bg-white disabled:bg-gray-50"
                        >
                            <option value="">None / General</option>
                            {filteredSubs.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Fabric & Texture</label>
                        <input
                            type="text"
                            placeholder="e.g. Pure Katan Silk with Gold Zari"
                            value={formData.fabric}
                            onChange={handleChange}
                            name="fabric"
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Detailed garment specifications, drape quality, care instructions, and artisan heritage..."
                        value={formData.description}
                        onChange={handleChange}
                        name="description"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* 2. Image Upload */}
            <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-gray-900 border-b pb-2">
                    2. Product Imagery
                </h3>

                <div className="space-y-4">
                    <div>
                        <span className="block text-xs font-semibold text-gray-700 mb-2">Primary / Cover Image *</span>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <label className="relative border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors w-full sm:w-56 h-40 bg-gray-50/50">
                                <Upload size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs font-medium text-gray-700">Choose cover image</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 8MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {previewUrl && (
                                <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-gray-200 bg-cream">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized={previewUrl.startsWith('blob:') || previewUrl.startsWith('http')}
                                    />
                                    {imageFile && (
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setPreviewUrl(initialData?.image || ""); }}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white shadow-xs"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-semibold text-gray-700 mb-2">Additional Gallery Images</span>
                        <div className="flex flex-wrap items-start gap-3">
                            <label className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors w-32 h-32 bg-gray-50/50 text-center">
                                <Upload size={20} className="text-gray-400 mb-1" />
                                <span className="text-[11px] font-medium text-gray-700">Add More</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryChange}
                                    className="hidden"
                                />
                            </label>

                            {galleryPreviews.map((url, idx) => (
                                <div key={idx} className="relative w-28 h-32 rounded-xl overflow-hidden border border-gray-200 bg-cream group">
                                    <Image
                                        src={url}
                                        alt={`Gallery ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized={url.startsWith('blob:') || url.startsWith('http')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(idx)}
                                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white shadow-xs opacity-90 hover:opacity-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Variants & Stock Matrix */}
            <div className="space-y-5">
                <h3 className="font-serif text-lg font-bold text-gray-900 border-b pb-2">
                    3. Sizes & Variant Inventory
                </h3>

                {/* Available Sizes Toggle */}
                <div>
                    <span className="block text-xs font-semibold text-gray-700 mb-2">Select Sizes:</span>
                    <div className="flex flex-wrap gap-2">
                        {masterSizes.map(s => {
                            const active = selectedSizes.includes(s.name);
                            return (
                                <button
                                    key={s._id}
                                    type="button"
                                    onClick={() => toggleSize(s.name)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        active
                                            ? "bg-primary text-cream border-primary"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                                    }`}
                                >
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Color swatches per selected size */}
                {selectedSizes.map(sizeName => {
                    const existingForSize = variants.filter(v => v.size === sizeName);
                    return (
                        <div key={sizeName} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                            <span className="text-xs font-semibold text-primary">
                                Optional Colors for Size {sizeName}:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {masterColors.map(c => {
                                    const hasColor = existingForSize.some(v => v.color === c.name);
                                    return (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => toggleColorForSize(sizeName, c.name)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                                hasColor
                                                    ? "bg-secondary/20 border-secondary text-primary font-semibold"
                                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                                            }`}
                                        >
                                            {c.hex && (
                                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                                            )}
                                            <span>{c.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Variant Table */}
                {variants.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold">
                                <tr>
                                    <th className="p-3">Size</th>
                                    <th className="p-3">Color</th>
                                    <th className="p-3">Stock Units</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {variants.map((v, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{v.size}</td>
                                        <td className="p-3 text-gray-600">{v.color || "Standard"}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                min="0"
                                                value={v.stock}
                                                onChange={(e) => updateVariantStock(idx, Number(e.target.value))}
                                                className="w-24 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-primary"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-full bg-primary text-cream font-semibold text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md disabled:opacity-50"
                >
                    {loading ? "Saving Product..." : (isEdit ? "Update Product" : "Publish Product")}
                </button>
            </div>
        </form>
    );
}
