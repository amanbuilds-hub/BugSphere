import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBugs } from '../api/bugs.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Bug, CheckCircle2, Clock, AlertTriangle, Search, Filter, Download } from 'lucide-react';

const Analytics = () => {
    const { data: bugsData, isLoading } = useQuery({
        queryKey: ['analytics-bugs'],
        queryFn: () => getBugs({ limit: 500 })
    });

    if (isLoading) return <div className="animate-pulse space-y-8">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
    </div>;

    const bugs = bugsData?.data || [];

    // Group by severity
    const severityData = [
        { name: 'Critical', value: bugs.filter(b => b.severity === 'critical').length, fill: '#ef4444' },
        { name: 'High', value: bugs.filter(b => b.severity === 'high').length, fill: '#f97316' },
        { name: 'Medium', value: bugs.filter(b => b.severity === 'medium').length, fill: '#0ea5e9' },
        { name: 'Low', value: bugs.filter(b => b.severity === 'low').length, fill: '#64748b' },
    ];

    // Group by priority
    const priorityData = [
        { name: 'Urgent', value: bugs.filter(b => b.priority === 'urgent').length, fill: '#ef4444' },
        { name: 'High', value: bugs.filter(b => b.priority === 'high').length, fill: '#f97316' },
        { name: 'Normal', value: bugs.filter(b => b.priority === 'normal').length, fill: '#3b82f6' },
        { name: 'Low', value: bugs.filter(b => b.priority === 'low').length, fill: '#94a3b8' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organization Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Cross-project bug trends and efficiency metrics</p>
                </div>
                <button className="flex items-center space-x-2 bg-white dark:bg-secondary-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                    <Download size={18} />
                    <span>Export Detailed Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Severity Distribution */}
                <div className="glass p-8 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-8">
                        <AlertTriangle className="text-primary-500" size={20} />
                        <h3 className="text-xl font-bold">Severity Breakdown</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={severityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="glass p-8 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-8">
                        <TrendingUp className="text-primary-500" size={20} />
                        <h3 className="text-xl font-bold">Priority Trends</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">Recent Status Flow</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-4 text-xs font-black uppercase text-slate-400">Project</th>
                                <th className="pb-4 text-xs font-black uppercase text-slate-400">Total Bugs</th>
                                <th className="pb-4 text-xs font-black uppercase text-slate-400 text-center">Open</th>
                                <th className="pb-4 text-xs font-black uppercase text-slate-400 text-center">Resolved</th>
                                <th className="pb-4 text-xs font-black uppercase text-slate-400 text-right">Health</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {bugs.reduce((acc, b) => {
                                const pName = b.projectId?.name || 'Unknown';
                                if (!acc[pName]) acc[pName] = { total: 0, open: 0, closed: 0 };
                                acc[pName].total++;
                                if (b.status === 'open') acc[pName].open++;
                                if (b.status === 'closed') acc[pName].closed++;
                                return acc;
                            }, [] && {})}
                            {/* This is a bit simplified for demonstration */}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <td colSpan={5} className="py-4 text-sm text-slate-400 italic text-center">Project specific breakdown coming soon in next v1.1 update...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
