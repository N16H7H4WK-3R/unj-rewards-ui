import type { KYCEntity } from '../types/api';

const TOKEN_KEYS = {
    ACCESS: 'access_token',
    REFRESH: 'refresh_token',
    USER_ROLE: 'user_role',
    USERNAME: 'username',
} as const;

// In-memory token store (primary — more secure than localStorage)
let memoryTokens: {
    access: string | null;
    refresh: string | null;
    userRole: string | null;
    username: string | null;
    fullName: string | null;
    kycStatus: KYCEntity[] | null;
} = {
    access: null,
    refresh: null,
    userRole: null,
    username: null,
    fullName: null,
    kycStatus: null,
};

// Hydrate from localStorage on init (survives page refresh and tab close)
function hydrateFromStorage() {
    try {
        memoryTokens.access = localStorage.getItem(TOKEN_KEYS.ACCESS);
        memoryTokens.refresh = localStorage.getItem(TOKEN_KEYS.REFRESH);
        memoryTokens.userRole = localStorage.getItem(TOKEN_KEYS.USER_ROLE);
        memoryTokens.username = localStorage.getItem(TOKEN_KEYS.USERNAME);
    } catch {
        // localStorage unavailable (private browsing etc.)
    }
}

hydrateFromStorage();

function persistToStorage() {
    try {
        if (memoryTokens.access) localStorage.setItem(TOKEN_KEYS.ACCESS, memoryTokens.access);
        else localStorage.removeItem(TOKEN_KEYS.ACCESS);

        if (memoryTokens.refresh) localStorage.setItem(TOKEN_KEYS.REFRESH, memoryTokens.refresh);
        else localStorage.removeItem(TOKEN_KEYS.REFRESH);

        if (memoryTokens.userRole) localStorage.setItem(TOKEN_KEYS.USER_ROLE, memoryTokens.userRole);
        else localStorage.removeItem(TOKEN_KEYS.USER_ROLE);

        if (memoryTokens.username) localStorage.setItem(TOKEN_KEYS.USERNAME, memoryTokens.username);
        else localStorage.removeItem(TOKEN_KEYS.USERNAME);
    } catch {
        // silent fail
    }
}

export function getAccessToken(): string | null {
    return memoryTokens.access;
}

export function getRefreshToken(): string | null {
    return memoryTokens.refresh;
}

export function getUserRole(): string | null {
    return memoryTokens.userRole;
}

export function getUsername(): string | null {
    return memoryTokens.username;
}


export function setTokens(data: {
    access: string;
    refresh: string;
    user_role: string | null;
    username: string;
    full_name?: string;
    kyc_status?: KYCEntity[];
}) {
    memoryTokens.access = data.access;
    memoryTokens.refresh = data.refresh;
    memoryTokens.userRole = data.user_role;
    memoryTokens.username = data.username;
    memoryTokens.fullName = data.full_name || null;
    memoryTokens.kycStatus = data.kyc_status || null;
    persistToStorage();
}

export function updateTokensAfterRefresh(data: { access: string; refresh: string }) {
    memoryTokens.access = data.access;
    memoryTokens.refresh = data.refresh;
    persistToStorage();
}

export function updateUserRole(role: string) {
    memoryTokens.userRole = role;
    persistToStorage();
}

export function clearTokens() {
    memoryTokens = {
        access: null,
        refresh: null,
        userRole: null,
        username: null,
        fullName: null,
        kycStatus: null,
    };
    try {
        Object.values(TOKEN_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch {
        // silent
    }
}

export function isAuthenticated(): boolean {
    return !!memoryTokens.access;
}
