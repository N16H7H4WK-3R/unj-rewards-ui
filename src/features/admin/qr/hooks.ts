import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQr, listQrCodes } from './api';
import { queryKeys } from '../../../lib/constants';
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
        },
        onError: () => {
            // No toast per user request
        },
    });
}
