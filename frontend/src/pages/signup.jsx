import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../assets/api/api";
import Header from "../components/Header";
import { saveSession } from "../utils/auth";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", formData);
      saveSession(res.data.user, res.data.token);
      setMessage("✅ Signup successful!");
      setTimeout(() => (window.location.href = "/complete-profile"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Signup failed! Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Navbar/Header */}
      <Header />

      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Text above the signup box */}
        <div className="text-center mb-8">
          <p className="text-gray-400 italic">Join with your peers.</p>
          <h2 className="text-3xl font-semibold mb-2">
            Sign up & create your profile.
          </h2>
        </div>

        {/* Signup Box */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-8 max-h-[28rem] space-y-3 overflow-y-auto">
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

          <div className="my-4 flex items-center">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-3 text-sm text-gray-400">
              or continue with email
            </span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@youremail.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
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
                  placeholder="At least 8 characters."
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
              </div>{" "}
              {/* closes relative wrapper */}
            </div>{" "}
            {/* closes Password field wrapper */}
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-2xl transition"
            >
              Create Profile →
            </button>
          </form>

          <p className="text-center text-sm mt-6">
            <span className="text-gray-400">
              By clicking “Create Profile” you agree to our{" "}
            </span>
            <a href="#" className="text-gray-600 hover:underline">
              Code of Conduct
            </a>
            <span className="text-gray-400">, </span>
            <a href="#" className="text-gray-600 hover:underline">
              Terms of Service
            </a>
            <span className="text-gray-400"> and </span>
            <a href="#" className="text-gray-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
          )}
        </div>
        <p className="text-center text-sm mt-4">
          <span className="text-gray-400">Already have a profile? </span>
          <a
            href="/login"
            className="text-gray-600 hover:underline font-medium"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
