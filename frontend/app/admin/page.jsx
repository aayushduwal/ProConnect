"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaFileAlt, FaShieldAlt, FaChartLine, FaTrash, FaUserShield, FaExclamationTriangle, FaCheckCircle, FaBan, FaUndo } from "react-icons/fa";

export default function AdminPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("stats");
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        try {
            setLoading(true);
            const [statsRes, usersRes, reportsRes, logsRes] = await Promise.all([
                axios.get("http://localhost:5000/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:5000/api/admin/reports", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:5000/api/admin/logs", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setReports(reportsRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error("Admin data fetch failed", err);
            if (err.response?.status === 401) {
                alert("Session expired or unauthorized. Please log in again.");
                window.location.href = "/login";
            } else if (err.response?.status === 403) {
                alert("Access denied. Admin privileges required.");
                window.location.href = "/";
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        if (!confirm(`Are you sure you want to make this user a ${newRole}?`)) return;

        const token = localStorage.getItem("token");
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await axios.patch(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to update user role");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleVerifyUpdate = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const msg = newStatus ? "verify this user?" : "remove verification from this user?";
        if (!confirm(`Are you sure you want to ${msg}`)) return;

        const token = localStorage.getItem("token");
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await axios.patch(`http://localhost:5000/api/admin/users/${userId}/verify`, { verified: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to update verification status");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleStatusUpdate = async (userId, currentStatus) => {
        const newStatus = currentStatus === "banned" ? "active" : "banned";
        const msg = newStatus === "banned" ? "ban this user? They will not be able to post or log in." : "restore this user's account?";
        if (!confirm(`Are you sure you want to ${msg}`)) return;

        const token = localStorage.getItem("token");
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await axios.patch(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to update user status");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDismissReport = async (postId) => {
        if (!confirm("Dismiss these reports? The post will be cleared from this list but NOT deleted.")) return;

        const token = localStorage.getItem("token");
        setActionLoading(prev => ({ ...prev, [postId]: true }));
        try {
            await axios.delete(`http://localhost:5000/api/admin/reports/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to dismiss reports");
        } finally {
            setActionLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Are you sure you want to delete this post? This action is permanent.")) return;

        const token = localStorage.getItem("token");
        setActionLoading(prev => ({ ...prev, [postId]: true }));
        try {
            await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert("Failed to delete post");
        } finally {
            setActionLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    if (loading && !stats) return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>;

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
                            <p className="text-sm text-gray-500 font-medium">Reports Pending</p>
                            <p className="text-2xl font-bold text-red-600">{reports.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="border-b border-gray-100 px-6 py-4 flex gap-6">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => setActiveTab("reports")}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Reported Content ({reports.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={`pb-2 text-sm font-bold transition-colors ${activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Audit Logs
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
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map(u => (
                                            <tr key={u._id} className="text-sm">
                                                <td className="py-4">
                                                    <div className="font-medium text-gray-900">{u.name || (<u>{u.username}</u>)}</div>
                                                    <div className="text-[10px] text-gray-400">{u.email}</div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-500">{u.verified ? '✅ Verified' : '❌ Unverified'}</span>
                                                        {u.status === 'banned' && (
                                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight bg-red-50 px-1.5 py-0.5 rounded border border-red-100 w-fit">
                                                                🚫 BANNED
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(u._id, u.status)}
                                                            disabled={actionLoading[u._id]}
                                                            className={`p-2 rounded-lg transition-colors ${u.status === 'banned' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                            title={u.status === 'banned' ? "Unban User" : "Ban User"}
                                                        >
                                                            {u.status === 'banned' ? <FaUndo size={16} /> : <FaBan size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerifyUpdate(u._id, u.verified)}
                                                            disabled={actionLoading[u._id]}
                                                            className={`p-2 rounded-lg transition-colors ${u.verified ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                            title={u.verified ? "Remove Verification" : "Verify User"}
                                                        >
                                                            <FaCheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleUpdate(u._id, u.role)}
                                                            disabled={actionLoading[u._id]}
                                                            className={`p-2 rounded-lg transition-colors ${u.role === 'admin' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                            title={u.role === 'admin' ? "Demote to User" : "Make Admin"}
                                                        >
                                                            <FaUserShield size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "reports" && (
                            <div className="space-y-6">
                                {reports.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 italic">
                                        No reported posts found. Safe zone!
                                    </div>
                                ) : (
                                    reports.map(report => (
                                        <div key={report._id} className="border border-red-100 bg-red-50/10 rounded-xl p-4 flex gap-4">
                                            <div className="text-red-500 mt-1"><FaExclamationTriangle size={20} /></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">
                                                        Post by <span className="text-blue-600">{report.author?.name}</span>
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDismissReport(report._id)}
                                                            disabled={actionLoading[report._id]}
                                                            className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-gray-100"
                                                        >
                                                            <FaUndo size={12} />
                                                            Dismiss Report
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePost(report._id)}
                                                            disabled={actionLoading[report._id]}
                                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-red-100"
                                                        >
                                                            <FaTrash size={12} />
                                                            Delete Content
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(report.author?._id, report.author?.status)}
                                                            disabled={actionLoading[report.author?._id]}
                                                            className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border border-orange-100"
                                                        >
                                                            <FaBan size={12} />
                                                            Ban User
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm italic text-gray-600 mb-3">
                                                    "{report.content?.substring(0, 150)}..."
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-bold text-red-600">Report Reasons:</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {report.reports.map((r, idx) => (
                                                            <li key={idx} className="text-gray-500 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                                {r.reason} — <span className="text-[10px] text-gray-400">by {r.user?.username}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "logs" && (
                            <div className="space-y-4">
                                {logs.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 italic">No activity yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    <th className="pb-4">Admin</th>
                                                    <th className="pb-4">Action</th>
                                                    <th className="pb-4">Target</th>
                                                    <th className="pb-4">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {logs.map(log => (
                                                    <tr key={log._id} className="text-sm">
                                                        <td className="py-4 font-medium text-gray-900">{log.admin?.name}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action.includes('delete') || log.action.includes('ban') ? 'bg-red-50 text-red-600' :
                                                                log.action.includes('verify') ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {log.action.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-gray-500 font-mono text-[11px]">{log.targetId}</td>
                                                        <td className="py-4 text-gray-400 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
