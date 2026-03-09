import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminLogin } from './hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
    const navigate = useNavigate();
    const login = useAdminLogin();
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setApiError(null);
            await login.mutateAsync(data);
            navigate(ROUTES.ADMIN_DASHBOARD);
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
            <Input
                label="Username"
                placeholder="Enter admin username"
                error={errors.username?.message}
                {...register('username', { onChange: () => setApiError(null) })}
            />

            <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                error={errors.password?.message}
                {...register('password', { onChange: () => setApiError(null) })}
            />

            <StatusMessage
                type="error"
                message={apiError}
                onDismiss={() => setApiError(null)}
            />

            <Button
                type="submit"
                fullWidth
                size="lg"
                loading={login.isPending}
            >
                Login as Admin
            </Button>
        </form>
    );
}
