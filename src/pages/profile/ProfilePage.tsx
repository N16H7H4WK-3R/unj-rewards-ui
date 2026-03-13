import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    useProfile,
    useUpdateProfile,
    useRequestEmailVerification,
    useConfirmEmailVerification
} from '../../features/profile/hooks';
import { useHome } from '../../features/home/hooks';
import { useLogout } from '../../features/auth/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Loader from '../../components/ui/Loader';
import { config } from '../../lib/config';
import StatusMessage from '../../components/ui/StatusMessage';
import { ApiError } from '../../services/apiClient';

const profileSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email').or(z.literal('')).optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').or(z.literal('')).optional(),
    full_address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Fields that are locked when KYC (Aadhaar) is verified
const KYC_LOCKED_FIELDS = ['full_name', 'dob', 'gender', 'district', 'state', 'pincode', 'full_address'] as const;

export default function ProfilePage() {
    const location = useLocation();
    const fromRoleSelect = location.state?.fromRoleSelect;
    const fromKyc = location.state?.fromKyc;
    const { data: profile, isLoading } = useProfile();
    const { data: homeData } = useHome();
    const updateProfile = useUpdateProfile();
    const logoutMutation = useLogout();
    const [isEditing, setIsEditing] = useState(!!fromRoleSelect || !!fromKyc);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const requestEmailVerify = useRequestEmailVerification();
    const confirmEmailVerify = useConfirmEmailVerification();

    // Check if KYC is verified (Aadhaar entity exists with VERIFIED status)
    const isKycVerified = !!(
        homeData?.kyc?.kyc_status &&
        homeData.kyc.kyc_status.some((e) => e.entity === 'AADHAAR' && e.status === 'VERIFIED')
    );

    useEffect(() => {
        if (selectedPhoto) {
            const url = URL.createObjectURL(selectedPhoto);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [selectedPhoto]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: profile ? {
            full_name: profile.full_name || '',
            email: profile.email || '',
            dob: profile.dob || '',
            gender: profile.gender || '',
            district: profile.district || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
            full_address: profile.full_address || '',
        } : undefined,
    });

    const onSubmit = async (data: ProfileFormData) => {
        try {
            setApiError(null);
            setSuccessMessage(null);
            await updateProfile.mutateAsync({
                full_name: data.full_name,
                email: data.email || undefined,
                photo: selectedPhoto || undefined,
                dob: data.dob || undefined,
                gender: data.gender || undefined,
                district: data.district || undefined,
                state: data.state || undefined,
                pincode: data.pincode || undefined,
                full_address: data.full_address || undefined,
            });
            setSelectedPhoto(null);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            // Auto hide success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Failed to update profile. Please try again.');
            }
        }
    };

    if (isLoading) return <Loader className="min-h-screen" />;

    const isFieldLocked = (fieldName: string) =>
        isKycVerified && KYC_LOCKED_FIELDS.includes(fieldName as typeof KYC_LOCKED_FIELDS[number]);

    const isPhotoLocked = false;

    const showFromLabel = fromRoleSelect || fromKyc;

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">
                    {fromKyc ? 'Complete Profile' : fromRoleSelect ? 'Complete Profile' : 'Profile'}
                </h1>
                {!isEditing && !showFromLabel && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3 group">
                    <div
                        className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ${isEditing && !isPhotoLocked ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                        onClick={() => isEditing && !isPhotoLocked && fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : profile?.photo ? (
                            <img src={profile.photo.startsWith('http') ? profile.photo : `${config.apiBaseUrl}${profile.photo}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                    </div>
                    {isEditing && !isPhotoLocked && (
                        <div
                            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3zM12 15a3 3 0 100-6 3 3 0 000 6z" />
                            </svg>
                        </div>
                    )}
                    {isEditing && isPhotoLocked && (
                        <div className="absolute bottom-0 right-0 bg-gray-400 text-white p-1.5 rounded-full shadow-md">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setSelectedPhoto(e.target.files[0]);
                        }}
                    />
                </div>
                <p className="text-sm font-semibold text-text-primary">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-text-muted">+91 {profile?.username}</p>
                {profile?.role && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {profile.role}
                        </span>
                        {profile.email_verification_status && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                                Verified
                            </span>
                        )}
                    </div>
                )}

                <div className="w-full max-w-xs mt-2">
                    <StatusMessage
                        type="success"
                        message={successMessage}
                        onDismiss={() => setSuccessMessage(null)}
                        autoDismiss={true}
                    />
                    <StatusMessage
                        type="error"
                        message={apiError}
                        onDismiss={() => setApiError(null)}
                    />
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            error={errors.full_name?.message}
                            disabled={isFieldLocked('full_name')}
                            className={isFieldLocked('full_name') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('full_name', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('full_name') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        error={errors.email?.message}
                        {...register('email', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />
                    <div className="relative">
                        <Input
                            label="Date of Birth"
                            type="date"
                            error={errors.dob?.message}
                            disabled={isFieldLocked('dob')}
                            className={isFieldLocked('dob') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('dob', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('dob') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Gender</label>
                        <select
                            className={`w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isFieldLocked('gender') ? 'bg-gray-50! text-text-muted! cursor-not-allowed' : ''}`}
                            disabled={isFieldLocked('gender')}
                            {...register('gender', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {isFieldLocked('gender') && (
                            <div className="absolute right-8 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            label="District"
                            placeholder="Enter district"
                            error={errors.district?.message}
                            disabled={isFieldLocked('district')}
                            className={isFieldLocked('district') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('district', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('district') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            label="State"
                            placeholder="Enter state"
                            error={errors.state?.message}
                            disabled={isFieldLocked('state')}
                            className={isFieldLocked('state') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('state', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('state') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <Input
                            label="Pincode"
                            placeholder="6-digit pincode"
                            maxLength={6}
                            inputMode="numeric"
                            error={errors.pincode?.message}
                            disabled={isFieldLocked('pincode')}
                            className={isFieldLocked('pincode') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('pincode', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('pincode') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <TextArea
                            label="Full Address"
                            placeholder="Enter your full address"
                            error={errors.full_address?.message}
                            disabled={isFieldLocked('full_address')}
                            rows={3}
                            className={isFieldLocked('full_address') ? 'bg-gray-50! text-text-muted!' : ''}
                            {...register('full_address', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        />
                        {isFieldLocked('full_address') && (
                            <div className="absolute right-3 top-9 group/tooltip">
                                <svg className="w-3.5 h-3.5 text-text-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-sm">
                                    Verified via Aadhaar
                                </span>
                            </div>
                        )}
                    </div>

                    {isKycVerified && (
                        <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                            <svg className="w-3.5 h-3.5 text-success" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            Fields marked with a lock icon are verified via Aadhaar and cannot be edited
                        </p>
                    )}

                    <div className="pt-2 space-y-3">
                        <Button type="submit" fullWidth size="lg" loading={updateProfile.isPending}>
                            Save Profile
                        </Button>
                        {!showFromLabel && (
                            <Button
                                type="button"
                                variant="ghost"
                                fullWidth
                                size="lg"
                                onClick={() => { setIsEditing(false); setSelectedPhoto(null); reset(); }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {[
                        { label: 'Email', value: profile?.email, isEmail: true },
                        { label: 'Date of Birth', value: profile?.dob },
                        { label: 'Gender', value: profile?.gender },
                        { label: 'District', value: profile?.district },
                        { label: 'State', value: profile?.state },
                        { label: 'Pincode', value: profile?.pincode },
                        { label: 'Full Address', value: profile?.full_address },
                    ].map((field) => (
                        <div key={field.label} className="border-b border-border">
                            <div className="flex items-start justify-between py-3">
                                <span className="text-sm text-text-muted shrink-0 mt-0.5">{field.label}</span>
                                <div className="flex flex-col items-end gap-2 text-right overflow-hidden ml-4">
                                    <span className="text-sm font-medium text-text-primary break-words leading-relaxed">
                                        {field.value || '—'}
                                    </span>
                                    {field.isEmail && field.value && !profile?.email_verification_status && !showEmailOtpInput && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    setApiError(null);
                                                    await requestEmailVerify.mutateAsync({ email: field.value as string });
                                                    setShowEmailOtpInput(true);
                                                } catch (err) {
                                                    setApiError(err instanceof ApiError ? err.message : 'Failed to send verification code');
                                                }
                                            }}
                                            disabled={requestEmailVerify.isPending}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            {requestEmailVerify.isPending ? 'Sending...' : 'Verify'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {field.isEmail && showEmailOtpInput && (
                                <div className="pb-4 pt-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            maxLength={6}
                                            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <Button
                                            size="sm"
                                            loading={confirmEmailVerify.isPending}
                                            onClick={async () => {
                                                try {
                                                    setApiError(null);
                                                    await confirmEmailVerify.mutateAsync({
                                                        email: field.value as string,
                                                        otp: emailOtp
                                                    });
                                                    setShowEmailOtpInput(false);
                                                    setEmailOtp('');
                                                    setSuccessMessage('Email verified successfully!');
                                                } catch (err) {
                                                    setApiError(err instanceof ApiError ? err.message : 'Invalid verification code');
                                                }
                                            }}
                                        >
                                            Confirm
                                        </Button>
                                        <button
                                            onClick={() => { setShowEmailOtpInput(false); setEmailOtp(''); }}
                                            className="text-xs text-text-muted hover:text-text-primary p-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-text-muted">An OTP has been sent to your email.</p>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="pt-4">
                        <Button
                            variant="outline"
                            fullWidth
                            size="lg"
                            onClick={() => logoutMutation.mutate()}
                            loading={logoutMutation.isPending}
                            className="!border-error !text-error hover:!bg-error/5"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
