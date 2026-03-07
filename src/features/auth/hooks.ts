import { useMutation } from '@tanstack/react-query';
import { requestOtp, verifyOtp, logout } from './api';
import { adminLogin } from './adminApi';
import { setTokens, clearTokens } from '../../services/auth';
import { showToast } from '../../lib/toast';
import type { OtpRequestPayload, LoginPayload } from '../../types/api';
import { ApiError } from '../../services/apiClient';

export function useRequestOtp() {
    return useMutation({
        mutationFn: (data: OtpRequestPayload) => requestOtp(data),
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to send OTP';
            showToast(msg, 'error');
        },
    });
}

export function useVerifyOtp() {
    return useMutation({
        mutationFn: (data: LoginPayload) => verifyOtp(data),
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

export function useAdminLogin() {
    return useMutation({
        mutationFn: (data: LoginPayload) => adminLogin(data),
        onSuccess: (data) => {
            setTokens(data);
        },
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Login failed';
            showToast(msg, 'error');
        },
    });
}

