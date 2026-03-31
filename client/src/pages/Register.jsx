import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'tester', 'developer'])
});

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register: authRegister } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'developer' }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            await authRegister(data);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-lg glass p-8 rounded-2xl shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                        <UserPlus className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Join BugSphere to start tracking and fixing bugs</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center space-x-3 text-sm animate-slide-up border border-red-200 dark:border-red-800">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    {...register('name')}
                                    className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Account Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    {...register('role')}
                                    className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none"
                                >
                                    <option value="developer">Developer</option>
                                    <option value="tester">Tester</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                {...register('email')}
                                type="email"
                                className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                                placeholder="name@company.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                {...register('password')}
                                type="password"
                                className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all`}
                                placeholder="Minimum 6 characters"
                            />
                        </div>
                        {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Create Account</span>}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-primary-500 font-bold hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
