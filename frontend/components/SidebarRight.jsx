"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaBell, FaSearch } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import { getUser } from "../utils/auth";

export default function SidebarRight() {
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="sticky top-0 h-screen flex flex-col border-l border-gray-200 bg-[#FAFAFA]">
            {/* Header Part - Matches Main Header */}
            <div className="bg-[#FAFAFA]/95 backdrop-blur-md z-30 border-b border-gray-200/50 px-6 h-16 flex items-center flex-none">
                <div className="flex items-center gap-3 w-full" ref={menuRef}>
                    {/* Search Bar */}
                    <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm focus-within:shadow-md focus-within:border-gray-300 transition-all">
                        <FaSearch className="text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="ml-2 w-full text-xs outline-none bg-transparent placeholder:text-gray-400 text-gray-700"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all">
                            <span className="text-sm font-bold text-orange-400">🥚</span>
                            <span className="text-xs font-bold text-gray-700">0</span>
                        </button>

                        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all">
                            <FaBell size={16} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="relative w-9 h-9 rounded-full border border-gray-200 overflow-hidden hover:ring-2 hover:ring-gray-100 transition-all cursor-pointer"
                            >
                                {user ? (
                                    <Image
                                        src={user.profilePic || user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                                        fill
                                        alt="Profile"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <span className="text-xs">?</span>
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-12 z-50 w-64 origin-top-right">
                                    <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Part */}
            <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-64px)] sticky top-16">

                {/* Footer Links */}
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 px-2 font-medium">
                    <span className="cursor-pointer hover:text-gray-600">Privacy</span> •
                    <span className="cursor-pointer hover:text-gray-600">Terms</span> •
                    <span className="cursor-pointer hover:text-gray-600">About</span> •
                    <span>© 2025 ProConnect</span>
                </div>
            </div>
        </div>
    );
}
