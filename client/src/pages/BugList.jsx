import React, { useEffect } from 'react';
import { useBugs } from '../hooks/useBugs';
import { useRecoilState } from 'recoil';
import { bugsAtom } from '../atoms/bugs.atom';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, AlertCircle, ChevronLeft, ChevronRight, ListFilter, LayoutGrid, MoreVertical, ClipboardCheck } from 'lucide-react';

const BugList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [bugsState, setBugsState] = useRecoilState(bugsAtom);
    const { bugList, loadingList, refetchBugs } = useBugs();

    // Sync state filter with URL
    useEffect(() => {
        const status = searchParams.get('status') || '';
        const priority = searchParams.get('priority') || '';
        const search = searchParams.get('search') || '';

        setBugsState(prev => ({
            ...prev,
            filters: { ...prev.filters, status, priority, search }
        }));
    }, [searchParams, setBugsState]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'in-progress': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        qa: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        closed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
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
                            <tr className="bg-slate-50 dark:bg-secondary-900 transition-colors">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bug Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
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
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{bug._id.substring(18)}</p>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium">{bug.projectId?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[bug.status]}`}>
                                                {bug.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${bug.priority === 'urgent' ? 'bg-red-500' : bug.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                <span className={`text-sm font-bold capitalize ${priorityColors[bug.priority]}`}>{bug.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center text-xs font-bold">
                                                    {bug.assignedTo?.name ? bug.assignedTo.name.charAt(0) : '?'}
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{bug.assignedTo?.name || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {new Date(bug.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/bugs/${bug._id}`} className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                <MoreVertical size={18} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination bar */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-secondary-900/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 font-medium">Showing {(bugsState.pagination.page - 1) * 20 + 1} to {Math.min(bugsState.pagination.page * 20, bugsState.pagination.total)} of {bugsState.pagination.total} bugs</p>
                    <div className="flex space-x-2">
                        <button disabled={bugsState.pagination.page === 1} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm">
                            <ChevronLeft size={18} />
                        </button>
                        <button disabled={bugsState.pagination.page === bugsState.pagination.pages} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugList;
