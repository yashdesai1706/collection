"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    getCategories,
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from "@/lib/api";
import { Plus, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Category { _id: string; name: string; }
interface Subcategory {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
    category: Category;
}

export default function SubcategoriesPage() {
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newCategoryId, setNewCategoryId] = useState("");
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([getCategories(), getSubcategories(undefined, true)])
            .then(([cats, subs]) => { setCategories(cats || []); setSubcategories(subs || []); })
            .catch(err => setError(err.response?.data?.message || "Failed to load subcategories"))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newCategoryId || !user?.token) return;
        setCreating(true); setError("");
        try {
            const created = await createSubcategory(newName.trim(), newCategoryId, user.token);
            setSubcategories(prev => [created, ...prev]);
            setNewName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create");
        } finally { setCreating(false); }
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim() || !user?.token) return;
        setError("");
        try {
            const updated = await updateSubcategory(id, { name: editName.trim(), category: editCategoryId }, user.token);
            setSubcategories(prev => prev.map(s => s._id === id ? updated : s));
            setEditingId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update");
        }
    };

    const handleToggleActive = async (sub: Subcategory) => {
        if (!user?.token) return;
        try {
            const updated = await updateSubcategory(sub._id, { isActive: !sub.isActive }, user.token);
            setSubcategories(prev => prev.map(s => s._id === sub._id ? updated : s));
        } catch { alert("Failed to update status"); }
    };

    const visible = filterCategoryId
        ? subcategories.filter(s => s.category._id === filterCategoryId)
        : subcategories;

    if (loading) return <div className="text-gray-500 p-6">Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>

            {/* Create form */}
            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">Add New Subcategory</h2>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        required
                        value={newCategoryId}
                        onChange={e => setNewCategoryId(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    >
                        <option value="">Select parent category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. Banarasi Silk"
                            value={newName}
                            onChange={e => { setNewName(e.target.value); setError(""); }}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newName.trim() || !newCategoryId}
                            className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                        >
                            <Plus size={15} />
                            {creating ? "..." : "Add"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Filter by category */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Filter by category:</span>
                <select
                    value={filterCategoryId}
                    onChange={e => setFilterCategoryId(e.target.value)}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                    <option value="">All</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <span className="text-xs text-gray-400">{visible.length} shown</span>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Parent Category</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {visible.map(sub => (
                            <tr key={sub._id} className={`hover:bg-gray-50 ${!sub.isActive ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-3">
                                    {editingId === sub._id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleEdit(sub._id); if (e.key === 'Escape') setEditingId(null); }}
                                            className="px-2 py-1 border border-primary rounded text-sm w-full"
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{sub.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    {editingId === sub._id ? (
                                        <select
                                            value={editCategoryId}
                                            onChange={e => setEditCategoryId(e.target.value)}
                                            className="text-sm px-2 py-1 border border-gray-200 rounded"
                                        >
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    ) : (
                                        <span className="text-gray-500">{sub.category?.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {sub.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === sub._id ? (
                                            <>
                                                <button onClick={() => handleEdit(sub._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingId(sub._id); setEditName(sub.name); setEditCategoryId(sub.category._id); setError(""); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                ><Pencil size={16} /></button>
                                                <button
                                                    onClick={() => handleToggleActive(sub)}
                                                    className={`p-1.5 rounded ${sub.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                >
                                                    {sub.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {visible.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No subcategories yet.</div>
                )}
            </div>
        </div>
    );
}
