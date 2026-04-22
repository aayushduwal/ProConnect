"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaEllipsisH,
  FaRegCommentDots,
  FaRegThumbsUp,
  FaShare,
  FaTrash,
  FaFlag,
  FaBookmark,
  FaRegBookmark,
  FaTimes
} from "react-icons/fa";
import { getUser } from "../utils/auth";
import CommentSection from "./CommentSection";
import ReportModal from "./ReportModal";
import PollCard from "./PollCard";

export default function PostCard({ post }) {
  const user = getUser();

  // Check if user has liked this post - handle both _id and id fields
  const userId = user?._id || user?.id;
  const [liked, setLiked] = useState(
    userId
      ? post.likes.some((likeId) => likeId.toString() === userId.toString())
      : false
  );
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const MAX_CHAR_LIMIT = 280;
  const isContentLong = post.content?.length > MAX_CHAR_LIMIT;
  const displayedContent = isExpanded ? post.content : post.content?.slice(0, MAX_CHAR_LIMIT) + (isContentLong ? "..." : "");

  const handleLike = async () => {
    if (!user || !userId) return alert("Please log in to like.");

    const wasLiked = liked;

    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: "PUT",
        headers: { "x-user-id": userId },
      });
    } catch (err) {
      console.error("Like failed", err);
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: { "x-user-id": userId },
        }
      );

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

  const handleReport = async (reason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setShowMenu(false);
        return true;
      } else {
        alert("Failed to report post");
        return false;
      }
    } catch (err) {
      console.error("Report failed", err);
      return false;
    }
  };

  if (!post.author) return null;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden font-sans hover:shadow-md transition-all">
      {/* Post Header */}
      <div className="p-4 flex gap-3">
        <Link href={`/u/${post.author.username}`}>
          <img
            src={
              (post.author.avatarUrl && post.author.avatarUrl.length > 0 ? post.author.avatarUrl : null) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || 'User')}`
            }
            alt={post.author.name}
            className="rounded-full w-10 h-10 object-cover border border-gray-100 dark:border-gray-800 cursor-pointer"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/u/${post.author.username}`}>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:underline cursor-pointer truncate transition-colors">
                  {post.author.name}
                </h3>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {post.author.headline || `@${post.author.username}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>

              {/* Three-dot menu - only show if user is the author */}
              {userId && post.author._id?.toString() === userId.toString() && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <FaEllipsisH className="text-gray-500 dark:text-gray-400" size={14} />
                  </button>

                  {showMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />

                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-1 bg-white dark:bg-[#111] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-20 min-w-[150px]">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleDelete();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <FaTrash size={12} />
                          Delete Post
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Show report for non-authors */}
              {userId && post.author._id?.toString() !== userId.toString() && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Post options"
                  >
                    <FaEllipsisH className="text-gray-500 dark:text-gray-400" size={14} />
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 mt-1 bg-white dark:bg-[#111] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-20 min-w-[150px]">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowReportModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <FaFlag className="text-red-500" size={12} />
                          Report Post
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
        {post.title && (
          <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white transition-colors">{post.title}</h2>
        )}
        <p className="text-[15px] text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed transition-colors">
          {displayedContent}
          {isContentLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-green-600 dark:text-green-400 font-semibold hover:underline"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </p>
      </div>

      {/* GitHub Embed */}
      {post.githubEmbed && post.githubEmbed.repoName && (
        <div className="px-4 mt-2 mb-3">
          <a
            href={post.githubEmbed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[15px] text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                  {post.githubEmbed.repoName}
                </h4>
                <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {post.githubEmbed.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {post.githubEmbed.language && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      {post.githubEmbed.language}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
                    {post.githubEmbed.stars?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
                    {post.githubEmbed.forks?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Post Media */}
      {(post.mediaUrls?.length > 0 || (post.mediaUrl && post.mediaUrl !== "none")) && (
        <div className="mt-3 px-4 relative w-full">
          {post.mediaType === "video" ? (
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
              <video
                src={post.mediaUrls?.[0] || post.mediaUrl}
                controls
                controlsList="nodownload"
                className="w-full max-h-[500px] object-contain"
              />
            </div>
          ) : (
            <div className={`grid gap-2 ${(post.mediaUrls?.length || 1) === 1 ? "grid-cols-1" :
              (post.mediaUrls?.length) === 2 ? "grid-cols-2" :
                (post.mediaUrls?.length) >= 3 ? "grid-cols-2" : ""
              }`}>
              {(post.mediaUrls?.length > 0 ? post.mediaUrls : [post.mediaUrl]).map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-full cursor-zoom-in rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 group ${(post.mediaUrls?.length || 1) === 1 ? "h-[300px] sm:h-[400px]" :
                    (post.mediaUrls?.length) === 2 ? "h-[200px] sm:h-[300px]" :
                      (post.mediaUrls?.length) === 3 && idx === 0 ? "h-[400px] row-span-2" :
                        "h-[200px]"
                    }`}
                >
                  <Image
                    src={url}
                    alt={`Post content ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Poll */}
      {post.poll && <PollCard poll={post.poll} postId={post._id || post.id} />}

      {/* Tags */}
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {post.category && (
          <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-100 dark:border-purple-800 transition-colors">
            {post.category}
          </span>
        )}
        {[...(post.skills || []), ...(post.technologies || [])].map(
          (tag, idx) => (
            <span
              key={idx}
              className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100 dark:border-gray-800"
            >
              #{tag}
            </span>
          )
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center gap-6 mt-2 border-t border-gray-50 dark:border-gray-900/50 bg-white dark:bg-[#0A0A0A] transition-colors">
        <button
          onClick={handleLike}
          className={`group flex items-center gap-2 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          <span className="transform group-active:scale-125 transition-transform duration-200">
            <FaRegThumbsUp className={liked ? "fill-current" : ""} />
          </span>
          <span className="text-xs">{likeCount || 0}</span>
        </button>

        <button
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${showComments ? "text-purple-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
          onClick={() => setShowComments(!showComments)}
        >
          <FaRegCommentDots size={18} />
          <span className="text-xs">
            {(post.comments || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
          </span>
        </button>

        <button
          className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.origin + `/post/${post._id}`
            );
            alert("Link copied to clipboard!");
          }}
        >
          <FaShare size={16} />
          <span className="text-xs">Share</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection postId={post._id} initialComments={post.comments} />
      )}

      {/* Professional Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        postId={post._id}
      />
      {/* Lightbox Overlay */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[110]"
            onClick={() => setSelectedImageIndex(null)}
          >
            <FaTimes size={28} />
            <span className="sr-only">Close</span>
          </button>

          {/* Navigation */}
          {post.mediaUrls?.length > 1 && (
            <>
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] p-2 bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => (prev === 0 ? post.mediaUrls.length - 1 : prev - 1));
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] p-2 bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(prev => (prev === post.mediaUrls.length - 1 ? 0 : prev + 1));
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={(post.mediaUrls?.length > 0 ? post.mediaUrls : [post.mediaUrl])[selectedImageIndex]}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              alt="Fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
