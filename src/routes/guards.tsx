import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';

export function RequireAuth() {
    const location = useLocation();

    if (!isAuthenticated()) {
        const redirectUrl = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/auth/phone?redirectTo=${redirectUrl}`} replace />;
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
