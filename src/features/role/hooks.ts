import { useMutation } from '@tanstack/react-query';
import { selectRole } from './api';
import { updateUserRole } from '../../services/auth';
import { showToast } from '../../components/ui/Toast';
import { ApiError } from '../../services/apiClient';
import type { RoleSelectPayload } from '../../types/api';

export function useSelectRole() {
    return useMutation({
        mutationFn: (data: RoleSelectPayload) => selectRole(data),
        onSuccess: (data) => {
            updateUserRole(data.role);
            showToast('Role selected successfully', 'success');
        },
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to select role';
            showToast(msg, 'error');
        },
    });
}
