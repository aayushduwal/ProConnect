"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";
import { FaUser, FaInbox, FaCog, FaBell, FaBriefcase, FaGlobe, FaShieldAlt } from "react-icons/fa";
import { getUser } from "../../utils/auth";

export default function ProfileSettingsLayout({ children }) {
    const pathname = usePathname();
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        setUser(getUser());
    }, []);

    const sidebarItems = [
        { name: "Profile", href: "/profile", icon: <FaUser /> },
        { name: "Inbox", href: "/profile/inbox", icon: <FaInbox /> },
        { name: "Account", href: "/profile/account", icon: <FaCog /> },
        { name: "Notifications", href: "/profile/notifications", icon: <FaBell /> },
        { name: "Job Preferences", href: "/profile/preferences", icon: <FaBriefcase /> },
        { name: "Custom Domain", href: "/profile/domain", icon: <FaGlobe />, badge: "Not Connected" },
        ...(user?.role === "admin" ? [{ name: "Admin Panel", href: "/admin", icon: <FaShieldAlt /> }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_280px] min-h-screen">

                {/* GLOBAL LEFT SIDEBAR */}
                <div className="hidden md:block">
                    <SidebarLeft />
                </div>

                {/* CENTER CONTENT (Settings Form) */}
                <div className="flex-1 min-w-0 border-x border-gray-200 bg-white min-h-screen">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            {children}
                        </div>
                    </div>
                </div>

                {/* GLOBAL RIGHT SIDEBAR (With Settings Nav) */}
                <div className="hidden lg:block">
                    <SidebarRight>
                        {/* Settings Navigation */}
                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-gray-900 mb-2 px-2">Settings</h2>
                            <nav className="flex flex-col gap-1">
                                {sidebarItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                                ? "text-gray-900 font-bold bg-gray-100/80"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-xl">
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-500">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </SidebarRight>
                </div>
            </div>
        </div>
    );
}
