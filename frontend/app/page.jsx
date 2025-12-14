"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import DomeGallery from "../components/DomeGallery";
import Header from "../components/Header";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Fetch recent users
    fetch("http://localhost:5000/api/users/recent")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => console.error("Failed to load users", err));
  }, []);

  const checkUsername = () => {
    if (!username) return setAvailable(null);
    if (username.length < 3) return setAvailable(false);

    fetch(`http://localhost:5000/api/users/check/${username}`)
      .then((res) => res.json())
      .then((data) => setAvailable(data.available))
      .catch((err) => console.error(err));
  };

  // Create a display list: Real users + placeholders to fill the grid up to 30
  const displayUsers = [
    ...users,
    ...Array.from({ length: Math.max(0, 30 - users.length) }),
  ].slice(0, 30);

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] text-gray-900 flex flex-col items-center">
      {/* Header */}
      <Header />

      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 w-full max-w-[600px]">
        {/* Animated Badge (optional) */}
        <div className="mb-6 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2"></span>
          Join the fastest growing network
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-gray-900">
          <span className="font-serif italic text-gray-700">
            The Professional Network
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
            for builders to show & tell!
          </span>
        </h1>

        <p className="text-gray-500 mt-4 text-lg max-w-md mx-auto leading-relaxed">
          Showcase your work, launch projects, find jobs, and connect with
          incredible people in tech and design.
        </p>

        {/* Username Input Card */}
        <div className="w-full max-w-[440px] mt-10 p-1.5 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 transition-all focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500/50">
          <div className="flex items-center w-full">
            {/* Prefix */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 rounded-lg mr-2 border border-gray-100">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={18}
                height={18}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-gray-600 tracking-tight">
                proconnect.io/
              </span>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="username"
              className="flex-1 outline-none text-base bg-transparent text-gray-900 placeholder-gray-400 font-medium"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
                )
              }
              onKeyDown={(e) => e.key === "Enter" && checkUsername()}
            />

            {/* Action Button */}
            <button
              onClick={checkUsername}
              className="group flex items-center justify-center ml-2 h-9 w-9 bg-green-600 hover:bg-green-600 text-white rounded-lg transition-all active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="h-6 mt-3">
          {available === true && (
            <p className="text-green-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 bg-green-50 px-3 py-1 rounded-full inline-block border border-green-100">
              🎉 <span className="font-bold">{username}</span> is available!
              Claim it now.
            </p>
          )}
          {available === false && (
            <p className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1 bg-red-50 px-3 py-1 rounded-full inline-block border border-red-100">
              😕 <span className="font-bold">{username}</span> is taken. Try
              another?
            </p>
          )}
          {available === null && !username && (
            <p className="text-gray-400 text-xs font-medium">
              Claim your username before it's too late!
            </p>
          )}
        </div>

        {/* Community Grid */}
        <div className="mt-16 w-full">
          <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider text-center">
            Join 162,105+ peers
          </p>
        </div>
      </section>
      <section className="relative z-10 w-full">
        <DomeGallery
          images={users.map((user) => ({
            src:
              user.profilePicture ||
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${user.name}`,
            alt: user.name || user.username || "User",
          }))}
        />
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-24">
        {/* Footer Background Pattern - Full Width */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Centered Content Container */}
        <div className="relative z-10 w-full max-w-[900px] mx-auto py-20 px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
            {/* Logo Section - Spans 2 columns for breathing room */}
            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                <h2 className="text-4xl font-serif italic text-gray-200 tracking-tight hover:text-black transition-colors duration-300 cursor-pointer">
                  ProConnect
                </h2>
                <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-xs">
                  The professional network for builders to show & tell. Connect
                  with the most incredible people in tech.
                </p>
              </div>
            </div>

            {/* Main Pages */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-6">
                Platform
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="/scroll"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Scroll
                  </a>
                </li>
                <li>
                  <a
                    href="/jobs"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Startup Jobs
                  </a>
                </li>
                <li>
                  <a
                    href="/launchpad"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Launchpad
                  </a>
                </li>
                <li>
                  <a
                    href="/search"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Search People
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/challenges"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Challenges
                  </a>
                </li>
              </ul>
            </div>

            {/* Tools */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-6">
                Tools
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="/job-hunt-ai"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Job Hunt AI
                  </a>
                </li>
                <li>
                  <a
                    href="/github-recap"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    GitHub Recap
                  </a>
                </li>
                <li>
                  <a
                    href="/layoffs-tracker"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Layoffs Tracker
                  </a>
                </li>
                <li>
                  <a
                    href="/readme-badge"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    README Badge
                  </a>
                </li>
                <li>
                  <a
                    href="/internship"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Internships
                  </a>
                </li>
                <li>
                  <a
                    href="/resume-builder"
                    className="text-[15px] text-gray-500 hover:text-gray-900 transition-colors font-medium"
                  >
                    Resume Builder
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Row: Copyright & Legal */}
          <div className="pt-8 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Copyright - Spans 2 columns to align with Logo section */}
              <div className="md:col-span-2 flex items-center gap-2.5 text-sm text-gray-400 font-medium">
                <span>© 2025</span>
                <div className="flex items-center gap-1.5 local-font">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-[10px] font-bold">PC</span>
                  </div>
                  <span className="text-gray-600">ProConnect Inc.</span>
                </div>
              </div>

              {/* Resources Links - Spans 2 columns to align with Platform & Tools */}
              <div className="md:col-span-2 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] font-medium text-gray-500 pt-1">
                <a
                  href="/brand-kit"
                  className="hover:text-gray-900 transition-colors"
                >
                  Brand Kit
                </a>
                <a
                  href="/help"
                  className="hover:text-gray-900 transition-colors"
                >
                  Help
                </a>
                <a
                  href="/privacy"
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/code-of-conduct"
                  className="hover:text-gray-900 transition-colors"
                >
                  Code of Conduct
                </a>
                <a
                  href="/terms"
                  className="hover:text-gray-900 transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
