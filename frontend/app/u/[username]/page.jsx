"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import { getUser, getToken } from "../../../utils/auth";
import { FaCheck } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import NetworkModal from "../../../components/NetworkModal";

export default function PublicProfile() {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Network Modal State
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [networkTab, setNetworkTab] = useState("followers");

    useEffect(() => {
        const loggedInUser = getUser();
        setCurrentUser(loggedInUser);
    }, []);

    useEffect(() => {
        if (!username) return;

        fetch(`http://localhost:5000/api/users/u/${username}`)
            .then((res) => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                // Check if I am following only if I'm logged in and data is loaded
                if (getUser()) {
                    const myId = getUser()._id || getUser().id;
                    // Ensure we check against the list of followers if it exists
                    if (data.followers && data.followers.includes(myId)) {
                        setIsFollowing(true);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to fetch public profile:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [username]);

    const handleFollowToggle = async () => {
        if (!currentUser || !user) return;

        setFollowLoading(true);
        const token = getToken();
        const endpoint = isFollowing ? "unfollow" : "follow";

        try {
            const res = await fetch(`http://localhost:5000/api/users/${endpoint}/${user._id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                setIsFollowing(!isFollowing);
                // Update local follower count visually
                setUser(prev => ({
                    ...prev,
                    followers: isFollowing
                        ? prev.followers.filter(id => id !== currentUser._id)
                        : [...(prev.followers || []), currentUser._id]
                }));
            }
        } catch (err) {
            console.error("Follow action failed", err);
        } finally {
            setFollowLoading(false);
        }
    };

    const openNetworkModal = (tab) => {
        setNetworkTab(tab);
        setShowNetworkModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found 😕</h2>
                    <p className="text-gray-500">The user @{username} does not exist.</p>
                </div>
            </div>
        );
    }

    const isMe = currentUser && (currentUser._id === user._id || currentUser.id === user._id);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
            <Header />

            <main className="flex-1 flex flex-col items-center px-4 py-12">
                <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    {/* Cover / Header Area */}
                    <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 w-full relative"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white">
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

                            {/* Follow Button */}
                            {!isMe && currentUser && (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${isFollowing
                                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        : "bg-black text-white hover:bg-gray-900 border border-transparent"
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <FaCheck size={12} />
                                            Following
                                        </>
                                    ) : (
                                        "Follow"
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-500 font-medium">@{user.username}</p>
                            </div>

                            <div className="flex gap-4 text-sm text-gray-600">
                                <button
                                    onClick={() => openNetworkModal("following")}
                                    className="font-medium hover:text-gray-900 hover:underline"
                                >
                                    <span className="font-bold text-gray-900">{user.following?.length || 0}</span> Following
                                </button>
                                <button
                                    onClick={() => openNetworkModal("followers")}
                                    className="font-medium hover:text-gray-900 hover:underline"
                                >
                                    <span className="font-bold text-gray-900">{user.followers?.length || 0}</span> Followers
                                </button>
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {user.bio}
                                </p>
                            )}

                            <div className="pt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                {user.linkedinUrl && (
                                    <a
                                        href={user.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        <span>🔗</span>
                                        <span>LinkedIn</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <FiCalendar className="text-gray-400" />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Network Modal */}
            {showNetworkModal && (
                <NetworkModal
                    userId={user._id || user.id}
                    startTab={networkTab}
                    onClose={() => setShowNetworkModal(false)}
                />
            )}
        </div>
    );
}
