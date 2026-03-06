import { apiClient } from '../../services/apiClient';
import type { QRValidateResponse, QRRedeemPayload, QRRedeemResponse } from '../../types/api';

export function validateQr(code: string) {
    return apiClient<QRValidateResponse>(`/api/v1/qr/validate/${code}`);
}

export function redeemQr(data: QRRedeemPayload) {
    return apiClient<QRRedeemResponse>('/api/v1/qr/redeem', {
        method: 'POST',
        body: data,
    });
}
