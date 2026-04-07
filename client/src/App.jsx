import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authAtom } from './atoms/auth.atom';
import { uiAtom } from './atoms/ui.atom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BugList from './pages/BugList';
import BugDetail from './pages/BugDetail';
import CreateBug from './pages/CreateBug';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import Analytics from './pages/Analytics';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleGuard from './components/layout/RoleGuard';

const App = () => {
    const [auth] = useRecoilState(authAtom);
    const [ui] = useRecoilState(uiAtom);

    // Apply Theme
    useEffect(() => {
        if (ui.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [ui.theme]);

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-secondary-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
            <Navbar />
            <div className="flex">
                {auth.isAuthenticated && <Sidebar />}
                <main className={`flex-1 transition-all duration-300 ${auth.isAuthenticated ? (ui.sidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0'}`}>
                    <div className="p-4 md:p-8">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={!auth.isAuthenticated ? <Login /> : <Navigate to="/" />} />
                            <Route path="/register" element={!auth.isAuthenticated ? <Register /> : <Navigate to="/" />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/bugs" element={<BugList />} />
                                <Route path="/bugs/:id" element={<BugDetail />} />

                                <Route path="/projects" element={<ProjectList />} />
                                <Route path="/projects/:id" element={<ProjectDetail />} />

                                <Route path="/profile" element={<UserProfile />} />
                                <Route path="/settings" element={<Settings />} />

                                {/* Role Specific Routes */}
                                <Route element={<RoleGuard roles={['admin', 'tester']} />}>
                                    <Route path="/bugs/new" element={<CreateBug />} />
                                </Route>

                                <Route element={<RoleGuard roles={['admin']} />}>
                                    <Route path="/analytics" element={<Analytics />} />
                                </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
