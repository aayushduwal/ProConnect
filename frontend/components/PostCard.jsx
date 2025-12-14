"use client";

import Image from "next/image";
import { useState } from "react";
import { FaRegThumbsUp, FaRegCommentDots, FaShare, FaEllipsisH, FaTrash } from "react-icons/fa";
import { getUser } from "../utils/auth";
import Link from "next/link";


export default function PostCard({ post }) {
    const user = getUser();

    // Check if user has liked this post - handle both _id and id fields
    const userId = user?._id || user?.id;
    const [liked, setLiked] = useState(
        userId ? post.likes.some(likeId => likeId.toString() === userId.toString()) : false
    );
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [showMenu, setShowMenu] = useState(false);

    const handleLike = async () => {
        if (!user || !userId) return alert("Please log in to like.");

        const wasLiked = liked;

        // Optimistic update
        setLiked(!wasLiked);
        setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

        try {
            await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
                method: "PUT",
                headers: { "x-user-id": userId }
            });
        } catch (err) {
            console.error("Like failed", err);
            // Revert on error
            setLiked(wasLiked);
            setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
                method: "DELETE",
                headers: { "x-user-id": userId }
            });

            if (response.ok) {
                alert("Post deleted successfully!");
                window.location.reload(); // Refresh to update the feed
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete post");
            }
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete post");
        }
    };


    if (!post.author) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden font-sans hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="p-4 flex gap-3">
                <Link href={`/u/${post.author.username}`}>
                    <Image
                        src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`}
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="rounded-full w-10 h-10 object-cover border border-gray-100 cursor-pointer"
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link href={`/u/${post.author.username}`}>
                                <h3 className="font-bold text-gray-900 text-sm hover:underline cursor-pointer truncate">
                                    {post.author.name}
                                </h3>
                            </Link>
                            <p className="text-xs text-gray-500 line-clamp-1">{post.author.headline || `@${post.author.username}`}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>

                            {/* Three-dot menu - only show if user is the author */}
                            {userId && post.author._id?.toString() === userId.toString() && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                        aria-label="Post options"
                                    >
                                        <FaEllipsisH className="text-gray-500" size={14} />
                                    </button>

                                    {showMenu && (
                                        <>
                                            {/* Backdrop to close menu */}
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMenu(false)}
                                            />

                                            {/* Dropdown menu */}
                                            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
                                                <button
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        handleDelete();
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <FaTrash size={12} />
                                                    Delete Post
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
                {post.title && <h2 className="font-bold text-lg mb-2 text-gray-900">{post.title}</h2>}
                <p className="text-[15px] text-gray-800 whitespace-pre-line leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* Post Media */}
            {post.mediaUrl && post.mediaUrl !== 'none' && (
                <div className="mt-3 relative w-full bg-gray-50 border-t border-b border-gray-100">
                    {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full max-h-[500px] object-contain" />
                    ) : (
                        <div className="relative w-full h-[300px] sm:h-[400px]">
                            <Image src={post.mediaUrl} alt="Post content" fill className="object-contain" unoptimized />
                        </div>
                    )}
                </div>
            )}

            {/* Tags */}
            <div className="px-4 pt-3 flex flex-wrap gap-2">
                {post.category && (
                    <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-100">
                        {post.category}
                    </span>
                )}
                {[...(post.skills || []), ...(post.technologies || [])].map((tag, idx) => (
                    <span key={idx} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 flex items-center gap-6 mt-2 border-t border-gray-50 bg-white">
                <button
                    onClick={handleLike}
                    className={`group flex items-center gap-2 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-gray-500 hover:text-gray-900"}`}
                >
                    <span className="transform group-active:scale-125 transition-transform duration-200">
                        <FaRegThumbsUp className={liked ? "fill-current" : ""} />
                    </span>
                    <span className="text-xs">{likeCount || 0}</span>
                </button>

                <button
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    onClick={() => alert("Comments feature coming soon!")}
                >
                    <FaRegCommentDots size={18} />
                    <span className="text-xs">{post.comments?.length || 0}</span>
                </button>

                <button
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-auto"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`);
                        alert("Link copied to clipboard!");
                    }}
                >
                    <FaShare size={16} />
                    <span className="text-xs">Share</span>
                </button>
            </div>
        </div>
    );
}
