"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.push("/login"); // redirect to login if not logged in
      return;
    }

    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("❌ Failed to load profile:", err);
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">No user data found 😕</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👋 Hi, {user.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-gray-500 mb-6">Welcome to your profile</p>

        <div className="space-y-3 text-left">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="text-lg font-medium text-gray-800">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-medium text-gray-800">
              @{user.username}
            </p>
          </div>

          {user.bio && (
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {user.linkedinUrl && (
            <div>
              <p className="text-sm text-gray-500">LinkedIn</p>
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
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push("/complete-profile")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
