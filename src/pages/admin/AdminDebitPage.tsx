import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebitUserWallet, useAdminUsers } from '../../features/admin/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { useState } from 'react';

const debitSchema = z.object({
    user_id: z.string().min(1, 'User is required'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

type DebitFormData = z.infer<typeof debitSchema>;

export default function AdminDebitPage() {
    // Fetch users (technicians mostly) to select from
    const { data: usersData, isLoading: usersLoading } = useAdminUsers('Technician', 0, 100);
    const debitWallet = useDebitUserWallet();
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<DebitFormData>({
        resolver: zodResolver(debitSchema),
    });

    const onSubmit = async (data: DebitFormData) => {
        try {
            setApiError(null);
            await debitWallet.mutateAsync({
                user_id: Number(data.user_id),
                amount: Number(data.amount),
                reason: data.reason,
            });
            reset();
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to process debit. Please check user balance and try again.');
            }
        }
    };

    if (usersLoading) return <Loader className="min-h-[400px]" />;

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">Debit User Wallet</h1>
                    <p className="text-sm text-text-muted mt-1">Deduct points from a user's wallet</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-text-primary ml-1">Select User</label>
                        <select
                            {...register('user_id', { onChange: () => setApiError(null) })}
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white
                                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                                ${errors.user_id ? 'border-error' : (apiError ? 'border-error/20' : 'border-border')}
                            `}
                        >
                            <option value="">Choose a user</option>
                            {usersData?.content.map((u) => (
                                <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>
                            ))}
                        </select>
                        {errors.user_id && <p className="text-xs text-error mt-1 ml-1">{errors.user_id.message}</p>}
                    </div>

                    <Input
                        label="Amount to Deduct"
                        type="number"
                        placeholder="e.g. 500"
                        error={errors.amount?.message}
                        {...register('amount', { onChange: () => setApiError(null) })}
                    />

                    <Input
                        label="Reason"
                        placeholder="e.g. Gift redemption"
                        error={errors.reason?.message}
                        {...register('reason', { onChange: () => setApiError(null) })}
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
                            loading={debitWallet.isPending}
                            className="bg-error hover:bg-error/90"
                        >
                            Confirm Debit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
