"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { fetchProductById, updateProduct, getCategories, getSubcategories, getSizes, getColors } from "@/lib/api";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

interface Category { _id: string; name: string; }
interface Subcategory { _id: string; name: string; category: { _id: string }; }
interface MasterSize { _id: string; name: string; }
interface MasterColor { _id: string; name: string; hex: string; }
interface Variant { _id?: string; size: string; color: string | null; stock: number; price: string; }

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<Subcategory[]>([]);
    const [masterSizes, setMasterSizes] = useState<MasterSize[]>([]);
    const [masterColors, setMasterColors] = useState<MasterColor[]>([]);

    const [formData, setFormData] = useState({
        name: "", price: "", category: "", subcategory: "", description: "", slug: ""
    });

    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        Promise.all([
            getCategories(),
            getSizes(),
            getColors(),
            fetchProductById(id),
        ]).then(([cats, sizes, colors, product]) => {
            setCategories(cats);
            setMasterSizes(sizes);
            setMasterColors(colors);

            const catId = typeof product.category === 'object' ? product.category._id : product.category;
            const subId = typeof product.subcategory === 'object' ? product.subcategory?._id : product.subcategory;

            setFormData({
                name: product.name,
                price: String(product.price),
                category: catId || "",
                subcategory: subId || "",
                description: product.description,
                slug: product.slug,
            });
            setPreviewUrl(product.image);

            // Load existing variants into editable state
            if (product.variants?.length > 0) {
                setVariants(product.variants.map((v: any) => ({
                    _id: v._id,
                    size: v.size,
                    color: v.color || null,
                    stock: v.stock ?? 0,
                    price: v.price != null ? String(v.price) : "",
                })));
            }

            // Cascade subcategories for the loaded category
            if (catId) {
                getSubcategories(catId).then(setFilteredSubs);
            }
        })
        .catch(() => setError("Failed to load product"))
        .finally(() => setFetching(false));
    }, [id]);

    // Cascade: when category changes, fetch matching subcategories
    const handleCategoryChange = (newCatId: string) => {
        setFormData(p => ({ ...p, category: newCatId, subcategory: "" }));
        if (newCatId) {
            getSubcategories(newCatId).then(setFilteredSubs);
        } else {
            setFilteredSubs([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'category') { handleCategoryChange(value); return; }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { setError("Max 5MB"); return; }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError("");
        }
    };

    // --- Variant builder logic (matches Add page) ---
    const selectedSizes = Array.from(new Set<string>(variants.map(v => v.size)));

    const toggleSize = (sizeName: string) => {
        setVariants(prev => {
            const hasSize = prev.some(v => v.size === sizeName);
            if (hasSize) {
                return prev.filter(v => v.size !== sizeName);
            } else {
                return [...prev, { size: sizeName, color: null, stock: 0, price: "" }];
            }
        });
    };

    const toggleColorForSize = (sizeName: string, colorName: string) => {
        setVariants(prev => {
            const hasThisColor = prev.some(v => v.size === sizeName && v.color === colorName);
            let next = [...prev];
            if (hasThisColor) {
                next = next.filter(v => !(v.size === sizeName && v.color === colorName));
                if (!next.some(v => v.size === sizeName)) {
                    next.push({ size: sizeName, color: null, stock: 0, price: "" });
                }
            } else {
                next = next.filter(v => !(v.size === sizeName && v.color === null));
                next.push({ size: sizeName, color: colorName, stock: 0, price: "" });
            }
            return next;
        });
    };

    const updateVariant = (idx: number, field: keyof Variant, value: string | number | null) => {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (variants.length === 0) {
            setError("Add at least one size to generate variants.");
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
                if (formData.subcategory) data.append('subcategory', formData.subcategory);
                data.append('slug', formData.slug);
                if (imageFile) data.append('image', imageFile);
                data.append('variants', JSON.stringify(variants));

                await updateProduct(id, data, user.token);
                router.push("/admin/products");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update product");
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-gray-500 p-6">Loading product...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-900"><ArrowLeft size={24} /></Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Info</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input type="text" name="slug" required value={formData.slug} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                            <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" required value={formData.category} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {filteredSubs.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                            <select name="subcategory" value={formData.subcategory} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                                <option value="">None</option>
                                {filteredSubs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required rows={3} value={formData.description} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50">
                            <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
                            {previewUrl ? (
                                <div className="relative w-full h-40">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 rounded shadow text-xs cursor-pointer text-primary">Change</label>
                                </div>
                            ) : (
                                <label htmlFor="image-upload" className="cursor-pointer block">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-primary text-sm font-medium">Click to upload</span>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Variant Builder */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sizes & Colors → Variants</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Select Sizes for this product</label>
                        {masterSizes.length === 0 ? (
                            <p className="text-xs text-gray-400">No sizes found. Add them in the Master Sizes page first.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {masterSizes.map(size => {
                                    const isSelected = selectedSizes.includes(size.name);
                                    return (
                                        <button key={size._id} type="button" onClick={() => toggleSize(size.name)}
                                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                                            {size.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selectedSizes.length > 0 && (
                        <div className="space-y-4 border-t pt-4">
                            <label className="block text-sm font-medium text-gray-600">Select Colors per Size (Optional)</label>
                            {selectedSizes.map(sizeName => (
                                <div key={sizeName} className="p-3 border border-gray-100 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-semibold text-gray-700 mb-2">Colors for Size: {sizeName}</div>
                                    {masterColors.length === 0 ? (
                                        <p className="text-xs text-gray-400">No colors in Master list.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {masterColors.map(color => {
                                                const isSelected = variants.some(v => v.size === sizeName && v.color === color.name);
                                                return (
                                                    <button key={color._id} type="button" onClick={() => toggleColorForSize(sizeName, color.name)}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${isSelected ? 'bg-secondary/20 border-secondary text-yellow-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                                        <span className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: color.hex || color.name.toLowerCase().replace(/\s+/g, '') }} />
                                                        {color.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Variant table */}
                    {variants.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">Configure Inventory & Pricing</p>
                            <div className="overflow-x-auto rounded-lg border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Size</th>
                                            <th className="px-4 py-2 text-left">Color</th>
                                            <th className="px-4 py-2 text-left">Stock Quantity</th>
                                            <th className="px-4 py-2 text-left">Price Override (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {variants.map((v, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-800">{v.size}</td>
                                                <td className="px-4 py-2 text-gray-500">{v.color || <span className="text-gray-300 italic">No color</span>}</td>
                                                <td className="px-4 py-2">
                                                    <input type="number" min="0" value={v.stock}
                                                        onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                                                        className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" min="0" placeholder={`${formData.price || "Use Base"}`} value={v.price}
                                                        onChange={e => updateVariant(idx, 'price', e.target.value)}
                                                        className="w-28 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedSizes.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                            Select at least one size above to configure stock
                        </p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={loading}
                        className="bg-primary text-white px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
