import { apiClient } from '../../services/apiClient';
import type { Profile, ProfileUpdatePayload } from '../../types/api';

export function getProfile() {
    return apiClient<Profile>('/api/v1/profile');
}

export function updateProfile(data: ProfileUpdatePayload) {
    return apiClient<Profile>('/api/v1/profile', {
        method: 'PUT',
        body: data,
    });
}
