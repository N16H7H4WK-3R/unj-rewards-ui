import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/constants';
import * as api from './api';

// ── Categories ──

export const useAdminCategories = (page = 0, size = 20) => {
    return useQuery({
        queryKey: queryKeys.adminCategories(page, size),
        queryFn: () => api.getAdminCategories(page, size),
    });
};

export const useCreateAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createAdminCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
    });
};

// ── Products ──

export const useAdminProducts = (page = 0, size = 20) => {
    return useQuery({
        queryKey: queryKeys.adminProducts(page, size),
        queryFn: () => api.getAdminProducts(page, size),
    });
};

export const useCreateAdminProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createAdminProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
    });
};

// ── Users ──

export const useAdminUsers = (role = 'Technician', page = 0, size = 20) => {
    return useQuery({
        queryKey: queryKeys.adminUsers(role, page, size),
        queryFn: () => api.getAdminUsers(role, page, size),
    });
};

export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
    });
};

// ── Transactions ──

export const useDebitUserWallet = () => {
    return useMutation({
        mutationFn: api.debitUserWallet,
    });
};
