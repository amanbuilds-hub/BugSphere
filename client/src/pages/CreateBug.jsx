import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBugs } from '../hooks/useBugs';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects.api';
import { Bug, Send, X, Plus, AlertCircle, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const createBugSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    projectId: z.string().min(1, 'Please select a project'),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    priority: z.enum(['urgent', 'high', 'normal', 'low']),
    stepsToReproduce: z.string().optional(),
    expectedBehavior: z.string().optional(),
    actualBehavior: z.string().optional(),
});

const CreateBug = () => {
    const [searchParams] = useSearchParams();
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    const navigate = useNavigate();
    const { createMutation } = useBugs();
    const { data: projectsData } = useQuery(['projects'], getProjects);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(createBugSchema),
        defaultValues: {
            projectId: searchParams.get('projectId') || '',
            severity: 'medium',
            priority: 'normal'
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await createMutation.mutateAsync({ ...data, tags });
            if (res.message.includes('duplicate')) {
                setDuplicateWarning(res.message);
            } else {
                navigate(`/bugs/${res.data._id}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addTag = (e) => {
        e.preventDefault();
        if (tagInput && !tags.includes(tagInput)) {
            setTags([...tags, tagInput]);
            setTagInput('');
        }
    };

    const removeTag = (t) => {
        setTags(tags.filter(tag => tag !== t));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Bug className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Report New Bug</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">AI-assisted bug reporting and classification</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-2xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Bug Title</label>
                            <input
                                {...register('title')}
                                className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium`}
                                placeholder="Brief summary of the issue..."
                            />
                            {errors.title && <p className="text-xs text-red-500 ml-1">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Detailed Description</label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className={`w-full bg-slate-50 dark:bg-secondary-900 border ${errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm resize-none`}
                                placeholder="What happened and what were you doing?"
                            />
                            {errors.description && <p className="text-xs text-red-500 ml-1">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Expected Behavior</label>
                                <textarea
                                    {...register('expectedBehavior')}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-xs resize-none"
                                    placeholder="Describe how it SHOULD work"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1">Actual Behavior</label>
                                <textarea
                                    {...register('actualBehavior')}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-xs resize-none"
                                    placeholder="Describe what ACTUALLY happened"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Steps to Reproduce</label>
                            <textarea
                                {...register('stepsToReproduce')}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-mono"
                                placeholder="1. Navigate to...\n2. Click...\n3. Observe..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar settings */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Target Project</label>
                                <select
                                    {...register('projectId')}
                                    className="w-full bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 font-bold"
                                >
                                    <option value="">Select Project</option>
                                    {projectsData?.data?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                {errors.projectId && <p className="text-[10px] text-red-500 font-bold">{errors.projectId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Severity</label>
                                <select
                                    {...register('severity')}
                                    className="w-full bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 font-bold"
                                >
                                    <option value="critical">Critical (Crash)</option>
                                    <option value="high">High (Major issues)</option>
                                    <option value="medium">Medium (Annoying)</option>
                                    <option value="low">Low (Cosmetic)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400">Initial Priority</label>
                                <select
                                    {...register('priority')}
                                    className="w-full bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 font-bold"
                                >
                                    <option value="urgent">Urgent (Immediate)</option>
                                    <option value="high">High (Next Sprint)</option>
                                    <option value="normal">Normal (Routine)</option>
                                    <option value="low">Low (Backlog)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                            <label className="text-xs font-black uppercase text-slate-400">Labels / Tags</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map(t => (
                                    <span key={t} className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-lg text-xs flex items-center space-x-1 font-bold">
                                        <span>{t}</span>
                                        <button onClick={() => removeTag(t)} type="button"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                                    className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-3 pr-8 text-xs outline-none focus:border-primary-500"
                                    placeholder="Add tag..."
                                />
                                <button type="button" onClick={addTag} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-600/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <Sparkles size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">AI Assistance</span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">By submitting this bug, our AI will automatically classify the severity and generate a technical summary for developers across the world.</p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-primary-600 font-black py-4 rounded-xl mt-6 transition-all hover:bg-slate-50 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> <span>Submit Report</span></>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateBug;
