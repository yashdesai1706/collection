"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    getSizes,
    createSize,
    updateSize,
    deleteSize,
} from "@/lib/api";
import { Plus, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Size {
    _id: string;
    name: string;
    isActive: boolean;
}

export default function SizesPage() {
    const { user } = useAuthStore();
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [error, setError] = useState("");

    const load = async () => {
        try {
            const data = await getSizes(true);
            setSizes(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load sizes");
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
            const created = await createSize(newName.trim(), user.token);
            setSizes(prev => [created, ...prev]);
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
            const updated = await updateSize(id, { name: editName.trim() }, user.token);
            setSizes(prev => prev.map(s => s._id === id ? updated : s));
            setEditingId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update");
        }
    };

    const handleToggleActive = async (size: Size) => {
        if (!user?.token) return;
        try {
            const updated = await updateSize(size._id, { isActive: !size.isActive }, user.token);
            setSizes(prev => prev.map(s => s._id === size._id ? updated : s));
        } catch {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading sizes...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Sizes</h1>

            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">Add New Size</h2>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. S, 28, Free Size"
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

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sizes.map(size => (
                            <tr key={size._id} className={`hover:bg-gray-50 ${!size.isActive ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-3">
                                    {editingId === size._id ? (
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleEdit(size._id); if (e.key === 'Escape') setEditingId(null); }}
                                            className="px-2 py-1 border border-primary rounded text-sm w-full"
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{size.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${size.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {size.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {editingId === size._id ? (
                                            <>
                                                <button onClick={() => handleEdit(size._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Save"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="Cancel"><X size={16} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingId(size._id); setEditName(size.name); setError(""); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"
                                                ><Pencil size={16} /></button>
                                                <button
                                                    onClick={() => handleToggleActive(size)}
                                                    className={`p-1.5 rounded ${size.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={size.isActive ? 'Deactivate' : 'Reactivate'}
                                                >
                                                    {size.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sizes.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">No sizes yet. Add one above.</div>
                )}
            </div>
        </div>
    );
}
