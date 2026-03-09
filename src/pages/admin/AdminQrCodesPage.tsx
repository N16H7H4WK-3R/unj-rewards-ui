import { useAdminBatches, useAdminBatchDownload } from '../../features/qr/hooks';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatDateTime, formatBalance } from '../../lib/format';
import { useState } from 'react';

export default function AdminQrCodesPage() {
    const { data: batches, isLoading } = useAdminBatches();
    const downloadMutation = useAdminBatchDownload();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (batchId: string) => {
        setDownloadingId(batchId);
        try {
            const blob = await downloadMutation.mutateAsync(batchId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `batch_${batchId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            // Handled
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="px-4 py-8 max-w-5xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">QR Code Batches</h1>
                    <p className="text-sm text-text-muted mt-1">Manage and download generated QR batches</p>
                </div>
            </header>

            {!batches || batches.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-soft border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-text-muted font-medium">No batches found</p>
                    <p className="text-xs text-text-light mt-1">Start by generating some QR codes</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Batch ID</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Product</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted text-center">Count</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted text-center">Points</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Created At</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-semibold text-text-primary px-2 py-1 bg-gray-100 rounded-md">
                                                {batch.batch_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-text-primary">{batch.product_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-text-muted">{batch.count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-primary">{formatBalance(batch.points)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-text-muted">{formatDateTime(batch.created_at)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(batch.batch_id)}
                                                loading={downloadingId === batch.batch_id}
                                            >
                                                Download CSV
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
