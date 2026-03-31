import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { uiAtom } from '../../atoms/ui.atom';
import { authAtom } from '../../atoms/auth.atom';
import { LayoutDashboard, Bug, FolderClosed, BarChart2, User, Settings, Shield } from 'lucide-react';

const Sidebar = () => {
    const [ui] = useRecoilState(uiAtom);
    const [auth] = useRecoilState(authAtom);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Bugs', icon: <Bug size={20} />, path: '/bugs' },
        { name: 'Projects', icon: <FolderClosed size={20} />, path: '/projects' },
        { name: 'Analytics', icon: <BarChart2 size={20} />, path: '/analytics', roles: ['admin'] },
        { name: 'Profile', icon: <User size={20} />, path: '/profile' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(auth.user?.role));

    return (
        <aside className={`fixed h-[calc(100vh-4rem)] top-16 left-0 bg-white dark:bg-secondary-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-40 overflow-hidden ${ui.sidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex flex-col h-full py-4 space-y-2">
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center mx-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group group ${isActive
                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                    >
                        <span className="shrink-0">{item.icon}</span>
                        <span className={`ml-3 text-sm font-medium transition-all duration-300 ${!ui.sidebarOpen ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                            {item.name}
                        </span>
                        {!ui.sidebarOpen && (
                            <div className="absolute left-16 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 z-50">
                                {item.name}
                            </div>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Sidebar Footer Role Badge */}
            {ui.sidebarOpen && auth.user && (
                <div className="absolute bottom-4 left-0 right-0 px-6">
                    <div className="p-3 glass-card flex items-center space-x-3 bg-primary-50/50 dark:bg-primary-950/20">
                        <Shield size={16} className="text-primary-500" />
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{auth.user.role}</span>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
