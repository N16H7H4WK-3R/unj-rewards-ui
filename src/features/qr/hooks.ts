import { useMutation, useQuery } from '@tanstack/react-query';
import { validateQr, redeemQr } from './api';
import { queryKeys } from '../../lib/constants';
import { showToast } from '../../components/ui/Toast';
import { ApiError } from '../../services/apiClient';
import type { QRRedeemPayload } from '../../types/api';

export function useQrValidate(code: string | null) {
    return useQuery({
        queryKey: queryKeys.qrValidate(code ?? ''),
        queryFn: () => validateQr(code!),
        enabled: !!code && code.length > 0,
        retry: false,
        staleTime: 0,
    });
}

export function useQrRedeem() {
    return useMutation({
        mutationFn: (data: QRRedeemPayload) => redeemQr(data),
        onError: (error: Error) => {
            const msg = error instanceof ApiError ? error.message : 'Failed to redeem QR code';
            showToast(msg, 'error');
        },
    });
}
