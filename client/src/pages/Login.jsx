import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needs2FA, setNeeds2FA] = useState(false);
    const [userIdFor2FA, setUserIdFor2FA] = useState('');
    const [otp, setOtp] = useState('');
    const { login, verify2FA } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const res = await login(data);
            if (res.twoFactorRequired) {
                setNeeds2FA(true);
                setUserIdFor2FA(res.userId);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verify2FA(otp, userIdFor2FA);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md glass p-8 rounded-2xl shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {needs2FA ? 'Two-Factor Authentication' : 'Welcome back'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {needs2FA
                            ? 'Enter the 6-digit code from your authenticator app'
                            : 'Sign in to access your dashboard'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center space-x-3 text-sm animate-slide-up border border-red-200 dark:border-red-800">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {!needs2FA ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 ml-1 mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold">Password</label>
                                <Link to="/" className="text-xs text-primary-500 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 ml-1 mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70 disabled:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign In</span>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handle2FASubmit} className="space-y-6">
                        <div className="space-y-2 text-center">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                className="w-full bg-white dark:bg-secondary-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl py-4 text-center text-3xl font-bold tracking-widest outline-none focus:border-primary-500 transition-all"
                                placeholder="000 000"
                            />
                            <p className="text-xs text-slate-500 mt-4 italic">Verification secure via Google Authenticator</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Verify Code</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => setNeeds2FA(false)}
                            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            Back to login
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-sm text-slate-500">
                    Not a member? <Link to="/register" className="text-primary-500 font-bold hover:underline">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
