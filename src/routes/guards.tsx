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

export function RequireAdmin() {
    if (!isAuthenticated()) {
        return <Navigate to="/admin/login" replace />;
    }
    const role = getUserRole();
    if (role !== 'Super Admin' && role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
}

export function RedirectIfAdminAuthenticated() {
    if (isAuthenticated()) {
        const role = getUserRole();
        if (role === 'Super Admin' || role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
    }
    return <Outlet />;
}
