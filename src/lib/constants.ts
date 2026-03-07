export const ROUTES = {
    AUTH_PHONE: '/auth/phone',
    AUTH_OTP: '/auth/otp',
    ROLE_SELECT: '/role/select',
    HOME: '/',
    WALLET: '/wallet',
    TRANSACTIONS: '/wallet/transactions',
    SCAN_QR: '/scan',
    PROFILE: '/profile',
    ADMIN_LOGIN: '/admin/login',
    ADMIN_DASHBOARD: '/admin',
    ADMIN_BULK_QR: '/admin/bulk-qr',
    ADMIN_QR_CODES: '/admin/qr-codes',
    OFFLINE: '/offline',
} as const;

export const queryKeys = {
    home: () => ['home'] as const,
    wallet: () => ['wallet'] as const,
    transactions: (page: number, size: number) => ['transactions', page, size] as const,
    profile: () => ['profile'] as const,
    kycStatus: () => ['kyc-status'] as const,
    qrValidate: (code: string) => ['qr-validate', code] as const,
    adminQrList: (page: number, size: number) => ['admin-qr-list', page, size] as const,
} as const;
