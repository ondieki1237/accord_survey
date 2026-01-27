export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        logout();
    }

    return res;
};
