"use client";

import Image from "next/image";
import { useState } from "react";
import { FaRegThumbsUp, FaRegCommentDots, FaShare, FaRegPaperPlane } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { getUser } from "../utils/auth";
import Link from "next/link";

export default function PostCard({ post }) {
    const user = getUser();
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const [likeCount, setLikeCount] = useState(post.likes.length);

    const handleLike = async () => {
        if (!user) return alert("Please log in to like.");

        // Optimistic update
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);

        try {
            await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
                method: "PUT",
                headers: { "x-user-id": user._id }
            });
        } catch (err) {
            console.error("Like failed", err);
            // Revert on error
            setLiked(!liked);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
        }
    };

    if (!post.author) return null; // Safety check

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden font-sans hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="p-4 flex gap-3">
                {/* Author Avatar */}
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

                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {/* Simple relative time (e.g. 2h) - could use date-fns */}
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
                <p className="text-[15px] text-gray-800 whitespace-pre-line leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* Post Image (Real Data) */}
            {post.image && (
                <div className="mt-3 relative w-full h-[300px] sm:h-[400px] bg-gray-50">
                    <Image
                        src={post.image}
                        alt="Post content"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
            )}

            {/* Action Bar (Peerlist Style - Minimal) */}
            <div className="px-4 py-3 flex items-center gap-6 mt-2 border-t border-gray-50">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-gray-500 hover:text-gray-900"}`}
                >
                    {liked ? "❤️" : "🤍"} <span className="text-xs">{likeCount}</span>
                </button>

                <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    💬 <span className="text-xs">{post.comments?.length || 0}</span>
                </button>

                <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-auto">
                    📤 Share
                </button>
            </div>
        </div>
    );
}
