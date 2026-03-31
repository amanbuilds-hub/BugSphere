import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '../api/projects.api';
import { authAtom } from '../atoms/auth.atom';
import { useRecoilValue } from 'recoil';
import { Folder, Plus, Users, Bug, Search, ChevronRight, Activity, Loader2, X, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectList = () => {
    const auth = useRecoilValue(authAtom);
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [newProj, setNewProj] = useState({ name: '', slug: '', description: '' });

    const { data: projectsData, isLoading, refetch } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    });

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            setShowModal(false);
            setNewProj({ name: '', slug: '', description: '' });
        }
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate(newProj);
    };

    if (isLoading) return <div className="space-y-6">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-60 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
        </div>
    </div>;

    const projects = projectsData?.data?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and monitor project-specific bug tracking</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search projects..."
                            className="bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium w-full md:w-64"
                        />
                    </div>
                    {auth.user?.role === 'admin' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-lg shadow-primary-500/20 active:scale-95 shrink-0"
                        >
                            <PlusCircle size={18} />
                            <span>New Project</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Link key={project._id} to={`/bugs?projectId=${project._id}`} className="glass p-6 rounded-2xl border-b-4 border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all hover:-translate-y-1 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-primary-100 dark:bg-primary-950/40 text-primary-600 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                                <Folder size={24} />
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </div>

                        <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{project.description || 'No description provided.'}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-slate-500">
                                    <Users size={14} />
                                    <span className="text-xs font-bold">{project.members.length}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-slate-500">
                                    <Bug size={14} />
                                    <span className="text-xs font-bold">{project.bugCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                                <Activity size={12} />
                                <span className="text-[10px] font-black uppercase">Active</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md glass p-8 rounded-2xl animate-slide-up shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                            <X size={20} />
                        </button>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold">New Project</h2>
                            <p className="text-sm text-slate-500 mt-1">Configure your bug tracking workspace</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Project Name</label>
                                <input
                                    value={newProj.name} onChange={e => setNewProj({ ...newProj, name: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-secondary-900 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="BugTracker API" required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Project Slug</label>
                                <input
                                    value={newProj.slug} onChange={e => setNewProj({ ...newProj, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                    className="w-full bg-slate-100 dark:bg-secondary-900 border-none rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="bugtracker-api" required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Description</label>
                                <textarea
                                    value={newProj.description} onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-secondary-900 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[100px] resize-none" placeholder="Enter purpose..."
                                />
                            </div>

                            <button
                                disabled={createMutation.isLoading}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {createMutation.isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Launch Project'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectList;
