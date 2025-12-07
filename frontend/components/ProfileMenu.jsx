"use client";

import {
    FaRegMoon,
    FaTimes,
    FaCog,
    FaBookmark,
    FaBriefcase,
    FaCheckCircle,
    FaGlobe,
    FaGift,
    FaChartBar,
    FaTools,
    FaSignOutAlt
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../utils/auth";
import { useRouter } from "next/navigation";

export default function ProfileMenu({ user, onClose }) {
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const menuItems = [
        { icon: <FaCog />, label: "Settings", sub: "Edit profile, account, notifications, +2 more." },
        { icon: <FaBookmark />, label: "Bookmarks", sub: "Saved projects and posts to visit later." },
        { icon: <FaBriefcase />, label: "Job Preferences", sub: "Your availability and role preferences." },
        { icon: <FaCheckCircle />, label: "Verification", sub: "Manage identity and other verifications." },
        { icon: <FaGlobe />, label: "Custom Domain", sub: "Use your profile as portfolio on your domain.", badge: "Not Connected" },
        { icon: <FaGift />, label: "Invite and Earn", sub: "See who joined using your invite link.", badge: "New" },
        { icon: <FaChartBar />, label: "Analytics", sub: "Views, clicks, and who viewed your profile." },
        { icon: <FaTools />, label: "Tools", sub: "JobHunt AI, GitHub Recap, and 2 more." },
    ];

    return (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FaRegMoon className="text-gray-600" />
                </button>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes className="text-gray-400" />
                </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-2 flex items-start gap-3">
                <Image
                    src={user?.profilePic || user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                    width={40}
                    height={40}
                    className="rounded-full border border-gray-100"
                    alt="User"
                />
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{user?.name}</h3>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5">Manage integrations, resume, collections, etc.</p>
                </div>
            </div>

            {/* Menu List */}
            <div className="py-2">
                {menuItems.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4">
                        <div className="mt-1 text-gray-700 text-lg">{item.icon}</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[15px] font-medium text-gray-800">{item.label}</span>
                                {item.badge && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badge === 'Not Connected' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-500 text-sm font-medium hover:text-red-600 transition-colors w-full"
                >
                    <FaSignOutAlt className="text-lg" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
