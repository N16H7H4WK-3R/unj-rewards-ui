import { apiClient } from '../../services/apiClient';
import type {
    OtpRequestPayload,
    OtpRequestResponse,
    LoginPayload,
    LoginResponse,
    LogoutResponse,
    UserRole,
    RequestFor,
} from '../../types/api';

export function requestOtp(role: UserRole, requestFor: RequestFor, data: OtpRequestPayload) {
    return apiClient<OtpRequestResponse>(
        `/api/auth/${role}/${requestFor}/otp`,
        { method: 'POST', body: data, auth: false },
    );
}

export function verifyOtp(role: UserRole, requestFor: RequestFor, data: LoginPayload) {
    return apiClient<LoginResponse>(
        `/api/auth/${role}/${requestFor}`,
        { method: 'POST', body: data, auth: false },
    );
}

export function logout() {
    return apiClient<LogoutResponse>('/api/auth/logout', { method: 'POST' });
}
