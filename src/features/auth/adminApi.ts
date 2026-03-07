import { apiClient } from '../../services/apiClient';
import type { AdminLoginResponse, LoginPayload } from '../../types/api';

export async function adminLogin(payload: LoginPayload): Promise<AdminLoginResponse> {
    return apiClient<AdminLoginResponse>('/api/auth/admin/login', {
        method: 'POST',
        body: payload,
        auth: false,
    });
}
