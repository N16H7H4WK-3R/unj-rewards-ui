import { useState } from 'react';
import { useAdminQrList } from '../../features/admin/qr/hooks';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { formatDateTime } from '../../lib/format';

export default function AdminQrListPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading } = useAdminQrList(page, 20);

    return (
        <div className="px-4 pt-4 pb-6">
            <h1 className="text-xl font-bold text-text-primary mb-6">QR Codes</h1>

            {isLoading ? (
                <Loader className="py-20" />
            ) : !data || data.content.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-20">No QR codes found</p>
            ) : (
                <>
                    <div className="space-y-3 mb-6">
                        {data.content.map((qr) => (
                            <div key={qr.id} className="bg-white rounded-xl p-4 shadow-soft">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-sm font-bold text-text-primary">{qr.code}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${qr.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-gray-100 text-text-muted'
                                        }`}>
                                        {qr.status}
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted">{qr.product.name} · {qr.points} PTS</p>
                                <p className="text-xs text-text-light mt-1">{formatDateTime(qr.created_at)}</p>
                                {qr.redeemed_by_username && (
                                    <p className="text-xs text-text-muted mt-1">Redeemed by: {qr.redeemed_by_username}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={data.first}>
                            ← Previous
                        </Button>
                        <span className="text-xs text-text-muted">Page {data.page + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={data.last}>
                            Next →
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
