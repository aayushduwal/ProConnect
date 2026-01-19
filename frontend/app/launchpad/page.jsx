"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { FaRocket, FaPlus, FaSortAmountDown } from "react-icons/fa";
import ProjectCard from "../../components/ProjectCard";
import LaunchProjectModal from "../../components/LaunchProjectModal";
import { getUser } from "../../utils/auth";

export default function LaunchpadPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getUser());
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get("/projects");
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* STICKY TOP HEADER */}
            <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-md z-30 border-b border-gray-200/50 h-16 flex items-center">
                <div className="max-w-3xl mx-auto w-full px-4 md:px-8 flex justify-between items-center">
                    <h1 className="font-bold text-gray-900 text-xl tracking-tight flex items-center gap-2">
                        <FaRocket className="text-orange-500" size={18} />
                        Launchpad
                    </h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#00AA4F] hover:bg-[#009243] text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                        <FaPlus size={12} />
                        Launch
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
                {/* Intro Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-900">Weekly Top Projects</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <FaSortAmountDown />
                            <span>TRENDING</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Discover and upvote the best projects from the ProConnect community.</p>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                rank={index + 1}
                                onUpdate={fetchProjects}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-100">
                            <div className="text-4xl mb-4">🚀</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No projects launched yet</h3>
                            <p className="text-gray-500 text-sm mb-6">Be the first to launch your project!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
                            >
                                Submit your project
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <LaunchProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={fetchProjects}
                user={user}
            />
        </div>
    );
}
