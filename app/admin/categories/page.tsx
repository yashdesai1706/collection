"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/lib/api";
import { Plus, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export default function CategoriesPage() {
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const data = await getCategories(true); // all=true to see inactive too
            setCategories(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !user?.token) return;
        setCreating(true);
        setError("");
        try {
            const created = await createCategory(newName.trim(), user.token);
            setCategories(prev => [created, ...prev]);
            setNewName("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create");
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim() || !user?.token) return;
        setError("");
        try {
            const updated = await updateCategory(id, { name: editName.trim() }, user.token);
            setCategories(prev => prev.map(c => c._id === id ? updated : c));
            setEditingId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update");
        }
    };

    const handleToggleActive = async (cat: Category) => {
        if (!user?.token) return;
        try {
            const updated = await updateCategory(cat._id, { isActive: !cat.isActive }, user.token);
            setCategories(prev => prev.map(c => c._id === cat._id ? updated : c));
        } catch {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading categories...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

            {/* Create form */}
            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">Add New Category</h2>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. Sarees"
                        value={newName}
                        onChange={e => { setNewName(e.target.value); setError(""); }}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newName.trim()}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                    >
                        <Plus size={16} />
                        {creating ? "Adding..." : "Add"}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Slug</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.map(cat => (
                            <tr key={cat._id} className={`hover:bg-gray-50 ${!cat.isActive ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-3">
                                    {editingId === cat._id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat._id); if (e.key === 'Escape') setEditingId(null); }}
                                            className="px-2 py-1 border border-primary rounded text-sm w-full"
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{cat.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === cat._id ? (
                                            <>
                                                <button onClick={() => handleEdit(cat._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel"><X size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingId(cat._id); setEditName(cat.name); setError(""); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"
                                                ><Pencil size={16} /></button>
                                                <button
                                                    onClick={() => handleToggleActive(cat)}
                                                    className={`p-1.5 rounded ${cat.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={cat.isActive ? 'Deactivate' : 'Reactivate'}
                                                >
                                                    {cat.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No categories yet. Add one above.</div>
                )}
            </div>
        </div>
    );
}
