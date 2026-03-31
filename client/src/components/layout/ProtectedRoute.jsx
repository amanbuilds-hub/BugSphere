import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../atoms/auth.atom';

/**
 * Component to protect routes requiring authentication
 */
const ProtectedRoute = () => {
    const auth = useRecoilValue(authAtom);

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
