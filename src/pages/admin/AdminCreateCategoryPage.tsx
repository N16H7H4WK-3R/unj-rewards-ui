import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateAdminCategory } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ROUTES } from '../../lib/constants';

const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCreateCategoryPage() {
    const navigate = useNavigate();
    const createCategory = useCreateAdminCategory();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
    });

    const onSubmit = async (data: CategoryFormData) => {
        try {
            await createCategory.mutateAsync(data);
            // No toast per user request
            reset();
            navigate(ROUTES.ADMIN_CATEGORIES);
        } catch {
            // Handled by hook
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Create Category</h1>
                    <p className="text-sm text-text-muted mt-1">Add a new product category</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Category Name"
                        placeholder="e.g. Electrical"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            loading={createCategory.isPending}
                        >
                            Create Category
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
