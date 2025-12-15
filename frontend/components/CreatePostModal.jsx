"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaGlobeAmericas, FaImage, FaVideo, FaPoll, FaBook, FaSmile, FaHistory, FaTrash, FaUpload } from "react-icons/fa";

export default function CreatePostModal({ isOpen, onClose, user, onPostCreated, initialMediaType }) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Media States
    const [showMediaInput, setShowMediaInput] = useState(false);
    const [mediaType, setMediaType] = useState("none"); // 'image', 'video'
    const [mediaUrl, setMediaUrl] = useState("");

    // Poll States
    const [showPollInput, setShowPollInput] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);

    // Rotating placeholder text
    const placeholders = [
        "What are you working on?",
        "Ask a question to community?",
        "Are you hiring?",
        "Share your thoughts...",
        "What's on your mind?"
    ];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Rotate placeholder text every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    // Load Draft on Open
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem("post_draft");
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                setContent(parsed.content || "");
                setTitle(parsed.title || "");
            }

            // Handle initial media type
            if (initialMediaType) {
                if (initialMediaType === 'poll') {
                    setShowPollInput(true);
                    setShowMediaInput(false);
                } else if (initialMediaType === 'image' || initialMediaType === 'video') {
                    setMediaType(initialMediaType);
                    setShowMediaInput(true);
                    setShowPollInput(false);
                }
            }
        } else {
            // Reset when modal closes
            setShowMediaInput(false);
            setShowPollInput(false);
            setMediaType('none');
        }
    }, [isOpen, initialMediaType]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setMediaUrl(data.url);
            setMediaType(data.type || (file.type.startsWith('video') ? 'video' : 'image'));

            // If the user selected the file, we can auto-show the input area or just rely on the preview
            if (!showMediaInput) setShowMediaInput(true);

        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            // Clear input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handlePost = async () => {
        if (!content && !mediaUrl) return;

        console.log("Attempting to post with user:", user);
        // Support both _id (mongoose default) and id (mapped in auth response)
        const userId = user?._id || user?.id;

        if (!userId) {
            console.error("User ID is missing from user object:", user);
            alert("You seem to be logged out or have an invalid session. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({
                    content,
                    mediaUrl,
                    mediaType: mediaUrl ? mediaType : 'none'
                })
            });

            if (res.ok) {
                if (onPostCreated) onPostCreated();
            } else {
                const errText = await res.text();
                console.error("Failed to create post. Status:", res.status, "Response:", errText);
                try {
                    const errJson = JSON.parse(errText);
                    alert(`Failed to create post: ${errJson.error || errText}`);
                } catch {
                    alert(`Failed to create post: ${errText}`);
                }
            }

        } catch (e) {
            console.error("Post creation failed (network error?):", e);
            alert("Network error: Failed to create post");
        } finally {
            setLoading(false);
            setContent("");
            setMediaUrl("");
            setShowMediaInput(false);
            localStorage.removeItem("post_draft");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                            {user?.profilePic || user?.avatarUrl ? (
                                <img
                                    src={
                                        (user.profilePic && user.profilePic.length > 0 ? user.profilePic : null) ||
                                        (user.avatarUrl && user.avatarUrl.length > 0 ? user.avatarUrl : null) ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`
                                    }
                                    alt="User"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={placeholders[placeholderIndex]}
                                className="w-full text-lg text-gray-900 resize-none outline-none min-h-[100px] placeholder-gray-400 mt-2"
                            />
                        </div>
                    </div>

                    {/* Media Input Area */}
                    {showMediaInput && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium text-gray-600 capitalize">
                                    Add {mediaType === 'none' ? 'Media' : mediaType}
                                </span>
                                <button onClick={() => setShowMediaInput(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        className="flex-1 p-2.5 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors text-sm"
                                        placeholder={`Paste ${mediaType} URL...`}
                                        autoFocus
                                    />
                                    <span className="self-center text-gray-400 text-sm">OR</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept={mediaType === 'video' ? "video/*" : "image/*"}
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"></span>
                                        ) : (
                                            <FaUpload size={14} />
                                        )}
                                        Upload
                                    </button>
                                </div>

                                {mediaUrl && (
                                    <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200 bg-black/5 aspect-video flex items-center justify-center">
                                        {mediaType === 'image' ? (
                                            <img src={mediaUrl} alt="Preview" className="max-h-[300px] w-auto max-w-full object-contain" />
                                        ) : mediaType === 'video' ? (
                                            <video src={mediaUrl} controls className="max-h-[300px] w-full" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">Preview not available</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Poll Input Area */}
                    {showPollInput && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Create a Poll</span>
                                <button onClick={() => setShowPollInput(false)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <FaTimes size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-black mb-2"
                                placeholder="Ask a question..."
                            />
                            {/* Simple placeholders for options */}
                            <div className="space-y-2">
                                {pollOptions.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        className="w-full p-2 border border-gray-200 rounded-lg bg-white text-sm"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Toolbar */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setShowMediaInput(true); setMediaType('image'); setShowPollInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${mediaType === 'image' && showMediaInput ? "bg-green-100 text-green-700" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Image"
                            >
                                <FaImage size={18} />
                            </button>
                            <button
                                onClick={() => { setShowMediaInput(true); setMediaType('video'); setShowPollInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${mediaType === 'video' && showMediaInput ? "bg-green-100 text-green-700" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Video"
                            >
                                <FaVideo size={18} />
                            </button>
                            <button
                                onClick={() => { setShowPollInput(true); setShowMediaInput(false); }}
                                className={`p-2 rounded-lg transition-colors ${showPollInput ? "bg-green-100 text-green-700" : "hover:bg-gray-200 text-gray-600"}`}
                                title="Poll"
                            >
                                <FaPoll size={18} />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Book (Coming Soon)">
                                <FaBook size={18} />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors" title="Emoji">
                                <FaSmile size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium ${content.length > 2000 ? "text-red-500" : "text-gray-400"}`}>
                                {content.length}/2000
                            </span>
                            <button
                                onClick={handlePost}
                                disabled={!content && !mediaUrl}
                                className="px-6 py-2 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200"
                            >
                                {loading ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
