import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQr, listQrCodes } from './api';
import { queryKeys } from '../../../lib/constants';
import { showToast } from '../../../components/ui/Toast';
import { ApiError } from '../../../services/apiClient';
import type { QRCreatePayload } from '../../../types/api';

export function useAdminQrList(page = 0, size = 20) {
    return useQuery({
        queryKey: queryKeys.adminQrList(page, size),
        queryFn: () => listQrCodes(page, size),
        staleTime: 30_000,
        retry: 2,
    });
}

export function useAdminQrCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: QRCreatePayload) => createQr(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-qr-list'] });
            showToast('QR code created successfully', 'success');
        },
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to create QR code';
            showToast(msg, 'error');
        },
    });
}
