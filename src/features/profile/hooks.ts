import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from './api';
import { queryKeys } from '../../lib/constants';
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
        },
        onError: () => {
            // No toast per user request
        },
    });
}
