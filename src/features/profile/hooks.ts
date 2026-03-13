import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, requestEmailVerification, confirmEmailVerification } from './api';
import { queryKeys } from '../../lib/constants';
import type {
    ProfileUpdatePayload,
    EmailVerificationRequestPayload,
    EmailVerificationConfirmPayload
} from '../../types/api';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
            queryClient.invalidateQueries({ queryKey: queryKeys.home() });
        },
        onError: () => {
            // No toast per user request
        },
    });
}

export function useRequestEmailVerification() {
    return useMutation({
        mutationFn: (data: EmailVerificationRequestPayload) => requestEmailVerification(data),
    });
}

export function useConfirmEmailVerification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmailVerificationConfirmPayload) => confirmEmailVerification(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
        },
    });
}
