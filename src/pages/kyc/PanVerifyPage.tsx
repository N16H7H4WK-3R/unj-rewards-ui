import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useHome } from '../../features/home/hooks';
import { useVerifyPanAadhaarLink } from '../../features/kyc/hooks';
import Button from '../../components/ui/Button';
import PinInput from '../../components/ui/PinInput';
import Loader from '../../components/ui/Loader';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../lib/constants';

const panVerifySchema = z.object({
    aadhaar_first8: z.string().regex(/^\d{8}$/, 'Enter the first 8 digits of your Aadhaar'),
    pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN (e.g. ABCDE1234F)'),
});

type PanVerifyFormData = z.infer<typeof panVerifySchema>;

export default function PanVerifyPage() {
    const navigate = useNavigate();
    const { data: homeData, isLoading } = useHome();
    const verifyPan = useVerifyPanAadhaarLink();
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Extract last 4 digits from masked aadhaar (e.g. "XXXXXXXX1234" → "1234")
    const aadhaarLast4 = useMemo(() => {
        const masked = homeData?.kyc?.aadhaar_number;
        if (!masked || masked.length < 4) return null;
        return masked.slice(-4);
    }, [homeData]);

    const existingPan = homeData?.kyc?.pan_number ?? null;

    // Redirect to home if no aadhaar data available
    useEffect(() => {
        if (!isLoading && !aadhaarLast4) {
            navigate(ROUTES.HOME, { replace: true });
        }
    }, [isLoading, aadhaarLast4, navigate]);

    const { handleSubmit, formState: { errors }, setValue, control, trigger } = useForm<PanVerifyFormData>({
        resolver: zodResolver(panVerifySchema),
        defaultValues: { aadhaar_first8: '', pan_number: '' },
    });

    const aadhaarFirst8Value = useWatch({ control, name: 'aadhaar_first8' });
    const panValue = useWatch({ control, name: 'pan_number' });
    const isSamePan = !!(existingPan && panValue === existingPan);

    const onSubmit = async (data: PanVerifyFormData) => {
        if (isSamePan) return;

        const fullAadhaar = data.aadhaar_first8 + aadhaarLast4;

        try {
            setApiError(null);
            setSuccessMessage(null);
            const result = await verifyPan.mutateAsync({
                aadhaar_number: fullAadhaar,
                pan_number: data.pan_number,
            });
            setSuccessMessage(result.message || 'PAN verified successfully.');
            setTimeout(() => {
                navigate(ROUTES.HOME, { replace: true });
            }, 1500);
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 429) {
                    setApiError('Too many attempts, please try again later.');
                } else {
                    setApiError(err.message);
                }
            } else {
                setApiError('Something went wrong. Please try again.');
            }
        }
    };

    if (isLoading) return <Loader className="min-h-screen" />;
    if (!aadhaarLast4) return null;

    return (
        <div className="pwa-standalone-page flex flex-col px-4 bg-bg">
            <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
                {/* Back button */}
                <button
                    onClick={() => navigate(ROUTES.HOME, { replace: true })}
                    className="self-start mb-4 mt-2 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    aria-label="Go back"
                >
                    <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Verify PAN Card</h1>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Enter your Aadhaar number and a valid PAN to link and verify your PAN card.
                    </p>
                </div>

                <StatusMessage
                    type="success"
                    message={successMessage}
                    onDismiss={() => setSuccessMessage(null)}
                />
                <StatusMessage
                    type="error"
                    message={apiError}
                    onDismiss={() => setApiError(null)}
                />

                {!successMessage && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        {/* Aadhaar: editable first 8 + read-only last 4 */}
                        <div className="w-full">
                            <div className="flex gap-2 items-end">
                                <PinInput
                                    label="Aadhaar Number"
                                    length={8}
                                    boxCount={2}
                                    charsPerBox={4}
                                    type="number"
                                    value={aadhaarFirst8Value}
                                    onChange={(val) => {
                                        setApiError(null);
                                        setValue('aadhaar_first8', val);
                                        if (val.length === 8) trigger('aadhaar_first8');
                                    }}
                                    error={errors.aadhaar_first8?.message}
                                    className="flex-[2] min-w-0"
                                    autoFocus
                                />
                                <div className="flex-1 min-w-0 mb-1">
                                    <div className="h-12 px-3 bg-gray-100 border border-border rounded-xl text-base text-text-muted font-bold tracking-wider flex items-center justify-center">
                                        {aadhaarLast4}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <PinInput
                            label="PAN Number"
                            length={10}
                            boxCount={10}
                            charsPerBox={1}
                            type="text"
                            value={panValue}
                            onChange={(val) => {
                                setApiError(null);
                                const upperVal = val.toUpperCase();
                                setValue('pan_number', upperVal);
                                if (upperVal.length === 10) trigger('pan_number');
                            }}
                            error={errors.pan_number?.message || (isSamePan ? 'Please enter a different PAN number' : undefined)}
                        />

                        <div className="pt-2 space-y-3">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={verifyPan.isPending}
                                disabled={isSamePan}
                            >
                                Verify PAN
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                fullWidth
                                size="lg"
                                onClick={() => navigate(ROUTES.HOME, { replace: true })}
                            >
                                Back to Home
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
