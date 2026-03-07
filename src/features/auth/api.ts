import { apiClient } from '../../services/apiClient';
import type {
    OtpRequestPayload,
    OtpRequestResponse,
    LoginPayload,
    LoginResponse,
    LogoutResponse,
} from '../../types/api';

export function requestOtp(data: OtpRequestPayload) {
    return apiClient<OtpRequestResponse>(
        '/api/auth/technician/login/otp',
        { method: 'POST', body: data, auth: false },
    );
}

export function verifyOtp(data: LoginPayload) {
    return apiClient<LoginResponse>(
        '/api/auth/technician/login',
        { method: 'POST', body: data, auth: false },
    );
}

export function logout() {
    return apiClient<LogoutResponse>('/api/auth/logout', { method: 'POST' });
}

