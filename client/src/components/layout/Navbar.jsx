import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { uiAtom } from '../../atoms/ui.atom';
import { authAtom } from '../../atoms/auth.atom';
import { Bell, Moon, Sun, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const Navbar = () => {
    const [ui, setUi] = useRecoilState(uiAtom);
    const [auth] = useRecoilState(authAtom);
    const { logout } = useAuth();
    const { unreadCount } = useNotifications();

    const toggleTheme = () => {
        const newTheme = ui.theme === 'light' ? 'dark' : 'light';
        setUi(prev => ({ ...prev, theme: newTheme }));
        localStorage.setItem('theme', newTheme);
    };

    const toggleSidebar = () => {
        setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
    };

    return (
        <nav className="sticky top-0 z-50 glass h-16 flex items-center px-4 md:px-8 justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-4">
                {auth.isAuthenticated && (
                    <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">B</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:block">BugSphere <span className="text-primary-500 text-sm">AI</span></span>
                </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {ui.theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                </button>

                {auth.isAuthenticated ? (
                    <>
                        {/* Notifications */}
                        <Link to="/settings" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile Dropdown Mockup */}
                        <div className="flex items-center space-x-3 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium">{auth.user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{auth.user?.role}</p>
                            </div>
                            <button onClick={logout} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary-500 transition-colors">Login</Link>
                        <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
