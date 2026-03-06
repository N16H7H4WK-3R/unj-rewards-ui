import { apiClient } from '../../services/apiClient';
import type { Wallet, TransactionsData } from '../../types/api';

export function getWallet() {
    return apiClient<Wallet>('/api/v1/wallet');
}

export function getTransactions(page = 0, size = 20) {
    return apiClient<TransactionsData>(
        `/api/v1/wallet/transactions?page=${page}&size=${size}`,
    );
}
