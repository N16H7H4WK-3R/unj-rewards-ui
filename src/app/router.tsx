import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import AdminLayout from '../layouts/AdminLayout';
import { RequireAuth, RequireRole, RedirectIfAuthenticated, RequireAdmin, RedirectIfAdminAuthenticated } from '../routes/guards';
import Loader from '../components/ui/Loader';
import { ROUTES } from '../lib/constants';

// Lazy-loaded pages
const PhonePage = lazy(() => import('../pages/auth/PhonePage'));
const OtpPage = lazy(() => import('../pages/auth/OtpPage'));
const RoleSelectPage = lazy(() => import('../pages/role/RoleSelectPage'));
const HomePage = lazy(() => import('../pages/home/HomePage'));
const WalletPage = lazy(() => import('../pages/wallet/WalletPage'));
const TransactionHistoryPage = lazy(() => import('../pages/wallet/TransactionHistoryPage'));
const ScanPage = lazy(() => import('../pages/qr/ScanPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminBulkQrPage = lazy(() => import('../pages/admin/AdminBulkQrPage'));
const AdminQrCodesPage = lazy(() => import('../pages/admin/AdminQrCodesPage'));
const OfflinePage = lazy(() => import('../pages/OfflinePage'));

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<Loader className="min-h-screen" />}>
        {children}
    </Suspense>
);

const router = createBrowserRouter([
    // Public routes
    {
        element: <RedirectIfAuthenticated />,
        children: [
            {
                path: ROUTES.AUTH_PHONE,
                element: <SuspenseWrap><PhonePage /></SuspenseWrap>,
            },
            {
                path: ROUTES.AUTH_OTP,
                element: <SuspenseWrap><OtpPage /></SuspenseWrap>,
            },
        ],
    },

    // Admin Login
    {
        element: <RedirectIfAdminAuthenticated />,
        children: [
            {
                path: ROUTES.ADMIN_LOGIN,
                element: <SuspenseWrap><AdminLoginPage /></SuspenseWrap>,
            },
        ],
    },

    // Role select (auth required, but before role guard)
    {
        element: <RequireAuth />,
        children: [
            {
                path: ROUTES.ROLE_SELECT,
                element: <SuspenseWrap><RoleSelectPage /></SuspenseWrap>,
            },
        ],
    },

    // Protected routes with AppShell
    {
        element: <RequireAuth />,
        children: [
            {
                element: <RequireRole />,
                children: [
                    {
                        element: <AppShell />,
                        children: [
                            {
                                path: ROUTES.HOME,
                                element: <SuspenseWrap><HomePage /></SuspenseWrap>,
                            },
                            {
                                path: ROUTES.WALLET,
                                element: <SuspenseWrap><WalletPage /></SuspenseWrap>,
                            },
                            {
                                path: ROUTES.TRANSACTIONS,
                                element: <SuspenseWrap><TransactionHistoryPage /></SuspenseWrap>,
                            },
                            {
                                path: ROUTES.SCAN_QR,
                                element: <SuspenseWrap><ScanPage /></SuspenseWrap>,
                            },
                            {
                                path: ROUTES.PROFILE,
                                element: <SuspenseWrap><ProfilePage /></SuspenseWrap>,
                            },
                        ],
                    },
                ],
            },
        ],
    },

    // Admin protected routes
    {
        element: <RequireAdmin />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {
                        path: ROUTES.ADMIN_DASHBOARD,
                        element: <Navigate to={ROUTES.ADMIN_BULK_QR} replace />,
                    },
                    {
                        path: ROUTES.ADMIN_BULK_QR,
                        element: <SuspenseWrap><AdminBulkQrPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_QR_CODES,
                        element: <SuspenseWrap><AdminQrCodesPage /></SuspenseWrap>,
                    },
                ],
            },
        ],
    },

    // Offline
    {
        path: ROUTES.OFFLINE,
        element: <SuspenseWrap><OfflinePage /></SuspenseWrap>,
    },

    // Catch-all
    {
        path: '*',
        element: <Navigate to={ROUTES.HOME} replace />,
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
