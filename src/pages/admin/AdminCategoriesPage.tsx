import { useState } from 'react';
import { useAdminCategories } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';

export default function AdminCategoriesPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading } = useAdminCategories(page, 20);

    if (isLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Product Categories</h1>
                    <p className="text-sm text-text-muted mt-1">Manage categories for your products</p>
                </div>
                <Link to={ROUTES.ADMIN_CREATE_CATEGORY}>
                    <Button size="sm" className="rounded-2xl px-6">
                        + New Category
                    </Button>
                </Link>
            </header>

            {!data || data.content.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-soft border border-gray-100">
                    <p className="text-text-muted font-medium">No categories found</p>
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.content.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-text-muted">
                                                #{category.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-text-primary">
                                                {category.name}
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
