"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaFileAlt, FaShieldAlt, FaChartLine } from "react-icons/fa";

export default function AdminPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("stats");

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            try {
                const [statsRes, usersRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Admin data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-red-600 p-2 rounded-lg text-white">
                        <FaShieldAlt size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><FaUsers size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.users || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600"><FaFileAlt size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Posts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.posts || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600"><FaChartLine size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">System Status</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.systemStatus || "Unknown"}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4 flex gap-6">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Manage Users
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "users" && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="pb-4">Name</th>
                                            <th className="pb-4">Role</th>
                                            <th className="pb-4">Verified</th>
                                            <th className="pb-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map(u => (
                                            <tr key={u._id} className="text-sm">
                                                <td className="py-4 font-medium text-gray-900">{u.name || (<u>{u.username}</u>)}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-gray-500">{u.verified ? '✅ Yes' : '❌ No'}</td>
                                                <td className="py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
