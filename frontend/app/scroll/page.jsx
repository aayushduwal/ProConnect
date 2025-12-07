"use client";

import { useState, useEffect, useRef } from "react";
import PostCard from "../../components/PostCard";
import ProfileMenu from "../../components/ProfileMenu";
import Image from "next/image";
import Link from "next/link";
import { getUser, getToken } from "../../utils/auth";
import { FaBell, FaSearch } from "react-icons/fa";

export default function ScrollPage() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [newPostContent, setNewPostContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    // Header States
    const [activeTab, setActiveTab] = useState("trending"); // newest, trending, following
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Close menu on click outside
    const menuRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const currentUser = getUser();
        const currentToken = getToken();
        setUser(currentUser);
        setToken(currentToken);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/posts");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        if (!token) return alert("Please log in to post.");

        setCreating(true);
        try {
            const res = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user._id,
                },
                body: JSON.stringify({ content: newPostContent }),
            });

            if (res.ok) {
                setNewPostContent("");
                fetchPosts();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to create post");
            }
        } catch (err) {
            console.error("Error creating post", err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-screen">

                {/* LEFT SIDEBAR - FULL HEIGHT */}
                <div className="hidden md:flex flex-col h-screen sticky top-0 py-6 pl-6 border-r border-transparent z-40">
                    {/* Logo Area */}
                    <div className="mb-8 flex items-center gap-2 pl-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image src="/assets/logo.png" width={32} height={32} alt="Logo" className="rounded-lg" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">ProConnect</span>
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
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${item.active ? "text-gray-900 font-bold bg-gray-100/80" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions (Optional - from screenshot) */}
                    <div className="mt-4 px-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors w-max">
                            <span>⚡ Quick Actions</span>
                            <span className="text-gray-400 font-normal">Ctrl K</span>
                        </div>
                    </div>

                    {/* User Profile at Bottom (Left Sidebar) */}
                    {/* Note: Screenshot showed profile in Top Right, but typically Peerlist has a minimal profile in sidebar too. Keeping both for completeness, or maybe just top right as per request. The request said "right side there is also an profile icon". I'll keep the sidebar one minimal. */}
                    {user && (
                        <div className="mt-8 pt-4 border-t border-gray-100">
                            {/* Sidebar promo card */}
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl text-white mb-6 text-center">
                                <div className="w-10 h-10 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-xl">👤</div>
                                <p className="font-serif text-lg leading-tight mb-1">You are more than just a name.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 min-w-0">

                    {/* STICKY TOP HEADER */}
                    <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-md z-30 border-b border-gray-200/50 px-6 py-3 flex justify-between items-center h-16">

                        {/* Left Title */}
                        <div className="w-[200px]">
                            <h1 className="font-bold text-gray-900 text-xl tracking-tight">Scroll</h1>
                        </div>

                        {/* Center Tabs */}
                        <div className="flex-1 flex justify-center">
                            <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => setActiveTab('newest')}
                                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'newest' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    NEWEST
                                </button>
                                <button
                                    onClick={() => setActiveTab('trending')}
                                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'trending' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    TRENDING
                                </button>
                                <button
                                    onClick={() => setActiveTab('following')}
                                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'following' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    FOLLOWING
                                </button>
                            </div>
                        </div>

                        {/* Right Icons & Search */}
                        <div className="w-[200px] flex justify-end items-center gap-4 relative" ref={menuRef}>
                            {/* Search (Collapsed on small screens) */}
                            <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 w-40">
                                <FaSearch className="text-gray-400 text-xs" />
                                <input type="text" placeholder="Search..." className="ml-2 w-full text-xs outline-none bg-transparent placeholder:text-gray-400" />
                            </div>

                            {/* Icons */}
                            <button className="relative p-1 text-gray-400 hover:text-gray-900 transition-colors">
                                <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">0</span>
                            </button>
                            <button className="text-gray-500 hover:text-gray-900 transition-colors">
                                <FaBell size={18} />
                            </button>

                            {/* Profile Trigger */}
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="relative w-8 h-8 rounded-full border border-gray-200 overflow-hidden hover:ring-2 hover:ring-gray-200 transition-all"
                            >
                                {user && <Image src={user.profilePic || user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} fill alt="Profile" className="object-cover" />}
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && <ProfileMenu user={user} onClose={() => setShowProfileMenu(false)} />}
                        </div>

                    </div>

                    {/* SCROLLABLE CONTENT GRID */}
                    <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

                        {/* FEED COLUMN */}
                        <div>
                            {/* Create Post Widget */}
                            {user ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 transition-shadow hover:shadow-md">
                                    <div className="flex gap-4">
                                        <div className="relative w-10 h-10 flex-shrink-0">
                                            <Image
                                                src={user.profilePic || user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                                                fill
                                                className="rounded-full object-cover border border-gray-100"
                                                alt="Me"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                placeholder="What are you building today?"
                                                className="w-full text-base placeholder:text-gray-400 border-none focus:ring-0 resize-none h-16 p-0 text-gray-800 bg-transparent leading-relaxed"
                                            />
                                            <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-3">
                                                <div className="flex gap-4 text-gray-400">
                                                    {/* Icons could go here */}
                                                </div>
                                                <button
                                                    onClick={handleCreatePost}
                                                    disabled={!newPostContent.trim() || creating}
                                                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all shadow-sm ${newPostContent.trim() ? "bg-green-600 text-white hover:bg-green-700 active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                                >
                                                    {creating ? "Posting..." : "Post"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-2xl text-center border border-gray-100 shadow-sm mb-6">
                                    <p className="text-gray-600 mb-3">Join the community</p>
                                    <Link href="/login" className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold">Log In</Link>
                                </div>
                            )}

                            {/* Posts */}
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-20"><p className="text-gray-400">No posts yet.</p></div>
                                ) : (
                                    posts.map(post => <PostCard key={post._id} post={post} />)
                                )}
                            </div>
                        </div>

                        {/* RIGHT WIDGETS COLUMN */}
                        <div className="hidden lg:block space-y-6">

                            {/* Promo */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-xl">♠️</div>
                                    <button className="text-xs font-semibold px-3 py-1 bg-gray-50 rounded-full hover:bg-gray-100 border border-gray-200">Visit ↗</button>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">ace.me</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                                    Your new website, email address & cloud storage. Simple. Fast. Secure.
                                </p>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Promoted</div>
                            </div>

                            {/* Staff Pick */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                                <h3 className="font-bold text-gray-900 text-sm mb-4">Today's Staff Picked Project!</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center text-lg shadow-md">⚡</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">FlashBuild</h4>
                                        <p className="text-xs text-gray-500">Deploy in seconds.</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-center">
                                        <span className="text-xs font-bold text-green-700">▲ 240</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-400 px-2 font-medium">
                                <span className="cursor-pointer hover:text-gray-600">Privacy</span> •
                                <span className="cursor-pointer hover:text-gray-600">Terms</span> •
                                <span className="cursor-pointer hover:text-gray-600">About</span> •
                                <span>© 2024 ProConnect</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
