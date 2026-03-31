import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { setup2FA as apiSetup2FA } from '../api/auth.api';
import { Shield, Bell, Lock, User, CheckCircle2, AlertTriangle, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Settings = () => {
    const { auth, verify2FA } = useAuth();
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState(null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSetup2FA = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiSetup2FA();
            setSetupData(res.data);
        } catch (err) {
            setError('Failed to setup 2FA. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verify2FA(token);
            setSuccess(true);
            setSetupData(null);
        } catch (err) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage security, notifications, and your account</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation (Tabs) */}
                <div className="space-y-1">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold rounded-xl text-sm transition-all">
                        <Shield size={18} />
                        <span>Security & 2FA</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm transition-all group font-medium">
                        <Bell size={18} className="group-hover:text-primary-500" />
                        <span>Notifications</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-sm transition-all group font-medium">
                        <User size={18} className="group-hover:text-primary-500" />
                        <span>General Info</span>
                    </button>
                </div>

                {/* Settings Content Area */}
                <div className="md:col-span-2 space-y-8">

                    {/* 2FA Security Section */}
                    <div className="glass p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
                                <p className="text-sm text-slate-500">Protect your account with an extra security layer</p>
                            </div>
                            {auth.user?.twoFactorEnabled ? (
                                <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">
                                    <CheckCircle2 size={14} />
                                    <span>Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                                    <AlertTriangle size={14} />
                                    <span>Disabled</span>
                                </div>
                            )}
                        </div>

                        {!auth.user?.twoFactorEnabled && !setupData && (
                            <div className="p-4 bg-slate-50 dark:bg-secondary-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start space-x-4">
                                <Lock className="text-slate-400 mt-1 shrink-0" size={24} />
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium leading-relaxed">By enabling two-factor authentication, you will be required to enter a code from your Google Authenticator or Authy app on each login.</p>
                                    <button
                                        onClick={handleSetup2FA}
                                        disabled={loading}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enable 2FA Now'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {setupData && !success && (
                            <div className="space-y-6 p-6 bg-primary-50/30 dark:bg-primary-950/20 rounded-2xl border border-primary-200 dark:border-primary-900 animate-slide-up">
                                <div className="flex flex-col items-center">
                                    <div className="p-4 bg-white rounded-2xl shadow-xl mb-4">
                                        <QRCodeSVG value={setupData.qrDataUrl} size={180} />
                                    </div>
                                    <p className="text-xs font-black uppercase text-slate-400 tracking-tighter mb-4">Scan using your authenticator app</p>
                                </div>

                                <form onSubmit={handleVerifyEnable} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Enter Verification Code</label>
                                        <input
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            className="w-full bg-white dark:bg-secondary-900 border-2 border-primary-100 dark:border-primary-900 rounded-xl py-3 px-4 text-center text-xl font-black tracking-widest outline-none focus:border-primary-500 transition-all placeholder:text-slate-200"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    {error && <p className="text-xs text-red-500 font-bold text-center italic">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading || token.length < 6}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Confirm and Enable'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {success && (
                            <div className="p-10 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 animate-fade-in shadow-xl shadow-emerald-500/10">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40">
                                    <CheckCircle2 className="text-white w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">SUCCESS</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your account is now secured with Two-Factor Authentication.</p>
                            </div>
                        )}
                    </div>

                    {/* Notification Prefs Section */}
                    <div className="glass p-8 rounded-2xl space-y-6">
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
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-secondary-900 rounded-xl hover:scale-[1.01] transition-transform cursor-pointer group">
                                    <div>
                                        <p className="text-sm font-bold truncate group-hover:text-primary-500 transition-colors">{item.title}</p>
                                        <p className="text-[11px] text-slate-500 font-medium truncate">{item.desc}</p>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={item.id !== 'digest'} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
