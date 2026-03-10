import { apiClient } from '../../services/apiClient';
import type {
    Profile,
    ProfileUpdatePayload,
    EmailVerificationRequestPayload,
    EmailVerificationConfirmPayload,
    MessageResponse
} from '../../types/api';

export function getProfile() {
    return apiClient<Profile>('/api/v1/profile');
}

export function updateProfile(data: ProfileUpdatePayload) {
    if (data.photo) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value instanceof File ? value : String(value));
            }
        });
        return apiClient<Profile>('/api/v1/profile', {
            method: 'PUT',
            body: formData,
        });
    }

    return apiClient<Profile>('/api/v1/profile', {
        method: 'PUT',
        body: data,
    });
}

export function requestEmailVerification(data: EmailVerificationRequestPayload) {
    return apiClient<MessageResponse>('/api/v1/profile/verify-email', {
        method: 'POST',
        body: data,
    });
}

export function confirmEmailVerification(data: EmailVerificationConfirmPayload) {
    return apiClient<MessageResponse>('/api/v1/profile/confirm-email', {
        method: 'POST',
        body: data,
    });
}
