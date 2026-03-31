import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../atoms/auth.atom';
import { getBugs } from '../api/bugs.api';
import { getProjects } from '../api/projects.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bug, Folder, Users, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const auth = useRecoilValue(authAtom);

    // Dashboard overall data
    const { data: bugsData, isLoading: loadingBugs } = useQuery({
        queryKey: ['dashboard-bugs'],
        queryFn: () => getBugs({ limit: 100 })
    });

    const { data: projectsData, isLoading: loadingProjects } = useQuery({
        queryKey: ['dashboard-projects'],
        queryFn: getProjects
    });

    if (loadingBugs || loadingProjects) {
        return <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
            </div>
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>;
    }

    const bugs = bugsData?.data || [];
    const projects = projectsData?.data || [];

    // Stats calculation
    const stats = [
        { label: 'Total Bugs', value: bugs.length, icon: <Bug size={24} />, color: 'bg-blue-500', link: '/bugs' },
        { label: 'Open Issues', value: bugs.filter(b => b.status === 'open').length, icon: <Clock size={24} />, color: 'bg-yellow-500', link: '/bugs?status=open' },
        { label: 'Active Projects', value: projects.length, icon: <Folder size={24} />, color: 'bg-purple-500', link: '/projects' },
        { label: 'Resolved', value: bugs.filter(b => b.status === 'closed').length, icon: <CheckCircle2 size={24} />, color: 'bg-emerald-500', link: '/bugs?status=closed' },
    ];

    // Chart Data
    const statusCounts = bugs.reduce((acc, bug) => {
        acc[bug.status] = (acc[bug.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(status => ({ name: status.toUpperCase(), value: statusCounts[status] }));
    const COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Status and performance tracking for {auth.user?.name}</p>
                </div>
                {['admin', 'tester'].includes(auth.user?.role) && (
                    <Link to="/bugs/new" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2">
                        <Bug size={18} />
                        <span>Report Bug</span>
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Link key={idx} to={stat.link} className="glass-card flex items-center justify-between hover:scale-[1.02] transition-transform group">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg`}>
                            {stat.icon}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Column */}
                <div className="lg:col-span-2 glass p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Bug Distribution</h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">LIVE</span>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Priority column */}
                <div className="glass p-8 rounded-2xl flex flex-col">
                    <h3 className="text-xl font-bold mb-6">Urgent Attention</h3>
                    <div className="space-y-4 flex-1">
                        {bugs.filter(b => b.priority === 'urgent' && b.status !== 'closed').slice(0, 5).map(bug => (
                            <Link key={bug._id} to={`/bugs/${bug._id}`} className="flex items-start space-x-4 p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg shrink-0">
                                    <AlertTriangle size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate group-hover:text-primary-500 transition-colors">{bug.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bug.projectId?.name}</p>
                                </div>
                                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-500" />
                            </Link>
                        ))}
                        {bugs.filter(b => b.priority === 'urgent' && b.status !== 'closed').length === 0 && (
                            <div className="text-center py-10">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full inline-block mb-3">
                                    <CheckCircle2 size={32} />
                                </div>
                                <p className="text-sm text-slate-500">No urgent bugs found. Great job!</p>
                            </div>
                        )}
                    </div>
                    <Link to="/bugs" className="mt-6 text-center text-sm font-bold text-primary-500 hover:underline">View All Bugs</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
