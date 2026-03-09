import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminCreateQr, useProducts } from '../../features/qr/hooks';
import type { Category } from '../../types/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const bulkQrSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    points: z.string().min(1, 'Points is required'),
    count: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Count must be a positive number',
    }),
});

type BulkQrFormData = z.infer<typeof bulkQrSchema>;

export default function AdminBulkQrPage() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const createQr = useAdminCreateQr();
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<BulkQrFormData>({
        resolver: zodResolver(bulkQrSchema),
    });

    const onSubmit = async (data: BulkQrFormData) => {
        try {
            setApiError(null);
            const blob = await createQr.mutateAsync({
                product_id: Number(data.product_id),
                points: data.points,
                count: Number(data.count),
            });

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // eslint-disable-next-line react-hooks/purity
            link.setAttribute('download', `batch_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            reset();
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to generate QRs. Please try again.');
            }
        }
    };

    if (productsLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Generate Bulk QRs</h1>
                    <p className="text-sm text-text-muted mt-1">Create multiple QR codes and download as CSV</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-text-primary ml-1">Select Product</label>
                        <select
                            {...register('product_id', { onChange: () => setApiError(null) })}
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
                                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                                ${errors.product_id ? 'border-error' : (apiError ? 'border-error/20' : 'border-border')}
                            `}
                        >
                            <option value="">Choose a product</option>
                            {products?.content.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({typeof p.category === 'object' ? (p.category as Category).name : p.category})</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-xs text-error mt-1 ml-1">{errors.product_id.message}</p>}
                    </div>

                    <Input
                        label="Points per QR"
                        placeholder="e.g. 50.00"
                        error={errors.points?.message}
                        {...register('points', { onChange: () => setApiError(null) })}
                    />

                    <Input
                        label="Number of QRs"
                        type="number"
                        placeholder="e.g. 100"
                        error={errors.count?.message}
                        {...register('count', { onChange: () => setApiError(null) })}
                    />

                    <StatusMessage
                        type="error"
                        message={apiError}
                        onDismiss={() => setApiError(null)}
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={createQr.isPending}
                            className="h-14"
                        >
                            Generate & Download CSV
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Generating a large number of QR codes may take a few seconds. The CSV file will include the public codes for printing.
                    </p>
                </div>
            </div>
        </div>
    );
}
