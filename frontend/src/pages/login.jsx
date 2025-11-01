import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../assets/api/api";
import Header from "../components/Header";
import { saveSession } from "../utils/auth";

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);
      saveSession(res.data.user, res.data.token);
      setMessage("✅ Login successful!");
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "❌ Login failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header/Navbar */}
      <Header />

      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-400">
            Welcome back!
          </h2>
          <p className="text-3xl font-semibold text-gray-900">
            Login to your account.
          </p>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-3">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center border border-gray-300 rounded-2xl py-2 bg-white hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-3 text-sm text-gray-400">
              or continue with email
            </span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 bg-transparent p-1 focus:outline-none"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible
                      size={20}
                      className="text-gray-500"
                    />
                  ) : (
                    <AiOutlineEye size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
              <div className="text-right mt-1">
                <a
                  href="/forgot-password"
                  className="text-sm text-gray-500 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-2xl transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-sm mt-6">
          <span className="text-gray-400">
            Don’t have a ProConnect profile?{" "}
          </span>
          <a
            href="/signup"
            className="text-gray-600 hover:underline font-medium"
          >
            Create One!
          </a>
        </p>
      </div>
    </div>
  );
}
