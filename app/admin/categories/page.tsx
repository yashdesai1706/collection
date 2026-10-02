"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    getCategories,
    createCategory,
    updateCategory,
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    getSizes,
    createSize,
    updateSize,
    getColors,
    createColor,
    updateColor,
} from "@/lib/api";
import { Plus, Pencil, Check, X, ToggleLeft, ToggleRight, Tag, Layers, Palette, Ruler } from "lucide-react";

export default function TaxonomyPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "sizes" | "colors">("categories");

    // Categories state
    const [categories, setCategories] = useState<any[]>([]);
    const [catName, setCatName] = useState("");

    // Subcategories state
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [subName, setSubName] = useState("");
    const [selectedParentCat, setSelectedParentCat] = useState("");

    // Sizes state
    const [sizes, setSizes] = useState<any[]>([]);
    const [sizeName, setSizeName] = useState("");

    // Colors state
    const [colors, setColors] = useState<any[]>([]);
    const [colorName, setColorName] = useState("");
    const [colorHex, setColorHex] = useState("#6D121F");

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [cats, subs, szs, cls] = await Promise.all([
                getCategories(true),
                getSubcategories(undefined, true),
                getSizes(true),
                getColors(true),
            ]);
            setCategories(Array.isArray(cats) ? cats : []);
            setSubcategories(Array.isArray(subs) ? subs : []);
            setSizes(Array.isArray(szs) ? szs : []);
            setColors(Array.isArray(cls) ? cls : []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load taxonomy data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    // Handlers for Add
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catName.trim() || !user?.token) return;
        setSubmitting(true);
        setError("");
        try {
            const created = await createCategory(catName.trim(), user.token);
            setCategories(prev => [created, ...prev]);
            setCatName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subName.trim() || !selectedParentCat || !user?.token) return;
        setSubmitting(true);
        setError("");
        try {
            const created = await createSubcategory(subName.trim(), selectedParentCat, user.token);
            setSubcategories(prev => [created, ...prev]);
            setSubName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create subcategory");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddSize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sizeName.trim() || !user?.token) return;
        setSubmitting(true);
        setError("");
        try {
            const created = await createSize(sizeName.trim(), user.token);
            setSizes(prev => [created, ...prev]);
            setSizeName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create size");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddColor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!colorName.trim() || !user?.token) return;
        setSubmitting(true);
        setError("");
        try {
            const created = await createColor(colorName.trim(), colorHex, user.token);
            setColors(prev => [created, ...prev]);
            setColorName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create color");
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle active status
    const toggleStatus = async (type: string, item: any) => {
        if (!user?.token) return;
        try {
            if (type === "cat") {
                const updated = await updateCategory(item._id, { isActive: !item.isActive }, user.token);
                setCategories(prev => prev.map(c => c._id === item._id ? updated : c));
            } else if (type === "sub") {
                const updated = await updateSubcategory(item._id, { isActive: !item.isActive }, user.token);
                setSubcategories(prev => prev.map(s => s._id === item._id ? updated : s));
            } else if (type === "size") {
                const updated = await updateSize(item._id, { isActive: !item.isActive }, user.token);
                setSizes(prev => prev.map(s => s._id === item._id ? updated : s));
            } else if (type === "color") {
                const updated = await updateColor(item._id, { isActive: !item.isActive }, user.token);
                setColors(prev => prev.map(c => c._id === item._id ? updated : c));
            }
        } catch {
            alert("Failed to toggle status");
        }
    };

    if (loading) return <div className="text-gray-500 p-8">Loading taxonomy & attributes...</div>;

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Taxonomy & Attributes</h1>
                <p className="text-xs text-gray-500">Manage categories, subcategories, standard garment sizes, and color palettes</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Tabbed Navigation Bar */}
            <div className="flex border-b border-gray-200 gap-2">
                <button
                    onClick={() => { setActiveTab("categories"); setEditingId(null); setError(""); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "categories"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Tag size={16} /> Categories ({categories.length})
                </button>
                <button
                    onClick={() => { setActiveTab("subcategories"); setEditingId(null); setError(""); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "subcategories"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Layers size={16} /> Subcategories ({subcategories.length})
                </button>
                <button
                    onClick={() => { setActiveTab("sizes"); setEditingId(null); setError(""); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "sizes"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Ruler size={16} /> Sizes ({sizes.length})
                </button>
                <button
                    onClick={() => { setActiveTab("colors"); setEditingId(null); setError(""); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "colors"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <Palette size={16} /> Colors ({colors.length})
                </button>
            </div>

            {/* TAB 1: CATEGORIES */}
            {activeTab === "categories" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <form onSubmit={handleAddCategory} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 h-fit">
                        <h3 className="text-sm font-bold text-gray-900">Add New Category</h3>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Sarees"
                            value={catName}
                            onChange={e => setCatName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !catName.trim()}
                            className="w-full py-2 bg-primary text-cream rounded-lg text-xs font-semibold uppercase hover:bg-primary-light transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Category"}
                        </button>
                    </form>

                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Category Name</th>
                                    <th className="p-3">Slug</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map(cat => (
                                    <tr key={cat._id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{cat.name}</td>
                                        <td className="p-3 font-mono text-gray-500">{cat.slug}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus("cat", cat)}
                                                className={`p-1.5 rounded ${cat.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={cat.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {cat.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: SUBCATEGORIES */}
            {activeTab === "subcategories" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <form onSubmit={handleAddSubcategory} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 h-fit">
                        <h3 className="text-sm font-bold text-gray-900">Add Subcategory</h3>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Parent Category</label>
                            <select
                                required
                                value={selectedParentCat}
                                onChange={e => setSelectedParentCat(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select Parent Category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Subcategory Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Banarasi Silk"
                                value={subName}
                                onChange={e => setSubName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !subName.trim() || !selectedParentCat}
                            className="w-full py-2 bg-primary text-cream rounded-lg text-xs font-semibold uppercase hover:bg-primary-light transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Subcategory"}
                        </button>
                    </form>

                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Subcategory</th>
                                    <th className="p-3">Parent Category</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subcategories.map(sub => (
                                    <tr key={sub._id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{sub.name}</td>
                                        <td className="p-3 text-gray-600">{sub.category?.name || "Unassigned"}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {sub.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus("sub", sub)}
                                                className={`p-1.5 rounded ${sub.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                            >
                                                {sub.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: SIZES */}
            {activeTab === "sizes" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <form onSubmit={handleAddSize} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 h-fit">
                        <h3 className="text-sm font-bold text-gray-900">Add Standard Size</h3>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Free Size, XS, S, M, XL"
                            value={sizeName}
                            onChange={e => setSizeName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !sizeName.trim()}
                            className="w-full py-2 bg-primary text-cream rounded-lg text-xs font-semibold uppercase hover:bg-primary-light transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Size"}
                        </button>
                    </form>

                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Size Label</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sizes.map(sz => (
                                    <tr key={sz._id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{sz.name}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {sz.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus("size", sz)}
                                                className={`p-1.5 rounded ${sz.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                            >
                                                {sz.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: COLORS */}
            {activeTab === "colors" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <form onSubmit={handleAddColor} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3 h-fit">
                        <h3 className="text-sm font-bold text-gray-900">Add Palette Color</h3>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Color Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Royal Maroon"
                                value={colorName}
                                onChange={e => setColorName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Hex Color Code</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={colorHex}
                                    onChange={e => setColorHex(e.target.value)}
                                    className="w-10 h-10 p-0 rounded-lg border border-gray-200 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={colorHex}
                                    onChange={e => setColorHex(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase font-mono"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !colorName.trim()}
                            className="w-full py-2 bg-primary text-cream rounded-lg text-xs font-semibold uppercase hover:bg-primary-light transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Adding..." : "Add Color"}
                        </button>
                    </form>

                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Color</th>
                                    <th className="p-3">Hex</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {colors.map(c => (
                                    <tr key={c._id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                                            {c.hex && (
                                                <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                                            )}
                                            <span>{c.name}</span>
                                        </td>
                                        <td className="p-3 font-mono text-gray-500">{c.hex || "N/A"}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus("color", c)}
                                                className={`p-1.5 rounded ${c.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                            >
                                                {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
