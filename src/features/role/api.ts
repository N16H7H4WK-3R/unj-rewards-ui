import { apiClient } from '../../services/apiClient';
import type { RoleSelectPayload, RoleSelectResponse } from '../../types/api';

export function selectRole(data: RoleSelectPayload) {
    return apiClient<RoleSelectResponse>('/api/v1/role/select', {
        method: 'POST',
        body: data,
    });
}
