import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestOtp, verifyOtp, logout } from './api';
import { adminLogin } from './adminApi';
import { setTokens, clearTokens } from '../../services/auth';
import { queryKeys } from '../../lib/constants';
import type { OtpRequestPayload, LoginPayload, KYCStatus } from '../../types/api';

export function useRequestOtp() {
    return useMutation({
        mutationFn: (data: OtpRequestPayload) => requestOtp(data),
        onError: () => {
            // No toast per user request
        },
    });
}

export function useVerifyOtp() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: LoginPayload) => verifyOtp(data),
        onSuccess: (data) => {
            setTokens(data);
            // Seed KYC cache from login response so RequireKYC guard works instantly
            if (data.kyc_status) {
                queryClient.setQueryData<KYCStatus>(queryKeys.kycStatus(), {
                    kyc_status: data.kyc_status,
                    aadhaar_number: null,
                    pan_number: null,
                });
            }
        },
        onError: () => {
            // No toast per user request
        },
    });
}

export function useLogout() {
    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            clearTokens();
            window.location.href = '/auth/phone';
        },
    });
}

export function useAdminLogin() {
    return useMutation({
        mutationFn: (data: LoginPayload) => adminLogin(data),
        onSuccess: (data) => {
            setTokens(data);
        },
        onError: () => {
            // No toast per user request
        },
    });
}

