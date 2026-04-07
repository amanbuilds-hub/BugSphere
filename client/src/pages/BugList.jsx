import React, { useEffect, useState } from 'react';
import { useBugs } from '../hooks/useBugs';
import { useRecoilState, useRecoilValue } from 'recoil';
import { bugsAtom } from '../atoms/bugs.atom';
import { authAtom } from '../atoms/auth.atom';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, AlertCircle, ChevronLeft, ChevronRight, ListFilter, LayoutGrid, MoreVertical, ClipboardCheck, PlusCircle, Trash2, Copy, CheckCircle } from 'lucide-react';

const BugList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const auth = useRecoilValue(authAtom);
    const [bugsState, setBugsState] = useRecoilState(bugsAtom);
    const { bugList, loadingList, refetchBugs, deleteMutation, statusMutation } = useBugs();
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        const handleClick = () => setMenuOpen(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Sync state filter with URL
    useEffect(() => {
        const status = searchParams.get('status') || '';
        const priority = searchParams.get('priority') || '';
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;

        setBugsState(prev => ({
            ...prev,
            filters: { ...prev.filters, status, priority, search, page }
        }));
    }, [searchParams, setBugsState]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        if (key !== 'page') newParams.delete('page'); // Reset to page 1 on filter change
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > bugsState.pagination.pages) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage);
        setSearchParams(newParams);
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'in-progress': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        qa: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        closed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
        reopened: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    };

    const priorityColors = {
        urgent: 'text-red-500',
        high: 'text-orange-500',
        normal: 'text-blue-500',
        low: 'text-slate-400',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bug Explorer</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track, filter, and manage your issues</p>
                </div>
                <div className="flex items-center space-x-3">
                    {(auth.user?.role === 'tester' || auth.user?.role === 'admin') && (
                        <Link
                            to={`/bugs/new${searchParams.get('projectId') ? `?projectId=${searchParams.get('projectId')}` : ''}`}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-lg shadow-primary-500/20 active:scale-95 shrink-0"
                        >
                            <PlusCircle size={18} />
                            <span>Report Bug</span>
                        </Link>
                    )}
                    <button className="p-2.5 glass-card !rounded-xl text-slate-500 hover:text-primary-500 transition-colors">
                        <LayoutGrid size={20} />
                    </button>
                    <button className="p-2.5 glass-card !rounded-xl text-primary-500 transition-colors">
                        <ListFilter size={20} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                        placeholder="Search bug title or description..."
                        value={bugsState.filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={bugsState.filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium min-w-[120px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="qa">QA</option>
                        <option value="closed">Closed</option>
                        <option value="reopened">Reopened</option>
                    </select>
                    <select
                        value={bugsState.filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium min-w-[130px]"
                    >
                        <option value="">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Bug Table/List */}
            <div className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-secondary-900 transition-colors border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bug Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Project</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Priority</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reported</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 transition-colors">
                            {loadingList ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4 h-16 bg-slate-100/50 dark:bg-secondary-900/50"></td>
                                    </tr>
                                ))
                            ) : (
                                bugsState.list.map((bug) => (
                                    <tr key={bug._id} className="hover:bg-slate-50/80 dark:hover:bg-secondary-900/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link to={`/bugs/${bug._id}`} className="block max-w-[250px]">
                                                <p className="font-bold truncate text-slate-900 dark:text-slate-100 group-hover:text-primary-500 transition-colors">{bug.title}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">ID: {bug._id.substring(18)}</p>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{bug.projectId?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColors[bug.status]}`}>
                                                {bug.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${bug.priority === 'urgent' ? 'bg-red-500' : bug.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                <span className={`text-xs font-bold capitalize ${priorityColors[bug.priority]}`}>{bug.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center text-[10px] font-black">
                                                    {bug.assignedTo?.name ? bug.assignedTo.name.charAt(0) : '?'}
                                                </div>
                                                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{bug.assignedTo?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase">
                                            {new Date(bug.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center space-x-1">
                                                <Link to={`/bugs/${bug._id}`} title="View Details" className="p-2 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition-all text-slate-400 hover:text-primary-500">
                                                    <ClipboardCheck size={18} />
                                                </Link>

                                                {['admin', 'tester'].includes(auth.user?.role) && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this bug?')) {
                                                                deleteMutation.mutate(bug._id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isLoading}
                                                        title="Delete Bug"
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all text-slate-400 hover:text-red-500 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenuOpen(menuOpen === bug._id ? null : bug._id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-all ${menuOpen === bug._id ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600'}`}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {menuOpen === bug._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(`${window.location.origin}/bugs/${bug._id}`);
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full flex items-center space-x-2 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                <Copy size={14} />
                                                                <span>Copy Link</span>
                                                            </button>

                                                            {bug.status !== 'closed' && (
                                                                <button
                                                                    onClick={() => {
                                                                        statusMutation.mutate({ id: bug._id, data: { status: 'closed' } });
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center space-x-2 px-4 py-3 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors border-t border-slate-100 dark:border-slate-800"
                                                                >
                                                                    <CheckCircle size={14} />
                                                                    <span>Close Bug</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!loadingList && bugsState.list.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={32} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No bugs found matching your criteria</p>
                            <button onClick={() => setSearchParams({})} className="text-primary-600 dark:text-primary-400 text-sm font-black underline">Clear all filters</button>
                        </div>
                    )}
                </div>

                {/* Pagination bar */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-secondary-900/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-tighter">Page {bugsState.pagination.page} of {bugsState.pagination.pages} <span className="mx-2 text-slate-300">|</span> Total {bugsState.pagination.total} bugs</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(bugsState.pagination.page - 1)}
                            disabled={bugsState.pagination.page === 1}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => handlePageChange(bugsState.pagination.page + 1)}
                            disabled={bugsState.pagination.page === bugsState.pagination.pages}
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugList;
