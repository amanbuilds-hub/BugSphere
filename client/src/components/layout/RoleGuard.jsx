import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../atoms/auth.atom';

/**
 * Component to protect routes based on role
 * @param {string[]} roles - Allowed roles [admin, tester, developer]
 */
const RoleGuard = ({ roles }) => {
    const auth = useRecoilValue(authAtom);

    if (!auth.user || !roles.includes(auth.user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
