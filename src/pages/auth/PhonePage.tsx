import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequestOtp } from '../../features/auth/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const phoneSchema = z.object({
    username: z.string()
        .min(10, 'Enter a valid 10-digit phone number')
        .max(10, 'Enter a valid 10-digit phone number')
        .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function PhonePage() {
    const navigate = useNavigate();
    const requestOtp = useRequestOtp();

    const { register, handleSubmit, formState: { errors } } = useForm<PhoneFormData>({
        resolver: zodResolver(phoneSchema),
    });

    const onSubmit = async (data: PhoneFormData) => {
        try {
            const res = await requestOtp.mutateAsync({ username: data.username });
            navigate('/auth/otp', {
                state: {
                    username: data.username,
                    token: res.token,
                },
            });
        } catch {
            // Error handled by hook
        }
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col">
            {/* Top section */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-text-primary mb-2">UNJ Rewards</h1>
                <p className="text-sm text-text-muted mb-8 text-center">
                    Welcome! Login with your phone number to continue
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
                    <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        inputMode="numeric"
                        error={errors.username?.message}
                        {...register('username')}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={requestOtp.isPending}
                    >
                        Send OTP
                    </Button>
                </form>
            </div>

            {/* Bottom brand */}
            <div className="py-4 text-center">
                <p className="text-xs text-text-light">Powered by UNJ Digital</p>
            </div>
        </div>
    );
}
