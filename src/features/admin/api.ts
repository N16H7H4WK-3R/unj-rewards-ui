import { apiClient } from '../../services/apiClient';
import type {
    Category,
    CategoryPayload,
    AdminProduct,
    AdminProductPayload,
    AdminUser,
    AdminUserPayload,
    DebitPayload,
    PaginationResponse,
} from '../../types/api';

// ── Categories ──

export const getAdminCategories = (page = 0, size = 20) =>
    apiClient<PaginationResponse<Category>>(`/api/v1/admin/products/categories?page=${page}&size=${size}`);

export const createAdminCategory = (payload: CategoryPayload) =>
    apiClient<{ message: string; category: Category }>('/api/v1/admin/products/categories', {
        method: 'POST',
        body: payload,
    });

// ── Products ──

export const getAdminProducts = (page = 0, size = 20) =>
    apiClient<PaginationResponse<AdminProduct>>(`/api/v1/admin/products/products?page=${page}&size=${size}`);

export const createAdminProduct = (payload: AdminProductPayload) =>
    apiClient<{ message: string; product: AdminProduct }>('/api/v1/admin/products/products', {
        method: 'POST',
        body: payload,
    });

// ── Users ──

export const getAdminUsers = (role = 'Technician', page = 0, size = 20) =>
    apiClient<PaginationResponse<AdminUser>>(`/api/v1/admin/account/users?role=${role}&page=${page}&size=${size}`);

export const createAdminUser = (payload: AdminUserPayload) =>
    apiClient<{ message: string; user: AdminUser }>('/api/v1/admin/account/users', {
        method: 'POST',
        body: payload,
    });

// ── Transactions ──

export const debitUserWallet = (payload: DebitPayload) =>
    apiClient<{ message: string }>('/api/v1/admin/transactions/debit', {
        method: 'POST',
        body: payload,
    });
