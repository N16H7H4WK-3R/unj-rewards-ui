import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useVerifyAadhaarOtp } from '../../features/kyc/hooks';
import { updateProfile } from '../../features/profile/api';
import Button from '../../components/ui/Button';
import PinInput from '../../components/ui/PinInput';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';
import { ROUTES, queryKeys } from '../../lib/constants';

const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit OTP'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface LocationState {
    reference_id: string;
    aadhaar_number: string;
    pan_number: string;
    from?: { pathname: string; search: string };
}

function base64ToFile(dataUri: string, filename: string): File {
    const arr = dataUri.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
}

function convertDob(ddmmyyyy: string): string {
    const [dd, mm, yyyy] = ddmmyyyy.split('-');
    return `${yyyy}-${mm}-${dd}`;
}

function mapGender(g: string): string {
    if (g === 'M') return 'Male';
    if (g === 'F') return 'Female';
    return 'Other';
}

export default function KycOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const state = location.state as LocationState | null;

    const verifyOtp = useVerifyAadhaarOtp();
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Guard: redirect if location state is missing
    useEffect(() => {
        if (!state?.reference_id || !state?.aadhaar_number || !state?.pan_number) {
            navigate(ROUTES.KYC, { replace: true });
        }
    }, [state, navigate]);

    const { handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const otpValue = watch('otp');

    if (!state?.reference_id) return null;

    const onSubmit = async (data: OtpFormData) => {
        try {
            setApiError(null);
            setSuccessMessage(null);

            const result = await verifyOtp.mutateAsync({
                otp: data.otp,
                reference_id: state.reference_id,
                aadhaar_number: state.aadhaar_number,
                pan_number: state.pan_number,
            });

            setSuccessMessage(
                `Aadhaar verified successfully, and PAN status = ${result.pan_link_status}`
            );

            // Extract profile data from sandbox response
            const aadhaarData = result.sandbox_response.data;

            const profilePayload: Record<string, string | File | undefined> = {
                full_name: aadhaarData.name,
                dob: convertDob(aadhaarData.date_of_birth),
                gender: mapGender(aadhaarData.gender),
                district: aadhaarData.address.district,
                state: aadhaarData.address.state,
                pincode: aadhaarData.address.pincode,
            };

            // Convert base64 photo to File if present
            if (aadhaarData.photo) {
                const photoUri = aadhaarData.photo.startsWith('data:')
                    ? aadhaarData.photo
                    : `data:image/jpeg;base64,${aadhaarData.photo}`;
                profilePayload.photo = base64ToFile(photoUri, 'aadhaar_photo.jpg');
            }

            // Update profile with KYC data
            try {
                setIsUpdatingProfile(true);
                await updateProfile(profilePayload as Parameters<typeof updateProfile>[0]);
                await queryClient.invalidateQueries({queryKey: queryKeys.profile()});
            } catch {
                // Profile update failed — still navigate to profile for manual retry
            } finally {
                setIsUpdatingProfile(false);
            }

            // Small delay so user sees the success message
            setTimeout(async () => {
                // Invalidate KYC and Home queries here, just before navigation,
                // to prevent the route guard from triggering a redirect to PAN page prematurely.
                await queryClient.invalidateQueries({ queryKey: queryKeys.kycStatus() });
                await queryClient.invalidateQueries({ queryKey: queryKeys.home() });
                const origin = state?.from?.pathname;
                const isQrOrigin = origin && origin.split('/').length === 3; // Simple check for /:appCode/:qrCode
                if (isQrOrigin) {
                    navigate(origin + (state?.from?.search || ""), { replace: true });
                } else {
                    navigate(ROUTES.PROFILE, { state: { fromKyc: true }, replace: true });
                }
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

    const isPending = verifyOtp.isPending || isUpdatingProfile;

    return (
        <div className="pwa-standalone-page flex flex-col px-4 bg-bg">
            <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
                {/* Back button */}
                <button
                    onClick={() => navigate(ROUTES.KYC, { replace: true })}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Verify Aadhaar OTP</h1>
                    <p className="text-sm text-text-muted leading-relaxed">
                        Enter the 6-digit OTP sent to your Aadhaar-linked mobile number
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
                        <PinInput
                            label="OTP"
                            length={6}
                            boxCount={6}
                            charsPerBox={1}
                            type="number"
                            value={otpValue}
                            onChange={(val) => {
                                setApiError(null);
                                setValue('otp', val);
                                if (val.length === 6) trigger('otp');
                            }}
                            error={errors.otp?.message}
                            autoFocus
                        />

                        <div className="pt-2 space-y-3">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={isPending}
                            >
                                {isUpdatingProfile ? 'Updating Profile...' : 'Verify OTP'}
                            </Button>

                            {apiError && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    size="lg"
                                    onClick={() => navigate(ROUTES.KYC, { replace: true })}
                                >
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
