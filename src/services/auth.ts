const TOKEN_KEYS = {
    ACCESS: 'unj_access_token',
    REFRESH: 'unj_refresh_token',
    USER_ROLE: 'unj_user_role',
    USERNAME: 'unj_username',
    FULL_NAME: 'unj_full_name',
} as const;

// In-memory token store (primary — more secure than localStorage)
let memoryTokens: {
    access: string | null;
    refresh: string | null;
    userRole: string | null;
    username: string | null;
    fullName: string | null;
} = {
    access: null,
    refresh: null,
    userRole: null,
    username: null,
    fullName: null,
};

// Hydrate from sessionStorage on init (survives page refresh within tab)
function hydrateFromStorage() {
    try {
        memoryTokens.access = sessionStorage.getItem(TOKEN_KEYS.ACCESS);
        memoryTokens.refresh = sessionStorage.getItem(TOKEN_KEYS.REFRESH);
        memoryTokens.userRole = sessionStorage.getItem(TOKEN_KEYS.USER_ROLE);
        memoryTokens.username = sessionStorage.getItem(TOKEN_KEYS.USERNAME);
        memoryTokens.fullName = sessionStorage.getItem(TOKEN_KEYS.FULL_NAME);
    } catch {
        // sessionStorage unavailable (private browsing etc.)
    }
}

hydrateFromStorage();

function persistToStorage() {
    try {
        if (memoryTokens.access) sessionStorage.setItem(TOKEN_KEYS.ACCESS, memoryTokens.access);
        else sessionStorage.removeItem(TOKEN_KEYS.ACCESS);

        if (memoryTokens.refresh) sessionStorage.setItem(TOKEN_KEYS.REFRESH, memoryTokens.refresh);
        else sessionStorage.removeItem(TOKEN_KEYS.REFRESH);

        if (memoryTokens.userRole) sessionStorage.setItem(TOKEN_KEYS.USER_ROLE, memoryTokens.userRole);
        else sessionStorage.removeItem(TOKEN_KEYS.USER_ROLE);

        if (memoryTokens.username) sessionStorage.setItem(TOKEN_KEYS.USERNAME, memoryTokens.username);
        else sessionStorage.removeItem(TOKEN_KEYS.USERNAME);

        if (memoryTokens.fullName) sessionStorage.setItem(TOKEN_KEYS.FULL_NAME, memoryTokens.fullName);
        else sessionStorage.removeItem(TOKEN_KEYS.FULL_NAME);
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

export function getFullName(): string | null {
    return memoryTokens.fullName;
}

export function setTokens(data: {
    access: string;
    refresh: string;
    user_role: string | null;
    username: string;
    full_name?: string;
}) {
    memoryTokens.access = data.access;
    memoryTokens.refresh = data.refresh;
    memoryTokens.userRole = data.user_role;
    memoryTokens.username = data.username;
    memoryTokens.fullName = data.full_name || null;
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

export function updateFullName(name: string) {
    memoryTokens.fullName = name;
    persistToStorage();
}

export function clearTokens() {
    memoryTokens = {
        access: null,
        refresh: null,
        userRole: null,
        username: null,
        fullName: null,
    };
    try {
        Object.values(TOKEN_KEYS).forEach((key) => sessionStorage.removeItem(key));
    } catch {
        // silent
    }
}

export function isAuthenticated(): boolean {
    return !!memoryTokens.access;
}
