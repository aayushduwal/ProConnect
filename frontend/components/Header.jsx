"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getUser, logout } from "../utils/auth";

export default function Header() {
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = getUser();
    setUser(savedUser || null);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src="/assets/logo.png"
              alt="ProConnect"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-900 font-bold text-xl tracking-tight leading-none font-sans">
            ProConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <Link href="#scroll" className="hover:text-gray-900 transition-colors">
            Scroll
          </Link>
          <Link href="#jobs" className="hover:text-gray-900 transition-colors">
            Jobs
          </Link>
          <Link href="#launchpad" className="hover:text-gray-900 transition-colors">
            Launchpad
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {/* User Profile / Auth Buttons */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {user.profilePic ? (
                  <Image
                    src={user.profilePic}
                    width={36}
                    height={36}
                    alt="Profile"
                    className="rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {/* Enhanced Dropdown */}
              {openDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {user.email || "user@example.com"}
                    </p>
                  </div>

                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      View Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setOpenDropdown(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      Settings
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUser(null);
                        setOpenDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {openMobileMenu && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md absolute w-full shadow-lg p-4 space-y-4 animate-in slide-in-from-top-2">
          <Link href="#scroll" className="block text-gray-600 hover:text-gray-900 py-2">Scroll</Link>
          <Link href="#jobs" className="block text-gray-600 hover:text-gray-900 py-2">Jobs</Link>
          <Link href="#launchpad" className="block text-gray-600 hover:text-gray-900 py-2">Launchpad</Link>
          <hr className="border-gray-100" />
          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login" className="text-center py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">Log In</Link>
              <Link href="/signup" className="text-center py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
