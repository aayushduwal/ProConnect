"use client";
import { FaFire } from "react-icons/fa";

export default function StreakMenu({ onClose }) {
    return (
        <div className="w-full bg-white shadow-xl border-b border-gray-200 z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h3 className="font-bold text-gray-900">Your Streak</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors font-medium text-sm text-gray-500"
                >
                    Close
                </button>
            </div>

            <div className="p-6 text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFire className="text-4xl text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">0 Days</h2>
                <p className="text-gray-500 text-sm mb-6">You haven't started a streak yet. Start posting to build your fire!</p>

                <button
                    onClick={() => {
                        window.dispatchEvent(new Event("openCreatePostModal"));
                        onClose();
                    }}
                    className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                    Start Streak
                </button>
            </div>
        </div>
    );
}
