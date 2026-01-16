"use client";
import React, { useState } from "react";
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function ReportModal({ isOpen, onClose, onSubmit, postId }) {
    const [step, setStep] = useState(1); // 1: Select reasons, 2: Success
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [loading, setLoading] = useState(false);

    const reasons = [
        { id: "Spam", title: "Spam", desc: "The post contains content that is massively posted or otherwise misleading in nature." },
        { id: "Unprofessional", title: "Unprofessional", desc: "The content is the post not suitable for a professional social network." },
        { id: "Sexual Content", title: "Sexual Content", desc: "Content that includes graphic sexual activity, nudity, or other types of sexual content." },
        { id: "Irrelevant", title: "Irrelevant", desc: "The post is irrelevant to me." }
    ];

    const toggleReason = (id) => {
        setSelectedReasons(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleReport = async () => {
        if (selectedReasons.length === 0) return;
        setLoading(true);
        try {
            const success = await onSubmit(selectedReasons.join(", "));
            if (success) {
                setStep(2);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setSelectedReasons([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {step === 1 ? (
                    <>
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Why are you reporting this post?</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {reasons.map(reason => (
                                <label key={reason.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100 group">
                                    <div className="mt-1">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            checked={selectedReasons.includes(reason.id)}
                                            onChange={() => toggleReason(reason.id)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-gray-900">{reason.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed group-hover:text-gray-600">
                                            {reason.desc}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={handleReport}
                                disabled={selectedReasons.length === 0 || loading}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${selectedReasons.length > 0
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-md active:scale-95'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Reporting...' : 'Report Post'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center space-y-6">
                        <button onClick={resetAndClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FaTimes size={18} />
                        </button>

                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <FaCheckCircle size={40} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Thank you for reporting!</h3>
                            <div className="space-y-4 px-2">
                                <p className="text-[13px] text-gray-700 leading-relaxed">
                                    We appreciate your concern for the ProConnect community.
                                    Your report has been received and will be reviewed promptly by our team.
                                </p>
                                <p className="text-[13px] text-gray-700 leading-relaxed">
                                    Thank you for helping us maintain a safe and welcoming platform for everyone.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={resetAndClose}
                            className="w-full mt-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
