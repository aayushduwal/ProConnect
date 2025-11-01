import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [autoFill, setAutoFill] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Auto-fetch user data on page load
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data;
        if (user.name) {
          const [first, ...rest] = user.name.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }
        if (user.bio) setBio(user.bio);
        if (user.username) setUsername(user.username);
        if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl);
      })
      .catch((err) => {
        console.error("❌ Failed to load user data:", err);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You must be logged in!");
      return;
    }

    // ✅ Require firstName, lastName, and username
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !bio.trim() ||
      !username.trim()
    ) {
      alert("Please fill in your first name, last name, bio and username!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/me",
        {
          name: `${firstName.trim()} ${lastName.trim()}`,
          bio: bio.trim(),
          username: username.trim(),
          linkedinUrl: linkedinUrl.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Profile updated:", res.data);
      navigate("/profile");
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Welcome to ProConnect
        </h2>
        <p className="text-center text-gray-500 mb-6">
          First things first, tell us a bit about yourself!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First + Last name */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Brief bio <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              maxLength={120}
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="text-right text-xs text-gray-400">
              {bio.length}/120
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              proconnect.io/{username || "your-username"}
            </p>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              LinkedIn profile URL
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://www.linkedin.com/in/your-username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          {/* Autofill checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoFill}
              onChange={(e) => setAutoFill(e.target.checked)}
              className="h-4 w-4 border border-gray-300 rounded cursor-pointer appearance-none checked:bg-white checked:border-gray-400"
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundColor: "white",
                position: "relative",
              }}
              onClick={(e) => {
                e.target.style.backgroundColor = e.target.checked
                  ? "white"
                  : "white";
              }}
            />
            <label className="text-gray-600 text-sm">
              Autofill from LinkedIn & save time (recommended)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            {loading ? "Saving..." : "Create Profile →"}
          </button>
        </form>
      </div>
    </div>
  );
}
