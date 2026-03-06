import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';

export function RequireAuth() {
    if (!isAuthenticated()) {
        return <Navigate to="/auth/phone" replace />;
    }
    return <Outlet />;
}

export function RequireRole() {
    const role = getUserRole();
    if (!role || role === 'null') {
        return <Navigate to="/role/select" replace />;
    }
    return <Outlet />;
}

export function RedirectIfAuthenticated() {
    if (isAuthenticated()) {
        const role = getUserRole();
        if (!role || role === 'null') {
            return <Navigate to="/role/select" replace />;
        }
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}
