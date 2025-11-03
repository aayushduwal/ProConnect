"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <nav className="w-full bg-white border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-[540px] mx-auto flex justify-between items-center px-3 py-3">
        {/* Left side: Logo + Site Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="ProConnect Logo"
            width={24}
            height={24}
            className="rounded-lg object-cover"
          />
          <span className="text-black font-bold text-lg flex items-center">
            ProConnect
          </span>
        </Link>

        {/* Right side: Links + Buttons */}
        <div className="flex items-center gap-4 text-xs">
          <a
            href="#scroll"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Scroll
          </a>
          <a
            href="#jobs"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Jobs
          </a>
          <a
            href="#launchpad"
            className="text-black hover:text-black flex items-center h-6 leading-none"
          >
            Launchpad
          </a>

          {/* Log in button (fixed to match React version) */}
          <Link
            href="/login"
            className="px-2 py-1 border border-gray-300 rounded-lg text-black hover:text-black flex items-center h-6 leading-none"
          >
            Log in
          </Link>

          {/* Create Profile button (unchanged) */}
          <Link
            href="/signup"
            className="px-2 py-1 bg-green-600 text-white rounded-lg hover:text-white flex items-center h-6 leading-none"
          >
            Create Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
