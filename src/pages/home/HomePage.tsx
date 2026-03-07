import { useNavigate } from 'react-router-dom';
import { useHome } from '../../features/home/hooks';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatBalance } from '../../lib/format';
import { ROUTES } from '../../lib/constants';

export default function HomePage() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useHome();

    if (isLoading) return <Loader className="min-h-screen" />;

    if (error || !data) {
        return (
            <div className="p-6 text-center text-text-muted min-h-screen flex items-center justify-center">
                <p>Failed to load home data. Pull down to refresh.</p>
            </div>
        );
    }

    const { user, wallet } = data;

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.photo ? (
                            <img src={user.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
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

                {/* Bell icon */}
                {/*<button className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer" aria-label="Notifications">*/}
                {/*    <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">*/}
                {/*        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />*/}
                {/*    </svg>*/}
                {/*</button>*/}
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
                            className="flex-1 !bg-white/10 hover:!bg-white/20"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Wallet
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
