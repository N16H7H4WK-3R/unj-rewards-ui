import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHome } from '../../features/home/hooks';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatBalance } from '../../lib/format';
import { ROUTES } from '../../lib/constants';
import { config } from '../../lib/config';

export default function HomePage() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useHome();

    // Redirect to KYC page if KYC status is empty (no verifications done)
    useEffect(() => {
        if (data && data.kyc.kyc_status.length === 0) {
            navigate(ROUTES.KYC, { replace: true });
        }
    }, [data, navigate]);

    // Derive PAN status from kyc_status array
    const panStatus = useMemo(() => {
        if (!data) return null;
        const panEntity = data.kyc.kyc_status.find((e) => e.entity === 'PAN');
        return panEntity?.status ?? null;
    }, [data]);

    if (isLoading) return <Loader className="min-h-screen" />;

    if (error || !data) {
        return (
            <div className="p-6 text-center text-text-muted min-h-screen flex items-center justify-center">
                <p>Failed to load home data. Pull down to refresh.</p>
            </div>
        );
    }

    // Don't render if about to redirect
    if (data.kyc.kyc_status.length === 0) return <Loader className="min-h-screen" />;

    const { user, wallet } = data;

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.photo ? (
                            <img src={user.photo.startsWith('http') ? user.photo : `${config.apiBaseUrl}${user.photo}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-text-muted">Welcome back,</p>
                        <p className="text-sm font-semibold text-text-primary">
                            {user.full_name || user.username}
                        </p>
                    </div>
                </div>
            </div>

            {/* Wallet Card */}
            <Card variant="gradient" padding="lg" className="mb-6 relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/20" />
                <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-primary/10" />

                <div className="relative z-10">
                    <p className="text-sm text-gray-300 mb-1">Available Balance</p>
                    <div className="flex items-baseline gap-2 mb-5">
                        <span className="text-4xl font-bold">{formatBalance(wallet.balance)}</span>
                        <span className="text-lg font-semibold text-primary-light">PTS</span>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(ROUTES.SCAN_QR)}
                            className="flex-1"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="4" height="4" rx="0.5" />
                                <rect x="19" y="19" width="2" height="2" />
                            </svg>
                            Scan QR
                        </Button>
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => navigate(ROUTES.WALLET)}
                            className="flex-1 bg-white/10! hover:bg-white/20!"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Wallet
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Profile Verified Status */}
            {user.is_profile_complete &&
                data.kyc.kyc_status.some(e => e.entity === 'AADHAAR' && e.status === 'VERIFIED') &&
                data.kyc.kyc_status.some(e => e.entity === 'PAN' && e.status === 'VERIFIED') && (
                    <Card padding="md" className="mb-6 border border-success/20 bg-success/5 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-primary">Profile Completely Verified</p>
                                <p className="text-xs text-text-muted">Your identity and profile details are fully verified.</p>
                            </div>
                        </div>
                    </Card>
                )}

            {/* PAN Status Card — between Wallet and How to Scan */}
            {panStatus !== 'VERIFIED' && panStatus !== 'REJECTED' && (
                <Card padding="md" className="mb-6 border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">Verify PAN Card</p>
                            <p className="text-xs text-text-muted">Your PAN verification is pending</p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => navigate(ROUTES.KYC_VERIFY_PAN)}
                    >
                        Verify PAN
                    </Button>
                </Card>
            )}

            {panStatus === 'REJECTED' && (
                <Card padding="md" className="mb-6 border border-error/20 bg-error/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">Your PAN cannot be verified</p>
                            <p className="text-xs text-text-muted">Please contact the application admin for PAN verification assistance.</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* How to Scan Section */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-text-primary mb-6">How to Scan</h3>

                {/* Steps */}
                <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-bold text-lg">1</span>
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary">Find the QR Code</p>
                            <p className="text-sm text-text-muted">Located on product packaging</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                <div className="bg-primary rounded-[1px]"></div>
                                <div className="bg-primary rounded-[1px]"></div>
                                <div className="bg-primary rounded-[1px]"></div>
                                <div className="border border-primary rounded-[1px]"></div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary">Scan the QR code</p>
                            <p className="text-sm text-text-muted">Use the scanner below</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-text-primary">Earn Points Instantly</p>
                            <p className="text-sm text-text-muted">Points credited immediately</p>
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-text-muted px-8 leading-relaxed">
                    Scan product QR codes to earn points instantly
                </p>
            </div>
        </div>
    );
}
