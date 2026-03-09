import { useMutation } from '@tanstack/react-query';
import { selectRole } from './api';
import { updateUserRole } from '../../services/auth';
import type { RoleSelectPayload } from '../../types/api';

export function useSelectRole() {
    return useMutation({
        mutationFn: (data: RoleSelectPayload) => selectRole(data),
        onSuccess: (data) => {
            updateUserRole(data.role);
        },
        onError: () => {
            // No toast per user request
        },
    });
}
