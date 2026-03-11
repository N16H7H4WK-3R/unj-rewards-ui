import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestAadhaarOtp, verifyAadhaarOtp, getKycStatus, verifyPanAadhaarLink } from './api';
import { queryKeys } from '../../lib/constants';
import type {
    KycOtpRequestPayload,
    KycOtpVerifyPayload,
    PanVerifyPayload,
} from '../../types/api';

export function useKycStatus() {
    return useQuery({
        queryKey: queryKeys.kycStatus(),
        queryFn: getKycStatus,
        staleTime: 60_000,
        retry: 2,
    });
}

export function useRequestAadhaarOtp() {
    return useMutation({
        mutationFn: (data: KycOtpRequestPayload) => requestAadhaarOtp(data),
    });
}

export function useVerifyAadhaarOtp() {
    return useMutation({
        mutationFn: (data: KycOtpVerifyPayload) => verifyAadhaarOtp(data),
    });
}

export function useVerifyPanAadhaarLink() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PanVerifyPayload) => verifyPanAadhaarLink(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.home() });
            queryClient.invalidateQueries({ queryKey: queryKeys.kycStatus() });
        },
    });
}
