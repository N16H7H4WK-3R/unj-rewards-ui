import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateAdminUser } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusMessage from '../../components/ui/StatusMessage';
import { ROUTES } from '../../lib/constants';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const userSchema = z.object({
    username: z.string().min(10, 'Username must be a valid 10-digit phone number').max(10),
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.string().min(1, 'Role is required'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function AdminCreateUserPage() {
    const navigate = useNavigate();
    const createUser = useCreateAdminUser();
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role: 'Technician',
        }
    });

    const onSubmit = async (data: UserFormData) => {
        try {
            setApiError(null);
            await createUser.mutateAsync(data);
            reset();
            navigate(ROUTES.ADMIN_USERS);
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to create user. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Create User</h1>
                    <p className="text-sm text-text-muted mt-1">Register a new user in the system</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Phone Number (Username)"
                        placeholder="e.g. 9876543210"
                        error={errors.username?.message}
                        {...register('username', { onChange: () => setApiError(null) })}
                    />

                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        error={errors.full_name?.message}
                        {...register('full_name', { onChange: () => setApiError(null) })}
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-text-primary ml-1">Role</label>
                        <select
                            {...register('role', { onChange: () => setApiError(null) })}
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
                                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                                ${errors.role ? 'border-error' : (apiError ? 'border-error/20' : 'border-border')}
                            `}
                        >
                            <option value="Technician">Technician</option>
                            <option value="Dealer">Dealer</option>
                            <option value="Admin">Admin</option>
                        </select>
                        {errors.role && <p className="text-xs text-error mt-1 ml-1">{errors.role.message}</p>}
                    </div>

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
                            onClick={() => navigate(ROUTES.ADMIN_USERS)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            loading={createUser.isPending}
                        >
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
