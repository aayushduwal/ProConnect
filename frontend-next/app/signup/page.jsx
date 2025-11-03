"use client";

import Link from "next/link";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Header from "../../components/Header";
import api from "../../lib/api";
import { saveSession } from "../../utils/auth";

export default function Signup() {
  const [formData, setFormData] = useState({
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
      // only email + password
      const res = await api.post("/auth/register", formData);

      // save token and user in localStorage
      saveSession(res.data.user, res.data.token);
      setMessage("✅ Signup successful!");

      // redirect to complete profile page
      setTimeout(() => {
        window.location.href = "/completeprofile";
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Signup failed! Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-gray-400 italic">Join with your peers.</p>
          <h2 className="text-3xl font-semibold mb-2">
            Sign up & create your profile.
          </h2>
        </div>

        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-3">
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
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-2xl transition"
            >
              Continue →
            </button>
          </form>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
          )}
        </div>

        <p className="text-center text-sm mt-4">
          <span className="text-gray-400">Already have a profile? </span>
          <Link
            href="/login"
            className="text-gray-600 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
