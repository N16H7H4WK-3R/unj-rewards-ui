import { useMutation } from '@tanstack/react-query';
import { requestOtp, verifyOtp, logout } from './api';
import { setTokens, clearTokens } from '../../services/auth';
import { showToast } from '../../components/ui/Toast';
import type { UserRole, RequestFor, OtpRequestPayload, LoginPayload } from '../../types/api';
import { ApiError } from '../../services/apiClient';

export function useRequestOtp() {
    return useMutation({
        mutationFn: ({ role, requestFor, data }: {
            role: UserRole;
            requestFor: RequestFor;
            data: OtpRequestPayload;
        }) => requestOtp(role, requestFor, data),
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to send OTP';
            showToast(msg, 'error');
        },
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: ({ role, requestFor, data }: {
            role: UserRole;
            requestFor: RequestFor;
            data: LoginPayload;
        }) => verifyOtp(role, requestFor, data),
        onSuccess: (data) => {
            setTokens(data);
        },
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to verify OTP';
            showToast(msg, 'error');
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
