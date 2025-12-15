"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { logout } from "../../utils/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("❌ Failed to load profile:", err);
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-lg text-gray-500">No user data found 😕</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header like Login page */}
      <Header />

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Title text same as Login page */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-400">Your Profile</h2>
          <p className="text-3xl font-semibold text-gray-900">
            Manage your account details.
          </p>
        </div>

        {/* Profile Box */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-5">
          <div>
            <p className="text-sm text-gray-400">Full Name</p>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-lg font-semibold text-gray-900">
              @{user.username}
            </p>
          </div>

          {user.bio && (
            <div>
              <p className="text-sm text-gray-400">Bio</p>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {user.linkedinUrl && (
            <div>
              <p className="text-sm text-gray-400">LinkedIn</p>
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {user.linkedinUrl}
              </a>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => router.push("/complete-profile")}
              className="w-full bg-green-500 hover:bg-black text-white py-2 rounded-2xl transition font-semibold"
            >
              Edit Profile →
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-2xl hover:bg-gray-300 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
