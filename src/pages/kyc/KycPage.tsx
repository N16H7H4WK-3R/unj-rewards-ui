import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequestAadhaarOtp } from '../../features/kyc/hooks';
import Button from '../../components/ui/Button';
import PinInput from '../../components/ui/PinInput';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { ROUTES } from '../../lib/constants';
import {useLogout} from "../../features/auth/hooks.ts";

const kycSchema = z.object({
    aadhaar_number: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'),
    pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN (e.g. ABCDE1234F)'),
});

type KycFormData = z.infer<typeof kycSchema>;

export default function KycPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const requestOtp = useRequestAadhaarOtp();
    const [apiError, setApiError] = useState<string | null>(null);
    const logoutMutation = useLogout();

    const { handleSubmit, formState: { errors }, setValue, control, trigger } = useForm<KycFormData>({
        resolver: zodResolver(kycSchema),
        defaultValues: { aadhaar_number: '', pan_number: '' },
    });

    const aadhaarValue = useWatch({ control, name: 'aadhaar_number' });
    const panValue = useWatch({ control, name: 'pan_number' });

    const onSubmit = async (data: KycFormData) => {
        try {
            setApiError(null);
            const result = await requestOtp.mutateAsync(data);
            navigate(ROUTES.KYC_VERIFY_OTP, {
                state: {
                    reference_id: result.reference_id,
                    aadhaar_number: result.aadhaar_number,
                    pan_number: result.pan_number,
                    from: location.state?.from,
                },
            });
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

    const handleBackLogout = async () => {
        await logoutMutation.mutateAsync();
        navigate(ROUTES.AUTH_PHONE)
    };

    return (
        <div className="pwa-standalone-page flex flex-col px-4 bg-bg">
            <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
                {/* Back button */}
                <button
                    // onClick={() => navigate(ROUTES.AUTH_PHONE)}
                    onClick={handleBackLogout}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">KYC Verification</h1>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Enter your Aadhaar and PAN details to verify your identity. An OTP will be sent to your Aadhaar-linked mobile number.
                    </p>
                </div>

                <StatusMessage
                    type="error"
                    message={apiError}
                    onDismiss={() => setApiError(null)}
                />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <PinInput
                        label="Aadhaar Number"
                        length={12}
                        boxCount={3}
                        charsPerBox={4}
                        type="number"
                        value={aadhaarValue}
                        onChange={(val) => {
                            setApiError(null);
                            setValue('aadhaar_number', val);
                            if (val.length === 12) trigger('aadhaar_number');
                        }}
                        error={errors.aadhaar_number?.message}
                        autoFocus
                    />

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
                        error={errors.pan_number?.message}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={requestOtp.isPending}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            Request OTP
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
