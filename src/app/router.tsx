import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import { RequireAuth, RequireRole, RedirectIfAuthenticated } from '../routes/guards';
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
const AdminQrCreatePage = lazy(() => import('../pages/admin/AdminQrCreatePage'));
const AdminQrListPage = lazy(() => import('../pages/admin/AdminQrListPage'));
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
                            // Admin routes (hidden unless admin)
                            {
                                path: ROUTES.ADMIN_QR_CREATE,
                                element: <SuspenseWrap><AdminQrCreatePage /></SuspenseWrap>,
                            },
                            {
                                path: ROUTES.ADMIN_QR_LIST,
                                element: <SuspenseWrap><AdminQrListPage /></SuspenseWrap>,
                            },
                        ],
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
