import { apiClient } from '../../../services/apiClient';
import type { QRCreatePayload, QRListItem, PaginationResponse } from '../../../types/api';

export function createQr(data: QRCreatePayload) {
    return apiClient<QRListItem>('/api/v1/qr/admin/create', {
        method: 'POST',
        body: data,
    });
}

export function listQrCodes(page = 0, size = 20) {
    return apiClient<PaginationResponse<QRListItem>>(
        `/api/v1/qr/admin/list?page=${page}&size=${size}`,
    );
}
