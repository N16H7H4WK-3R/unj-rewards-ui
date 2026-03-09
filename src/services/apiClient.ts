import { config } from '../lib/config';
import {
    getAccessToken,
    getRefreshToken,
    updateTokensAfterRefresh,
    clearTokens,
} from './auth';
import type { ApiErrorResponse, RefreshResponse } from '../types/api';

class ApiError extends Error {
    errorCode: string;
    detail?: Record<string, string[]>;
    status: number;

    constructor(message: string, errorCode: string, status: number, detail?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiError';
        this.errorCode = errorCode;
        this.status = status;
        this.detail = detail;
    }
}

export { ApiError };

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${config.apiBaseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) return false;

        const json = await res.json();
        const data = json.data as RefreshResponse;
        updateTokensAfterRefresh(data);
        return true;
    } catch {
        return false;
    }
}

async function handleRefresh(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = attemptRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
    });

    return refreshPromise;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean;
    responseType?: 'json' | 'blob';
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = 'GET', body, headers = {}, auth = true, responseType = 'json' } = options;

    const fetchHeaders: Record<string, string> = {
        ...headers,
    };

    const isFormData = body instanceof FormData;
    const isJsonBody = body && !isFormData && (typeof body === 'object' || Array.isArray(body));

    if (isJsonBody) {
        fetchHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = getAccessToken();
        if (token) {
            fetchHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = `${config.apiBaseUrl}${endpoint}`;

    const requestBody = isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined);

    let res = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: requestBody,
    });

    // Handle 401 — try refresh once
    if (res.status === 401 && auth) {
        const refreshed = await handleRefresh();
        if (refreshed) {
            const newToken = getAccessToken();
            if (newToken) {
                fetchHeaders['Authorization'] = `Bearer ${newToken}`;
            }
            res = await fetch(url, {
                method,
                headers: fetchHeaders,
                body: requestBody,
            });
        } else {
            clearTokens();
            window.location.href = '/auth/phone';
            throw new ApiError('Session expired', 'session_expired', 401);
        }
    }

    if (!res.ok) {
        const json = await res.json().catch(() => null);
        const errResponse = json as ApiErrorResponse | null;

        // Extract error details from the nested structure or flat fallback
        const message = errResponse?.error?.message || (json as Record<string, unknown> | null)?.message as string || `Request failed with status ${res.status}`;
        const errorCode = errResponse?.error?.error_code || (json as Record<string, unknown> | null)?.error_code as string || 'unknown_error';
        const detail = errResponse?.error?.detail || (json as Record<string, unknown> | null)?.detail as Record<string, string[]>;

        throw new ApiError(
            message,
            errorCode,
            res.status,
            detail,
        );
    }

    if (responseType === 'blob') {
        return res.blob() as unknown as T;
    }

    const json = await res.json().catch(() => null);

    // Unwrap the ApiResponse wrapper — return data directly
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data as T;
    }

    return json as T;
}
