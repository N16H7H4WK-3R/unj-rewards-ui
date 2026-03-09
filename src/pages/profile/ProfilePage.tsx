import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks';
import { useLogout } from '../../features/auth/hooks';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const location = useLocation();
    const fromRoleSelect = location.state?.fromRoleSelect;
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const logoutMutation = useLogout();
    const [isEditing, setIsEditing] = useState(!!fromRoleSelect);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-text-primary">
                    {fromRoleSelect ? 'Complete Profile' : 'Profile'}
                </h1>
                {!isEditing && !fromRoleSelect && (
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
                        className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ${isEditing ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                        onClick={() => isEditing && fileInputRef.current?.click()}
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
                    {isEditing && (
                        <div
                            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3zM12 15a3 3 0 100-6 3 3 0 000 6z" />
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
                    <span className="mt-1 px-3 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {profile.role}
                    </span>
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
                    <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        error={errors.full_name?.message}
                        {...register('full_name', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        error={errors.email?.message}
                        {...register('email', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />
                    <Input
                        label="Date of Birth"
                        type="date"
                        error={errors.dob?.message}
                        {...register('dob', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Gender</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            {...register('gender', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <Input
                        label="District"
                        placeholder="Enter district"
                        error={errors.district?.message}
                        {...register('district', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />
                    <Input
                        label="State"
                        placeholder="Enter state"
                        error={errors.state?.message}
                        {...register('state', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />
                    <Input
                        label="Pincode"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        inputMode="numeric"
                        error={errors.pincode?.message}
                        {...register('pincode', { onChange: () => { setApiError(null); setSuccessMessage(null); } })}
                    />

                    <div className="pt-2 space-y-3">
                        <Button type="submit" fullWidth size="lg" loading={updateProfile.isPending}>
                            Save Profile
                        </Button>
                        {!fromRoleSelect && (
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
                    {/* Profile fields display */}
                    {[
                        { label: 'Email', value: profile?.email },
                        { label: 'Date of Birth', value: profile?.dob },
                        { label: 'Gender', value: profile?.gender },
                        { label: 'District', value: profile?.district },
                        { label: 'State', value: profile?.state },
                        { label: 'Pincode', value: profile?.pincode },
                    ].map((field) => (
                        <div key={field.label} className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-sm text-text-muted">{field.label}</span>
                            <span className="text-sm font-medium text-text-primary">
                                {field.value || '—'}
                            </span>
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
