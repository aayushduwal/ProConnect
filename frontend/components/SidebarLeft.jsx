"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getUser } from "../utils/auth";
import NetworkModal from "./NetworkModal";

export default function SidebarLeft() {
    const [user, setUser] = useState(null);
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [networkTab, setNetworkTab] = useState("followers");

    useEffect(() => {
        const fetchUser = async () => {
            const localUser = getUser();
            if (localUser) {
                // Fetch fresh data to get follower counts
                try {
                    const token = localStorage.getItem("token");
                    if (token) {
                        const res = await fetch("http://localhost:5000/api/users/me", {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setUser(data);
                        } else {
                            setUser(localUser);
                        }
                    } else {
                        setUser(localUser);
                    }
                } catch (err) {
                    console.error("Failed to fetch user stats", err);
                    setUser(localUser);
                }
            }
        };
        fetchUser();
    }, []);

    const openNetworkModal = (tab) => {
        if (!user) return;
        setNetworkTab(tab);
        setShowNetworkModal(true);
    };

    return (
        <div className="hidden md:flex flex-col h-screen sticky top-0 py-6 pl-6 border-r border-gray-200 z-40 bg-[#FAFAFA]">
            {/* Logo Area */}
            <div className="mb-8 flex items-center gap-2 pl-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/assets/logo.png"
                        width={32}
                        height={32}
                        alt="Logo"
                        className="rounded-lg"
                    />
                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        ProConnect
                    </span>
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1 flex-1">
                {[
                    { name: "Scroll", icon: "🏠", active: true, href: "/scroll" },
                    { name: "Launchpad", icon: "🚀", href: "#" },
                    { name: "Articles", icon: "✍️", href: "#" },
                    { name: "Jobs", icon: "💼", href: "#" },
                    { name: "Inbox", icon: "💬", href: "#" },
                    { name: "Search", icon: "🔍", href: "#" },
                    ...(user?.role === "admin" ? [{ name: "Admin Panel", icon: "🛡️", href: "/admin" }] : []),
                ].map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${item.active
                            ? "text-gray-900 font-bold bg-gray-100/80"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Mini Profile Section */}
            {user && (
                <div className="mt-auto mb-4 mr-6">
                    <Link href={`/u/${user.username}`} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer group">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <img
                                src={
                                    (user.profilePicture && user.profilePicture.length > 0 ? user.profilePicture : null) ||
                                    (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`
                                }
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                            <div className="text-xs text-gray-500 font-medium flex items-center gap-3 mt-0.5">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openNetworkModal("followers");
                                    }}
                                    className="hover:text-gray-900 hover:underline flex gap-1"
                                >
                                    <span className="font-bold text-gray-900">{user.followers?.length || 0}</span> followers
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        openNetworkModal("following");
                                    }}
                                    className="hover:text-gray-900 hover:underline flex gap-1"
                                >
                                    <span className="font-bold text-gray-900">{user.following?.length || 0}</span> following
                                </button>
                            </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
                            →
                        </div>
                    </Link>
                </div>
            )}

            {/* Network Modal */}
            {showNetworkModal && user && (
                <NetworkModal
                    userId={user._id || user.id}
                    startTab={networkTab}
                    onClose={() => setShowNetworkModal(false)}
                />
            )}
        </div>
    );
}
