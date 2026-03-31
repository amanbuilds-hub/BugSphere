import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBugs } from '../hooks/useBugs';
import { useAI } from '../hooks/useAI';
import { authAtom } from '../atoms/auth.atom';
import { useRecoilValue } from 'recoil';
import {
    Bot, Clock, AlertCircle, MessageSquare,
    Send, User, Calendar, CheckSquare,
    Sparkles, History, ChevronRight, FileText,
    UserCheck, Loader2, ArrowLeft
} from 'lucide-react';

const BugDetail = () => {
    const { id } = useParams();
    const auth = useRecoilValue(authAtom);
    const { bugDetail, loadingDetail, statusMutation, commentMutation } = useBugs(id);
    const { sendMessage, chatHistory, fetchResolutionSuggestion, loading: aiLoading } = useAI(id);

    const [newComment, setNewComment] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState(null);

    if (loadingDetail) return <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
    </div>;

    const bug = bugDetail?.data;
    if (!bug) return <div>Bug not found</div>;

    const handleStatusChange = (newStatus) => {
        statusMutation.mutate({ status: newStatus });
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        commentMutation.mutate({ text: newComment }, {
            onSuccess: () => setNewComment('')
        });
    };

    const handleChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        await sendMessage(chatMessage);
        setChatMessage('');
    };

    const getAiSuggestion = async () => {
        const res = await fetchResolutionSuggestion();
        setAiSuggestion(res);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Link to="/bugs" className="p-2 glass-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                            <span>{bug.projectId?.name}</span>
                            <ChevronRight size={14} />
                            <span>#{bug._id.substring(18)}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{bug.title}</h1>
                    </div>
                </div>
                <div className="flex items-center space-x-3 pt-2 md:pt-0">
                    <select
                        value={bug.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    >
                        <option value="open">Open</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="qa">QA</option>
                        <option value="closed">Closed</option>
                        <option value="reopened">Reopened</option>
                    </select>
                    {['admin', 'tester'].includes(auth.user?.role) && (
                        <button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shadow-lg shadow-primary-500/20 active:scale-95">
                            <UserCheck size={16} />
                            <span className="hidden sm:inline">Change Assignee</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details & AI */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Insights Card */}
                    <div className="glass p-6 rounded-2xl border-l-4 border-primary-500 bg-primary-50/20 dark:bg-primary-950/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                                <Sparkles size={20} />
                                <h3 className="font-bold">AI Assistant Insights</h3>
                            </div>
                            <button
                                onClick={getAiSuggestion}
                                className="text-xs font-bold text-primary-600 hover:underline flex items-center space-x-1"
                            >
                                <Bot size={14} />
                                <span>Regenerate Suggestion</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm">
                                <p className="font-semibold text-slate-500 mb-1">AI Summary:</p>
                                <p className="italic text-slate-700 dark:text-slate-300">"{bug.aiMetadata?.summary || 'Generating summary...'}"</p>
                            </div>

                            {aiSuggestion ? (
                                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-primary-200 dark:border-primary-900 animate-slide-up">
                                    <p className="text-sm font-bold mb-2">Suggested Resolution:</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{aiSuggestion.suggestion}</p>
                                </div>
                            ) : (
                                <button
                                    onClick={getAiSuggestion}
                                    className="w-full py-3 border-2 border-dashed border-primary-300 dark:border-primary-800 text-primary-500 text-sm font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                                >
                                    Click to generate AI resolution suggestion
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description & Steps */}
                    <div className="glass p-8 rounded-2xl space-y-6">
                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
                                <FileText size={18} className="text-slate-400" />
                                <span>Description</span>
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{bug.description}</p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
                                <CheckSquare size={18} className="text-slate-400" />
                                <span>Steps to Reproduce</span>
                            </h3>
                            <div className="p-4 bg-slate-100 dark:bg-secondary-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">{bug.stepsToReproduce || 'No steps provided.'}</p>
                            </div>
                        </section>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center space-x-2">
                            <MessageSquare size={20} className="text-slate-400" />
                            <span>Comments ({bug.comments.length})</span>
                        </h3>

                        <div className="space-y-4">
                            {bug.comments.map((comment, idx) => (
                                <div key={idx} className="flex space-x-4 animate-slide-up">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 glass p-4 rounded-2xl relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold">{comment.userId?.name} <span className="text-xs text-slate-500 font-normal ml-2">({comment.userId?.role})</span></span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                                    </div>
                                </div>
                            ))}

                            {/* New Comment Form */}
                            <form onSubmit={handleAddComment} className="flex space-x-4 pt-4">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-900">
                                    <span className="font-bold text-xs">{auth.user?.name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment... (@mention developers)"
                                        className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm outline-none focus:border-primary-500 transition-all min-h-[100px] resize-none"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        className="absolute bottom-3 right-3 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status & Timeline & AI Chat */}
                <div className="space-y-8">
                    {/* Metadata Card */}
                    <div className="glass p-6 rounded-2xl space-y-6 shadow-xl">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-2">Properties</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Reported By</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold">{bug.reportedBy?.name}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Assignee</span>
                                <span className="text-sm font-bold text-primary-500">{bug.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Created At</span>
                                <span className="text-sm font-medium">{new Date(bug.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Severity</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${bug.severity === 'critical' ? 'border-red-500 text-red-500' :
                                        bug.severity === 'high' ? 'border-orange-500 text-orange-500' : 'border-blue-500 text-blue-500'
                                    }`}>
                                    {bug.severity}
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center space-x-2">
                                <History size={14} />
                                <span>Activity Timeline</span>
                            </h4>
                            <div className="space-y-4">
                                {bug.statusHistory.slice(-3).map((hist, i) => (
                                    <div key={i} className="flex space-x-3 relative">
                                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 mt-1.5 shrink-0 z-10"></div>
                                        {i < 2 && <div className="absolute left-1 top-2 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 -ml-[0.25px]"></div>}
                                        <div className="text-xs">
                                            <p className="font-bold uppercase tracking-tight">{hist.from} → {hist.to}</p>
                                            <p className="text-slate-400 mt-0.5">{new Date(hist.changedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Chatbot Widget */}
                    <div className="glass rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px] border border-primary-500/20">
                        <div className="bg-primary-600 p-4 text-white flex items-center space-x-3">
                            <Bot size={20} />
                            <h3 className="font-bold text-sm">Engineer AI Copilot</h3>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-secondary-900/50">
                            <div className="flex space-x-2">
                                <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center shrink-0">
                                    <Sparkles size={12} />
                                </div>
                                <div className="bg-white dark:bg-secondary-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-[13px]">Hi! I'm your AI technical assistant. Ask me anything about this bug's context or history.</p>
                                </div>
                            </div>

                            {chatHistory.map((chat, idx) => (
                                <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] shadow-sm ${chat.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-secondary-800 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                        }`}>
                                        {chat.content}
                                    </div>
                                </div>
                            ))}
                            {aiLoading && <div className="flex items-center space-x-2 text-slate-400 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[11px]">Thinking...</span>
                            </div>}
                        </div>

                        <form onSubmit={handleChat} className="p-3 bg-white dark:bg-secondary-900 border-t border-slate-200 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    type="text"
                                    placeholder="Type a question..."
                                    className="w-full bg-slate-100 dark:bg-secondary-800 border-none rounded-xl py-2 pl-3 pr-10 text-xs outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500">
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugDetail;
