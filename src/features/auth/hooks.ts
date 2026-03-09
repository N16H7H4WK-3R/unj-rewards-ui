import { useMutation } from '@tanstack/react-query';
import { requestOtp, verifyOtp, logout } from './api';
import { adminLogin } from './adminApi';
import { setTokens, clearTokens } from '../../services/auth';
import type { OtpRequestPayload, LoginPayload } from '../../types/api';

export function useRequestOtp() {
    return useMutation({
        mutationFn: (data: OtpRequestPayload) => requestOtp(data),
        onError: () => {
            // No toast per user request
        },
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: (data: LoginPayload) => verifyOtp(data),
        onSuccess: (data) => {
            setTokens(data);
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

