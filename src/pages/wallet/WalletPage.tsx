import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../features/wallet/hooks';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { formatBalance, formatDateTime } from '../../lib/format';
import { ROUTES } from '../../lib/constants';

export default function WalletPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useTransactions(0, 5);

    if (isLoading) return <Loader className="min-h-screen" />;

    const balance = data?.wallet_balance ?? '0';
    const recentTxns = data?.transactions.content ?? [];

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">My Wallet</h1>
                <button className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer" aria-label="Support">
                    <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>

            {/* Balance Card */}
            <Card variant="gradient" padding="lg" className="mb-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary/20" />

                <div className="relative z-10">
                    <p className="text-sm text-gray-300 mb-1">Total Available Balance</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold">{formatBalance(balance)}</span>
                        <span className="text-base font-semibold text-primary-light">Points</span>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                    onClick={() => navigate(ROUTES.SCAN_QR)}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="4" height="4" rx="0.5" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-primary">Scan QR</span>
                </button>

                <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-border hover:border-text-light transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-text-muted">Withdraw
                    <span className="text-text-muted" style={{fontSize: "10px"}} > [Coming soon]</span>
                    </span>
                </button>
            </div>

            {/* Recent Transactions */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-text-primary">Recent Transactions</h2>
                    <button
                        onClick={() => navigate(ROUTES.TRANSACTIONS)}
                        className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                        See All
                    </button>
                </div>

                {recentTxns.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-sm">
                        No transactions yet
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentTxns.map((txn) => {
                            const isCredit = txn.transaction_type === 'CREDIT';
                            return (
                                <div
                                    key={txn.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${isCredit ? 'bg-success/5' : 'bg-error/5'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? 'bg-success/10' : 'bg-error/10'}`}>
                                        <svg className={`w-5 h-5 ${isCredit ? 'text-success' : 'text-error'}`} viewBox="0 0 24 24" fill="currentColor">
                                            {isCredit ? (
                                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            ) : (
                                                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2" />
                                            )}
                                        </svg>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary truncate">
                                            {txn.product_name || (isCredit ? 'QR Code Scan' : 'Withdrawal')}
                                        </p>
                                        <p className="text-xs text-text-muted">{formatDateTime(txn.created_at)}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isCredit ? 'text-success' : 'text-error'}`}>
                                            {isCredit ? '+' : '-'}{formatBalance(txn.transaction_amount)}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                            {isCredit ? 'Earned' : 'Redeemed'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
