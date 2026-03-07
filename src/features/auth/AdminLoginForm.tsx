import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminLogin } from './hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
    const navigate = useNavigate();
    const login = useAdminLogin();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login.mutateAsync(data);
            navigate(ROUTES.ADMIN_DASHBOARD);
        } catch {
            // Error handled by hook
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
            <Input
                label="Username"
                placeholder="Enter admin username"
                error={errors.username?.message}
                {...register('username')}
            />

            <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                error={errors.password?.message}
                {...register('password')}
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
