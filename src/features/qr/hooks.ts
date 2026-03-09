import { useMutation, useQuery } from '@tanstack/react-query';
import {
    validateQr,
    redeemQr,
    processQr,
    adminCreateQr,
    adminGetBatches,
    adminGetBatchDownload,
    adminGetQrList,
    getProducts
} from './api';
import { queryKeys } from '../../lib/constants';
import type { QRRedeemPayload, QRCreatePayload } from '../../types/api';

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
        onError: () => {
            // Toast removed per user request
        },
    });
}

export function useQrProcess() {
    return useMutation({
        mutationFn: (code: string) => processQr(code),
        onError: () => {
            // Toast removed per user request
        },
    });
}

export function useAdminCreateQr() {
    return useMutation({
        mutationFn: (data: QRCreatePayload) => adminCreateQr(data),
        onError: () => {
            // No toast per user request
        },
    });
}

export function useAdminBatches() {
    return useQuery({
        queryKey: queryKeys.adminQrBatches(),
        queryFn: adminGetBatches,
    });
}

export function useAdminBatchDownload() {
    return useMutation({
        mutationFn: (batchId: string) => adminGetBatchDownload(batchId),
        onError: () => {
            // Toast removed per user request
        },
    });
}

export function useAdminQrList(page: number, size: number) {
    return useQuery({
        queryKey: queryKeys.adminQrList(page, size),
        queryFn: () => adminGetQrList(page, size),
    });
}

export function useProducts() {
    return useQuery({
        queryKey: ['admin-products'],
        queryFn: getProducts,
    });
}
