"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import PostCard from "../../components/PostCard";
import { getToken, getUser } from "../../utils/auth";

export default function ScrollPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Header States
  const [activeTab, setActiveTab] = useState("trending"); // newest, trending, following

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
    <div className="flex flex-col min-h-screen">
      {/* STICKY TOP HEADER */}
      {/* Note: In Peerlist, the header is often part of the middle column, sticky. */}
      <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-md z-30 border-b border-gray-200/50 px-6 py-3 flex justify-between items-center h-16">
        {/* Left Title */}
        <div className="w-[150px] md:w-[200px]">
          <h1 className="font-bold text-gray-900 text-xl tracking-tight">
            Scroll
          </h1>
        </div>

        {/* Center Tabs */}
        <div className="flex-1 flex justify-center">
          <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("newest")}
              className={`px-4 md:px-5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "newest"
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              NEWEST
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`px-4 md:px-5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "trending"
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              TRENDING
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`px-4 md:px-5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "following"
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              FOLLOWING
            </button>
          </div>
        </div>

        {/* Right Spacer for Balance */}
        <div className="w-[150px] md:w-[200px]"></div>
      </div>

      {/* SCROLLABLE CONTENT GRID */}
      <div className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        {/* Create Post Widget */}
        {user ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 transition-shadow hover:shadow-md">
            <div className="flex gap-4">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={
                    user.profilePic ||
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${user.name}`
                  }
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
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all shadow-sm ${
                      newPostContent.trim()
                        ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
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
            <Link
              href="/login"
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No posts yet.</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}
