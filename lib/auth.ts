import apiFetch, { PRIMARY_BASE, PRIMARY_HOST, SECONDARY_HOST } from './api';

export const API_BASE_URL = PRIMARY_BASE;

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accord_token', token);
        document.cookie = `accord_token=${token}; path=/; max-age=2592000; SameSite=Strict`;
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accord_token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accord_token');
        document.cookie = 'accord_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

export const logout = () => {
    removeToken();
    window.location.href = '/login';
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const opts = { ...options, headers };

    // If the caller passed a full URL that contains legacy localhost:5000, rewrite to primary host
    if (typeof url === 'string' && url.startsWith('http') && url.includes('localhost:5000')) {
        url = url.replace(/https?:\/\/localhost:5000/, PRIMARY_HOST);
    }

    try {
        // If a relative path or primary base, use apiFetch to get fallback behavior
        if (!url.startsWith('http') || url.startsWith(PRIMARY_BASE) || url.startsWith(PRIMARY_HOST)) {
            // Convert relative paths to be apiFetch-friendly
            const path = url.startsWith('http') ? url.replace(PRIMARY_BASE, '') : url;
            const res = await apiFetch(path, opts);
            if (res.status === 401) logout();
            return res;
        }

        // Otherwise perform a direct fetch but fall back to secondary on network error
        try {
            const res = await fetch(url, opts);
            if (res.status === 401) logout();
            if (!res.ok && res.status >= 500) {
                // try secondary host
                const fallbackUrl = url.replace(PRIMARY_HOST, SECONDARY_HOST);
                return fetch(fallbackUrl, opts);
            }
            return res;
        } catch (err) {
            // try fallback host
            const fallbackUrl = url.replace(PRIMARY_HOST, SECONDARY_HOST);
            return fetch(fallbackUrl, opts);
        }
    } catch (err) {
        throw err;
    }
};
