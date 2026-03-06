import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminQrCreate } from '../../features/admin/qr/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const createSchema = z.object({
    product_id: z.string().min(1, 'Product ID is required'),
    points: z.string().min(1, 'Points is required'),
});

type CreateFormData = z.infer<typeof createSchema>;

export default function AdminQrCreatePage() {
    const createQr = useAdminQrCreate();
    const [lastCreated, setLastCreated] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
    });

    const onSubmit = async (data: CreateFormData) => {
        try {
            const result = await createQr.mutateAsync({
                product_id: Number(data.product_id),
                points: data.points,
            });
            setLastCreated(result.code);
            reset();
        } catch {
            // handled
        }
    };

    return (
        <div className="px-4 pt-4 pb-6">
            <h1 className="text-xl font-bold text-text-primary mb-6">Create QR Code</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
                <Input
                    label="Product ID"
                    type="number"
                    placeholder="Enter product ID"
                    error={errors.product_id?.message}
                    {...register('product_id')}
                />
                <Input
                    label="Points"
                    placeholder="e.g. 100.00"
                    error={errors.points?.message}
                    {...register('points')}
                />
                <Button type="submit" fullWidth size="lg" loading={createQr.isPending}>
                    Create QR Code
                </Button>
            </form>

            {lastCreated && (
                <div className="p-4 bg-success/10 rounded-xl text-center">
                    <p className="text-sm text-success font-medium">QR Code Created!</p>
                    <p className="text-lg font-mono font-bold text-text-primary mt-1">{lastCreated}</p>
                </div>
            )}
        </div>
    );
}
