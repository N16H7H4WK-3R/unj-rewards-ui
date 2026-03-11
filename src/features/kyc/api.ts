import { apiClient } from '../../services/apiClient';
import type {
    KycOtpRequestPayload,
    KycOtpRequestResponse,
    KycOtpVerifyPayload,
    KycOtpVerifyResponse,
    KYCStatus,
    PanVerifyPayload,
    PanVerifyResponse,
} from '../../types/api';

export function requestAadhaarOtp(data: KycOtpRequestPayload) {
    return apiClient<KycOtpRequestResponse>('/api/v1/kyc/aadhaar/request-otp/', {
        method: 'POST',
        body: data,
    });
}

export function verifyAadhaarOtp(data: KycOtpVerifyPayload) {
    return apiClient<KycOtpVerifyResponse>('/api/v1/kyc/aadhaar/verify-otp/', {
        method: 'POST',
        body: data,
    });
}

export function getKycStatus() {
    return apiClient<KYCStatus>('/api/v1/kyc/status');
}

export function verifyPanAadhaarLink(data: PanVerifyPayload) {
    return apiClient<PanVerifyResponse>('/api/v1/kyc/pan-aadhaar/verify/', {
        method: 'POST',
        body: data,
    });
}
