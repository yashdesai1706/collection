"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getAdminUsers, updateUserRole } from "@/lib/api";
import { Shield, ShieldOff, User } from "lucide-react";

interface UserRow {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser?.token) return;
        getAdminUsers(currentUser.token)
            .then(setUsers)
            .catch(() => setError("Failed to load users"))
            .finally(() => setLoading(false));
    }, [currentUser?.token]);

    const handleToggleRole = async (userId: string) => {
        if (!currentUser?.token) return;
        setToggling(userId);
        try {
            const updated = await updateUserRole(userId, currentUser.token);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: updated.isAdmin } : u));
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update role");
        } finally {
            setToggling(null);
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading users...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-center">Role</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => {
                                const isSelf = u._id === currentUser?._id;
                                return (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            {u.name}
                                        </td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {u.isAdmin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Customer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isSelf ? (
                                                <span className="text-xs text-gray-400 italic">You</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleRole(u._id)}
                                                    disabled={toggling === u._id}
                                                    title={u.isAdmin ? "Revoke admin" : "Grant admin"}
                                                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-opacity disabled:opacity-50 ml-auto ${
                                                        u.isAdmin
                                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                            : "bg-primary/10 text-primary hover:bg-primary/20"
                                                    }`}
                                                >
                                                    {u.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                                                    {toggling === u._id ? "..." : u.isAdmin ? "Revoke Admin" : "Make Admin"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                )}
            </div>
        </div>
    );
}
