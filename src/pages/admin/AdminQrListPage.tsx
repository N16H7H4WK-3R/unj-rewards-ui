import { useState } from 'react';
import { useAdminQrList } from '../../features/qr/hooks';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatDateTime, formatBalance } from '../../lib/format';

export default function AdminQrListPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading } = useAdminQrList(page, 20);

    if (isLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Individual QR Codes</h1>
                <p className="text-sm text-text-muted mt-1">Detailed list of all generated QR codes</p>
            </header>

            {!data || data.content.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-soft border border-gray-100">
                    <p className="text-text-muted font-medium">No QR codes found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Code</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Product</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Points</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Status</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Created At</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">User</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Redeemed At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.content.map((qr) => (
                                        <tr key={qr.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-text-primary">
                                                {qr.public_code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-text-primary">{qr.product.name}</p>
                                                <p className="text-[10px] text-text-muted">{qr.product.category}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary">
                                                {formatBalance(qr.points)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight ${qr.status === 'ACTIVE'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-gray-100 text-text-muted'
                                                    }`}>
                                                    {qr.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-muted">
                                                {formatDateTime(qr.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {qr.redeemed_by_username ? (
                                                    <span className="text-xs font-medium text-text-primary px-2 py-1 bg-primary/5 rounded-md">
                                                        {qr.redeemed_by_username}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-text-light">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-muted">
                                                {qr.redeemed_at ? (
                                                    formatDateTime(qr.redeemed_at)
                                                ) : (
                                                    <span className="text-xs text-text-light">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={data.page === 0}
                            className="px-4"
                        >
                            ← Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary">Page {data.page + 1}</span>
                            <span className="text-[10px] text-text-light uppercase tracking-widest font-black">of {data.total_pages}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={data.page >= data.total_pages - 1}
                            className="px-4"
                        >
                            Next →
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
