import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateAdminProduct, useAdminCategories } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import StatusMessage from '../../components/ui/StatusMessage';
import { ROUTES } from '../../lib/constants';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.string().min(1, 'Category is required'),
    default_points: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Default points must be a non-negative number',
    }),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminCreateProductPage() {
    const navigate = useNavigate();
    const createProduct = useCreateAdminProduct();
    // Assuming small number of categories for the create form, fetching first page
    const { data: categoriesData, isLoading: categoriesLoading } = useAdminCategories(0, 100);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            default_points: '0',
        }
    });

    const onSubmit = async (data: ProductFormData) => {
        try {
            setApiError(null);
            await createProduct.mutateAsync({
                name: data.name,
                category: Number(data.category),
                default_points: Number(data.default_points),
            });
            reset(); navigate(ROUTES.ADMIN_PRODUCTS);
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to create product. Please try again.');
            }
        }
    };

    if (categoriesLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Create Product</h1>
                    <p className="text-sm text-text-muted mt-1">Add a new product to the system</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Product Name"
                        placeholder="e.g. UNJ Fan 50W"
                        error={errors.name?.message}
                        {...register('name', { onChange: () => setApiError(null) })}
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-text-primary ml-1">Category</label>
                        <select
                            {...register('category', { onChange: () => setApiError(null) })}
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
                                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                                ${errors.category ? 'border-error' : (apiError ? 'border-error/20' : 'border-border')}
                            `}
                        >
                            <option value="">Choose a category</option>
                            {categoriesData?.content.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-xs text-error mt-1 ml-1">{errors.category.message}</p>}
                    </div>

                    <Input
                        label="Default Points"
                        type="number"
                        placeholder="e.g. 50"
                        error={errors.default_points?.message}
                        {...register('default_points', { onChange: () => setApiError(null) })}
                    />

                    <StatusMessage
                        type="error"
                        message={apiError}
                        onDismiss={() => setApiError(null)}
                    />

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            loading={createProduct.isPending}
                        >
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
