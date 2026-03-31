import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../atoms/auth.atom';
import { User, Mail, Shield, ShieldCheck, Briefcase, Calendar, Edit, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const auth = useRecoilValue(authAtom);
    const user = auth.user;

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-100 dark:bg-primary-950/20 text-primary-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900 overflow-hidden shrink-0">
                        <span className="text-4xl md:text-5xl font-black">{user.name.charAt(0)}</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-2">
                            <Briefcase size={16} />
                            <span className="capitalize">{user.role} Engineer</span>
                        </p>
                        <div className="flex items-center space-x-3 pt-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <p className="flex items-center space-x-1">
                                <Shield size={14} className="text-primary-500" />
                                <span>{user.twoFactorEnabled ? '2FA Active' : '2FA Disabled'}</span>
                            </p>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                            <p className="flex items-center space-x-1">
                                <Calendar size={14} className="text-primary-500" />
                                <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3 pb-2">
                    <button className="flex items-center space-x-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                        <Edit size={16} className="text-slate-500" />
                        <span>Edit Profile</span>
                    </button>
                    <Link to="/settings" className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                        <Settings size={16} />
                        <span>Security Settings</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Details Form-like view */}
                <div className="md:col-span-2 glass p-8 rounded-2xl space-y-8">
                    <div className="space-y-6">
                        <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
                            <User size={18} className="text-primary-500" />
                            <span>Personal Information</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-tighter ml-1">Full Name</p>
                                <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-800">{user.name}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-tighter ml-1">Email ID</p>
                                <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-800">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-tighter ml-1">Assigned Role</p>
                                <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-800 capitalize">{user.role}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-tighter ml-1">Last Login Date</p>
                                <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-800">1 hour ago</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center space-x-2">
                            <ShieldCheck size={14} className="text-primary-500" />
                            <span>Privileges Overview</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {['Full System Access', 'Project Creation', 'Bug Deletion', 'AI Chatbot', 'Priority Elevation', 'Member Management'].map((priv, idx) => (
                                <div key={idx} className="flex items-center space-x-2 p-3 bg-secondary-50 dark:bg-secondary-900/40 rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{priv}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full">
                        <ShieldCheck size={48} />
                    </div>
                    <h3 className="text-xl font-bold">Trusted Profile</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 px-4">Your account information is securely managed and encrypted using production-grade standards.</p>
                    <button className="text-sm font-bold text-primary-500 hover:underline pt-4">Learn about bug tracking privacy</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
