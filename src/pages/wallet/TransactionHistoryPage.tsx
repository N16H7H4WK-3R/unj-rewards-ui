import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../features/wallet/hooks';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { formatBalance, formatDateTime } from '../../lib/format';

export default function TransactionHistoryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const size = 20;
    const { data, isLoading } = useTransactions(page, size);

    const txns = data?.transactions.content ?? [];
    const pagination = data?.transactions;

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer"
                    aria-label="Go back"
                >
                    <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-text-primary">Transaction History</h1>
            </div>

            {isLoading ? (
                <Loader className="py-20" />
            ) : txns.length === 0 ? (
                <div className="text-center py-20 text-text-muted text-sm">
                    No transactions found
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-6">
                        {txns.map((txn) => {
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
                                            {txn.product_name || (isCredit ? 'QR Code Scan' : txn.reason)}
                                        </p>
                                        <p className="text-xs text-text-muted">{formatDateTime(txn.created_at)}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isCredit ? 'text-success' : 'text-error'}`}>
                                            {isCredit ? '+' : '-'}{formatBalance(txn.transaction_amount)}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                            {isCredit ? 'Earned' : 'Debit'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination && (
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={pagination.first}
                            >
                                ← Previous
                            </Button>
                            <span className="text-xs text-text-muted">
                                Page {pagination.page + 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={pagination.last}
                            >
                                Next →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
