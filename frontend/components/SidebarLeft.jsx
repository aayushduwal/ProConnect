import api from "../lib/api";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getUser } from "../utils/auth";
import NetworkModal from "./NetworkModal";

export default function SidebarLeft() {
    const [user, setUser] = useState(null);
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [networkTab, setNetworkTab] = useState("followers");
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const localUser = getUser();
            if (localUser) {
                try {
                    const res = await api.get("/users/me");
                    setUser(res.data);
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
        <div className="hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-200 z-40 bg-[#FAFAFA]">
            {/* Header Part - Matches Center & Right */}
            <div className="bg-[#FAFAFA]/95 backdrop-blur-md z-30 border-b border-gray-200/50 px-6 h-16 flex items-center flex-none">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 relative flex-shrink-0">
                        <Image
                            src="/assets/logo.png"
                            fill
                            alt="Logo"
                            className="rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        ProConnect
                    </span>
                </Link>
            </div>

            {/* Scrollable Content Part */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                {/* Navigation Items */}
                <div className="space-y-1">
                    {[
                        { name: "Scroll", icon: "🏠", href: "/scroll" },
                        { name: "Launchpad", icon: "🚀", href: "/launchpad" },
                        { name: "Articles", icon: "✍️", href: "#" },
                        { name: "Jobs", icon: "💼", href: "#" },
                        { name: "Inbox", icon: "💬", href: "#" },
                        { name: "Search", icon: "🔍", href: "/search" },
                        ...(user?.role === "admin" ? [{ name: "Admin Panel", icon: "🛡️", href: "/admin" }] : []),
                    ].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${isActive
                                    ? "text-gray-900 font-bold bg-gray-100/80 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mini Profile Section */}
                {user && (
                    <div className="mt-auto pt-6 border-t border-gray-100/50">
                        <Link href={`/u/${user.username}`} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer group">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
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
                                <div className="text-[11px] text-gray-500 font-medium flex items-center gap-2 mt-0.5">
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
                        </Link>
                    </div>
                )}
            </div>

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
