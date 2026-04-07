import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, addMember, removeMember, deleteProject } from '../api/projects.api';
import { getUsers } from '../api/auth.api';
import { authAtom } from '../atoms/auth.atom';
import { useRecoilValue } from 'recoil';
import {
    Users, Bug, ChevronLeft, Search, Plus, Trash2,
    Shield, Briefcase, User as UserIcon, Loader2, AlertTriangle
} from 'lucide-react';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const auth = useRecoilValue(authAtom);
    const queryClient = useQueryClient();
    const [userSearch, setUserSearch] = useState('');

    const deleteProjectMutation = useMutation({
        mutationFn: () => deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            navigate('/projects');
        }
    });

    const handleDeleteProject = () => {
        if (window.confirm('Are you sure you want to delete this project and all its associated bugs? This action cannot be undone.')) {
            deleteProjectMutation.mutate();
        }
    };

    const { data: projectData, isLoading: projectLoading } = useQuery({
        queryKey: ['projects', id],
        queryFn: () => getProject(id)
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users', userSearch],
        queryFn: () => getUsers(userSearch),
        enabled: auth.user?.role === 'admin' && userSearch.length > 2
    });

    const addMemberMutation = useMutation({
        mutationFn: (userId) => addMember(id, { userId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['projects', id]);
            setUserSearch('');
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId) => removeMember(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['projects', id]);
        }
    });

    if (projectLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
    );

    const project = projectData?.data?.project;
    const stats = projectData?.data?.stats || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <Link to="/projects" className="inline-flex items-center text-slate-500 hover:text-primary-500 transition-colors font-bold text-xs uppercase tracking-widest">
                <ChevronLeft size={16} className="mr-1" />
                Back to Projects
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4 max-w-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                        {project.description || 'No description provided for this project.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-950/40 text-primary-600 rounded-lg text-xs font-black uppercase">
                            SLUG: {project.slug}
                        </span>
                        <Link to={`/bugs?projectId=${project._id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase flex items-center">
                            <Bug size={14} className="mr-1.5" />
                            View Bugs
                        </Link>
                        {(auth.user?.role === 'tester' || auth.user?.role === 'admin') && (
                            <Link to={`/bugs/new?projectId=${project._id}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase flex items-center border border-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                <Plus size={14} className="mr-1.5" />
                                Report Bug
                            </Link>
                        )}
                        {auth.user?.role === 'admin' && (
                            <button
                                onClick={handleDeleteProject}
                                disabled={deleteProjectMutation.isLoading}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase flex items-center border border-red-500 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {deleteProjectMutation.isLoading ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <Trash2 size={14} className="mr-1.5" />}
                                Delete Project
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="glass p-5 rounded-2xl text-center min-w-[140px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bugs</p>
                        <p className="text-3xl font-black text-primary-500">{project.bugCount}</p>
                    </div>
                    <div className="glass p-5 rounded-2xl text-center min-w-[140px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Size</p>
                        <p className="text-3xl font-black text-emerald-500">{project.members.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Members List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center">
                            <Users size={20} className="mr-2 text-primary-500" />
                            Project Team
                        </h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-secondary-900 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">System Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Project Role</th>
                                    {auth.user?.role === 'admin' && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {project.members.map((member) => (
                                    <tr key={member.userId._id} className="hover:bg-slate-50/50 dark:hover:bg-secondary-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <UserIcon size={18} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.userId.name}</p>
                                                    <p className="text-[10px] text-slate-500 lowercase">{member.userId.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold">
                                            <span className={`px-2 py-1 rounded-md ${member.userId.role === 'admin' ? 'bg-red-50 text-red-600' :
                                                member.userId.role === 'tester' ? 'bg-purple-50 text-purple-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                {member.userId.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-xs font-bold text-slate-500 uppercase">
                                                <Shield size={12} className="mr-1.5" />
                                                {member.role}
                                            </div>
                                        </td>
                                        {auth.user?.role === 'admin' && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => removeMemberMutation.mutate(member.userId._id)}
                                                    disabled={removeMemberMutation.isLoading}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Member (Admin Only) */}
                {auth.user?.role === 'admin' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <Plus size={24} className="mr-2 text-primary-500" />
                            Add Member
                        </h2>

                        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {usersLoading && <p className="text-center py-4 text-xs font-bold text-slate-400 animate-pulse">Searching users...</p>}

                                {!usersLoading && userSearch.length > 2 && usersData?.data?.length === 0 && (
                                    <p className="text-center py-4 text-xs font-bold text-slate-400">No users found</p>
                                )}

                                {usersData?.data?.map(user => {
                                    const isAlreadyMember = project.members.some(m => m.userId._id === user._id);
                                    return (
                                        <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center text-[10px] font-black uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{user.name}</p>
                                                    <p className="text-[10px] text-slate-500">{user.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                disabled={isAlreadyMember || addMemberMutation.isLoading}
                                                onClick={() => addMemberMutation.mutate(user._id)}
                                                className={`p-1.5 rounded-lg transition-colors ${isAlreadyMember
                                                    ? 'text-emerald-500 bg-emerald-50 cursor-default'
                                                    : 'text-primary-500 hover:bg-primary-50 text-xs font-black uppercase'
                                                    }`}
                                            >
                                                {isAlreadyMember ? 'Added' : <Plus size={18} />}
                                            </button>
                                        </div>
                                    );
                                })}

                                {userSearch.length <= 2 && (
                                    <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Type at least 3 letters <br /> to search developers
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
