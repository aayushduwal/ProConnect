"use client";

import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";

export default function SearchLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_280px] min-h-screen">

                {/* LEFT COLUMN */}
                <div className="hidden md:block">
                    <SidebarLeft />
                </div>

                {/* MIDDLE COLUMN */}
                <div className="flex-1 min-w-0 bg-[#FAFAFA]">
                    {children}
                </div>

                {/* RIGHT COLUMN */}
                <div className="hidden lg:block">
                    <SidebarRight />
                </div>

            </div>
        </div>
    );
}
