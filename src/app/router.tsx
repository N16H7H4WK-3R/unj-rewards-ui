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
const AdminQrListPage = lazy(() => import('../pages/admin/AdminQrListPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminCreateCategoryPage = lazy(() => import('../pages/admin/AdminCreateCategoryPage'));
const AdminProductsListPage = lazy(() => import('../pages/admin/AdminProductsListPage'));
const AdminCreateProductPage = lazy(() => import('../pages/admin/AdminCreateProductPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminCreateUserPage = lazy(() => import('../pages/admin/AdminCreateUserPage'));
const AdminDebitPage = lazy(() => import('../pages/admin/AdminDebitPage'));
const OfflinePage = lazy(() => import('../pages/OfflinePage'));
const KycPage = lazy(() => import('../pages/kyc/KycPage'));
const KycOtpPage = lazy(() => import('../pages/kyc/KycOtpPage'));
const PanVerifyPage = lazy(() => import('../pages/kyc/PanVerifyPage'));

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
                    // KYC pages (outside AppShell — no bottom nav)
                    {
                        path: ROUTES.KYC,
                        element: <SuspenseWrap><KycPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.KYC_VERIFY_OTP,
                        element: <SuspenseWrap><KycOtpPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.KYC_VERIFY_PAN,
                        element: <SuspenseWrap><PanVerifyPage /></SuspenseWrap>,
                    },
                ],
            },
            // Handle /:appCode/:qrCode pattern
            {
                path: '/:appCodeAlgoVersion/:qrCode',
                element: <SuspenseWrap><ScanPage /></SuspenseWrap>,
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
                    {
                        path: ROUTES.ADMIN_QR_LIST,
                        element: <SuspenseWrap><AdminQrListPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_CATEGORIES,
                        element: <SuspenseWrap><AdminCategoriesPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_CREATE_CATEGORY,
                        element: <SuspenseWrap><AdminCreateCategoryPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_PRODUCTS,
                        element: <SuspenseWrap><AdminProductsListPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_CREATE_PRODUCT,
                        element: <SuspenseWrap><AdminCreateProductPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_USERS,
                        element: <SuspenseWrap><AdminUsersPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_CREATE_USER,
                        element: <SuspenseWrap><AdminCreateUserPage /></SuspenseWrap>,
                    },
                    {
                        path: ROUTES.ADMIN_DEBIT,
                        element: <SuspenseWrap><AdminDebitPage /></SuspenseWrap>,
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
