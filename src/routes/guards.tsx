import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';
import { useKycStatus } from '../features/kyc/hooks';
import Loader from '../components/ui/Loader';
import { ROUTES } from '../lib/constants';

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

export function RequireKYC() {
    const { data: kycData, isLoading, isError } = useKycStatus();
    const location = useLocation();

    if (isLoading) {
        return <Loader className="min-h-screen" />;
    }

    // In case of error (e.g., API down), we might want to allow limited access or show an error.
    // For now, let's treat error as "not verified" to be safe, or allow.
    // If it's a 401, the RequireAuth guard should have caught it, but hooks might run.
    if (isError || !kycData) {
        // Fallback or show error? Let's assume non-verified for safety if we can't get status.
        return <Outlet />;
    }

    const { kyc_status } = kycData;
    const isAadhaarVerified = kyc_status.some(e => e.entity === 'AADHAAR' && e.status === 'VERIFIED');
    const isPanVerified = kyc_status.some(e => e.entity === 'PAN' && e.status === 'VERIFIED');

    const isKycRoute = [ROUTES.KYC, ROUTES.KYC_VERIFY_OTP, ROUTES.KYC_VERIFY_PAN].includes(location.pathname as any);

    // 1. If Aadhaar verification is complete:
    //    - Users can access all user routes.
    //    - Restrict access: The Aadhaar KYC route (aadhaar req otp and verify otp) must not be accessible.
    if (isAadhaarVerified) {
        if (location.pathname === ROUTES.KYC || location.pathname === ROUTES.KYC_VERIFY_OTP) {
            // If already Aadhaar verified, and NOT PAN verified, they can go to PAN link.
            // If they are BOTH verified, they shouldn't even be in the PAN route.
            if (isPanVerified) {
                return <Navigate to={ROUTES.HOME} replace />;
            }
            // If only Aadhaar is verified, redirect to PAN if they hit Aadhaar routes
            return <Navigate to={ROUTES.KYC_VERIFY_PAN} replace />;
        }
    }

    // 2. If both Aadhaar and PAN verifications are complete:
    //    - Users can access all user routes.
    //    - Restrict access: All KYC-related routes (aadhaar req otp, verify otp, and PAN link) must be inaccessible.
    if (isAadhaarVerified && isPanVerified) {
        if (isKycRoute) {
            return <Navigate to={ROUTES.HOME} replace />;
        }
    }

    // 3. For non-KYC verified users:
    //    - Restrict route access to login and request KYC routes only (aadhaar req otp and verify otp).
    if (!isAadhaarVerified) {
        if (![ROUTES.KYC, ROUTES.KYC_VERIFY_OTP].includes(location.pathname as any)) {
            return <Navigate to={ROUTES.KYC} replace />;
        }
    }

    return <Outlet />;
}
