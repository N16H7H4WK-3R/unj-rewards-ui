import { useQuery } from '@tanstack/react-query';
import { getWallet, getTransactions } from './api';
import { queryKeys } from '../../lib/constants';

export function useWallet() {
    return useQuery({
        queryKey: queryKeys.wallet(),
        queryFn: getWallet,
        staleTime: 30_000,
        retry: 2,
    });
}

export function useTransactions(page = 0, size = 20) {
    return useQuery({
        queryKey: queryKeys.transactions(page, size),
        queryFn: () => getTransactions(page, size),
        staleTime: 30_000,
        retry: 2,
    });
}
