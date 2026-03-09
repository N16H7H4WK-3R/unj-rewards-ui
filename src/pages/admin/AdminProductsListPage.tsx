import { useState } from 'react';
import { useAdminProducts } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';
import { formatBalance } from '../../lib/format';
import type { Category } from '../../types/api';

export default function AdminProductsListPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading } = useAdminProducts(page, 20);

    if (isLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Products</h1>
                    <p className="text-sm text-text-muted mt-1">Manage your reward products</p>
                </div>
                <Link to={ROUTES.ADMIN_CREATE_PRODUCT}>
                    <Button size="sm" className="rounded-2xl px-6">
                        + New Product
                    </Button>
                </Link>
            </header>

            {!data || data.content.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-soft border border-gray-100">
                    <p className="text-text-muted font-medium">No products found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">ID</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Name</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Category</th>
                                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text-muted">Default Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.content.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-text-muted">
                                                #{product.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted">
                                                {typeof product.category === 'object' ? (product.category as Category).name : `ID: ${product.category}`}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary">
                                                {formatBalance(product.default_points.toString())}
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
