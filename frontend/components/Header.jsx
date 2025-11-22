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
    setUser(getUser());
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
    <nav className="w-full bg-white border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-[540px] mx-auto flex justify-between items-center px-3 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="ProConnect Logo"
            width={24}
            height={24}
            className="rounded-lg object-cover"
          />
          <span className="text-black font-bold text-lg">ProConnect</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <a href="#scroll" className="text-black hover:text-black">
            Scroll
          </a>
          <a href="#jobs" className="text-black hover:text-black">
            Jobs
          </a>
          <a href="#launchpad" className="text-black hover:text-black">
            Launchpad
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            className="p-2 border rounded-md"
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
          >
            {/* Hamburger Icon */}
            <div className="w-5 h-0.5 bg-black mb-1"></div>
            <div className="w-5 h-0.5 bg-black mb-1"></div>
            <div className="w-5 h-0.5 bg-black"></div>
          </button>
        </div>

        {/* Profile */}
        {user && (
          <div className="relative ml-3" ref={dropdownRef}>
            <button onClick={() => setOpenDropdown(!openDropdown)}>
              {user.profilePic ? (
                <Image
                  src={user.profilePic}
                  width={32}
                  height={32}
                  alt="Profile"
                  className="rounded-full border cursor-pointer"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer text-gray-700 font-semibold">
                  {user.name?.[0] || "U"}
                </div>
              )}
            </button>

            {openDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-lg py-2 z-50">
                <span className="block px-4 py-2 text-gray-900 font-semibold border-b">
                  {user.name || "User"}
                </span>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login / Signup for logged-out users */}
        {!user && (
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/login"
              className="px-2 py-1 border border-gray-300 rounded-lg text-black"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-2 py-1 bg-green-600 text-white rounded-lg"
            >
              Create Profile
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu links */}
      {openMobileMenu && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <a
            href="#scroll"
            className="block px-4 py-2 text-black hover:bg-gray-100"
          >
            Scroll
          </a>
          <a
            href="#jobs"
            className="block px-4 py-2 text-black hover:bg-gray-100"
          >
            Jobs
          </a>
          <a
            href="#launchpad"
            className="block px-4 py-2 text-black hover:bg-gray-100"
          >
            Launchpad
          </a>

          {!user && (
            <>
              <Link
                href="/login"
                className="block px-4 py-2 text-black hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-green-600 hover:bg-gray-100"
              >
                Create Profile
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
