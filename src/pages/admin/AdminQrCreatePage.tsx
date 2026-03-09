import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminCreateQr, useProducts } from '../../features/qr/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const createSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    points: z.string().min(1, 'Points is required'),
});

type CreateFormData = z.infer<typeof createSchema>;

export default function AdminQrCreatePage() {
    const { data: products, isLoading: productsLoading } = useProducts();
    const createQr = useAdminCreateQr();
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
    });

    const onSubmit = async (data: CreateFormData) => {
        try {
            setApiError(null);
            const blob = await createQr.mutateAsync({
                product_id: Number(data.product_id),
                points: data.points,
                count: 1,
            });

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // eslint-disable-next-line react-hooks/purity
            link.setAttribute('download', `qr_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            reset();
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to generate QR code. Please try again.');
            }
        }
    };

    if (productsLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <h1 className="text-2xl font-bold text-text-primary mb-8 text-center">Generate Single QR</h1>

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
                            {products?.content?.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({typeof p.category === 'object' ? (p.category as { name: string }).name : p.category})</option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-xs text-error mt-1 ml-1">{errors.product_id.message}</p>}
                    </div>

                    <Input
                        label="Points"
                        placeholder="e.g. 100.00"
                        error={errors.points?.message}
                        {...register('points', { onChange: () => setApiError(null) })}
                    />

                    <StatusMessage
                        type="error"
                        message={apiError}
                        onDismiss={() => setApiError(null)}
                    />

                    <div className="pt-4">
                        <Button type="submit" fullWidth size="lg" loading={createQr.isPending}>
                            Generate QR Code
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
