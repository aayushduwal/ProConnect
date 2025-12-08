"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getUser } from "../utils/auth"; // Adjust path if necessary

export default function SidebarLeft() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Assuming getUser is a synchronous local storage check or similar
        // as per the original file's usage
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    return (
        <div className="hidden md:flex flex-col h-screen sticky top-0 py-6 pl-6 border-r border-gray-200 z-40">
            {/* Logo Area */}
            <div className="mb-8 flex items-center gap-2 pl-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image
                        src="/assets/logo.png"
                        width={32}
                        height={32}
                        alt="Logo"
                        className="rounded-lg"
                    />
                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        ProConnect
                    </span>
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1 flex-1">
                {[
                    { name: "Scroll", icon: "🏠", active: true, href: "/scroll" },
                    { name: "Launchpad", icon: "🚀", href: "#" },
                    { name: "Articles", icon: "✍️", href: "#" },
                    { name: "Jobs", icon: "💼", href: "#" },
                    { name: "Inbox", icon: "💬", href: "#" },
                    { name: "Search", icon: "🔍", href: "#" },
                ].map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${item.active
                            ? "text-gray-900 font-bold bg-gray-100/80"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
