"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes, FaUserPlus, FaCheck } from "react-icons/fa";
import { getToken, getUser } from "../utils/auth";
import Link from "next/link";

export default function NotificationMenu({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState({}); // { [userId]: boolean }
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch("http://localhost:5000/api/users/me", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setCurrentUser(userData);
                    } else {
                        setCurrentUser(getUser());
                    }
                } catch (err) {
                    console.error("Failed to fetch fresh user data", err);
                    setCurrentUser(getUser());
                }
            }
        };

        fetchCurrentUser();
        fetchNotifications();
        markAllRead();
    }, []);

    const markAllRead = async () => {
        const token = getToken();
        if (!token) return;
        try {
            await fetch("http://localhost:5000/api/notifications/read-all", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/api/notifications", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Check against current user's following list to set initial state if needed
                // For now assuming data is fresh
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (e, senderid, isFollowing) => {
        e.preventDefault();
        e.stopPropagation();

        const token = getToken();
        setFollowLoading(prev => ({ ...prev, [senderid]: true }));

        const endpoint = isFollowing ? "unfollow" : "follow";

        try {
            const res = await fetch(`http://localhost:5000/api/users/${endpoint}/${senderid}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                // Update local currentUser state to reflect change immediately
                // This drives isFollowing logic in render
                if (currentUser) {
                    setCurrentUser(prev => ({
                        ...prev,
                        following: !isFollowing
                            ? [...(prev.following || []), senderid]
                            : prev.following.filter(id => id !== senderid)
                    }));
                }

                // Also update notification item state as fallback
                setNotifications(prev => prev.map(n =>
                    n.sender._id === senderid ? { ...n, isFollowedBack: !isFollowing } : n
                ));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(prev => ({ ...prev, [senderid]: false }));
        }
    };

    const handleClearAll = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch("http://localhost:5000/api/notifications", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    return (
        <div className="absolute top-16 right-6 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 px-2 py-1 rounded-md transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <span className="text-2xl">🔕</span>
                        <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => {
                            // Check initialization
                            const isFollowing = notif.isFollowedBack || (currentUser && currentUser.following?.includes(notif.sender._id));

                            return (
                                <div
                                    key={notif._id}
                                    className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img
                                            src={
                                                (notif.sender?.profilePicture && notif.sender.profilePicture.length > 0 ? notif.sender.profilePicture : null) ||
                                                (notif.sender?.avatarUrl && notif.sender.avatarUrl.length > 0 ? notif.sender.avatarUrl : null) ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.sender?.name || 'User')}`
                                            }
                                            alt={notif.sender?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            <Link href={`/u/${notif.sender?.username}`} className="font-bold hover:underline">
                                                {notif.sender?.name}
                                            </Link>
                                            <span className="text-gray-500"> followed you.</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </p>

                                        {/* Follow Action Button */}
                                        {notif.type === 'follow' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={(e) => handleFollowToggle(e, notif.sender._id, isFollowing)}
                                                    disabled={followLoading[notif.sender._id]}
                                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isFollowing
                                                        ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent"
                                                        : "bg-black text-white hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {followLoading[notif.sender._id] ? (
                                                        "..."
                                                    ) : isFollowing ? (
                                                        <>
                                                            <FaCheck size={10} /> Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaUserPlus size={10} /> Follow Back
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
