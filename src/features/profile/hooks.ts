import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from './api';
import { queryKeys } from '../../lib/constants';
import { showToast } from '../../lib/toast';
import { ApiError } from '../../services/apiClient';
import { updateFullName } from '../../services/auth';
import type { ProfileUpdatePayload } from '../../types/api';

export function useProfile() {
    return useQuery({
        queryKey: queryKeys.profile(),
        queryFn: getProfile,
        staleTime: 60_000,
        retry: 2,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProfileUpdatePayload) => updateProfile(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
            queryClient.invalidateQueries({ queryKey: queryKeys.home() });
            if (data.full_name) updateFullName(data.full_name);
            showToast('Profile updated successfully', 'success');
        },
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to update profile';
            showToast(msg, 'error');
        },
    });
}
