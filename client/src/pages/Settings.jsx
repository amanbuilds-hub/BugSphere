import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api/auth.api';
import { Bell, User, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { authAtom } from '../atoms/auth.atom';

const Settings = () => {
    const [auth, setAuth] = useRecoilState(authAtom);
    const [activeTab, setActiveTab] = useState('notifications');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        skills: auth.user?.skills?.join(', ') || '',
        about: auth.user?.about || '',
        notificationPrefs: auth.user?.notificationPrefs || { email: true, push: true, digest: false }
    });

    useEffect(() => {
        if (auth.user) {
            setProfile({
                name: auth.user.name,
                email: auth.user.email,
                skills: auth.user.skills?.join(', ') || '',
                about: auth.user.about || '',
                notificationPrefs: auth.user.notificationPrefs || { email: true, push: true, digest: false }
            });
        }
    }, [auth.user]);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Clean skills array
            const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(s => s !== '');
            const res = await updateProfile({ ...profile, skills: skillsArray });
            setAuth(prev => ({ ...prev, user: { ...prev.user, ...res.data } }));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNotification = (id) => {
        setProfile(prev => ({
            ...prev,
            notificationPrefs: {
                ...prev.notificationPrefs,
                [id]: !prev.notificationPrefs[id]
            }
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage notifications and your account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-1">
                    {[
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'general', label: 'General Info', icon: User },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all font-bold ${activeTab === tab.id
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 group'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? '' : 'group-hover:text-primary-500'} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Settings Content Area */}
                <div className="md:col-span-2 space-y-8">

                    {activeTab === 'notifications' && (
                        <div className="glass p-8 rounded-2xl space-y-6 animate-slide-up">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">Notification Preferences</h3>
                                <p className="text-sm text-slate-500">How you'd like to stay informed about bug updates</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { id: 'email', title: 'Email Notifications', desc: 'Receive real-time alerts for project events' },
                                    { id: 'push', title: 'Browser Push', desc: 'Desktop alerts when you are logged in' },
                                    { id: 'digest', title: 'Daily Digest', desc: 'A summary of activity across projects' },
                                ].map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleToggleNotification(item.id)}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-secondary-900 rounded-xl hover:scale-[1.01] transition-transform cursor-pointer group"
                                    >
                                        <div>
                                            <p className="text-sm font-bold truncate group-hover:text-primary-500 transition-colors">{item.title}</p>
                                            <p className="text-[11px] text-slate-500 font-medium truncate">{item.desc}</p>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <div className={`w-11 h-6 rounded-full transition-all flex items-center px-1 ${profile.notificationPrefs[item.id] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${profile.notificationPrefs[item.id] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {success && activeTab === 'notifications' && (
                                <div className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-fade-in flex items-center justify-center space-x-2">
                                    <CheckCircle2 size={16} />
                                    <span>Notification settings saved!</span>
                                </div>
                            )}
                            <button
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <> <Save size={18} /> <span>Save Preferences</span> </>}
                            </button>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="glass p-8 rounded-2xl space-y-6 animate-slide-up">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">General Information</h3>
                                <p className="text-sm text-slate-500">Update your public profile details</p>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-primary-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            value={profile.skills}
                                            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                                            placeholder="React, Node.js, MongoDB..."
                                            className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-primary-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">About Yourself / Experience</label>
                                        <textarea
                                            value={profile.about}
                                            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                            rows={4}
                                            placeholder="I am a frontend developer with 3 years of experience..."
                                            className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-primary-500 transition-all font-medium resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2 opacity-50">
                                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Email Address (Cannot change)</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full bg-slate-100 dark:bg-secondary-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none"
                                        />
                                    </div>
                                </div>
                                {success && activeTab === 'general' && (
                                    <div className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-fade-in flex items-center justify-center space-x-2">
                                        <CheckCircle2 size={16} />
                                        <span>Profile updated successfully!</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <> <Save size={18} /> <span>Update Profile</span> </>}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
