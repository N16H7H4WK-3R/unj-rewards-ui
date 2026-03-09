import { apiClient } from '../../services/apiClient';
import type {
    QRValidateResponse,
    QRRedeemPayload,
    QRRedeemResponse,
    QRProcessResponse,
    QRCreatePayload,
    QRBatch,
    QRListItem,
    PaginationResponse,
    Product
} from '../../types/api';

export function validateQr(publicCode: string) {
    return apiClient<QRValidateResponse>(`/api/v1/qr/validate/${publicCode}`);
}

export function redeemQr(data: QRRedeemPayload) {
    return apiClient<QRRedeemResponse>('/api/v1/qr/redeem', {
        method: 'POST',
        body: data,
    });
}

export function processQr(code: string) {
    return apiClient<QRProcessResponse>(`/api/v1/qr/process?code=${encodeURIComponent(code)}`);
}

export function adminCreateQr(data: QRCreatePayload) {
    return apiClient<Blob>('/api/v1/qr/admin/create', {
        method: 'POST',
        body: data,
        responseType: 'blob', // Tell apiClient to return blob
    });
}

export function adminGetBatches() {
    return apiClient<QRBatch[]>('/api/v1/qr/admin/batches');
}

export function adminGetBatchDownload(batchId: string) {
    return apiClient<Blob>(`/api/v1/qr/admin/batch/${batchId}/download`, {
        responseType: 'blob',
    });
}

export function adminGetQrList(page: number = 0, size: number = 20) {
    return apiClient<PaginationResponse<QRListItem>>(`/api/v1/qr/admin/list?page=${page}&size=${size}`);
}

export function getProducts() {
    return apiClient<PaginationResponse<Product>>('/api/v1/admin/products/products');
}
