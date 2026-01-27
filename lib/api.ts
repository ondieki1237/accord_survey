export const PRIMARY_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://survey.codewithseth.co.ke/api'
    : 'http://localhost:5090/api');

export const SECONDARY_BASE = process.env.NEXT_PUBLIC_SECONDARY_API_BASE || 'https://accord-survey.onrender.com/api';

export const PRIMARY_HOST = PRIMARY_BASE.replace(/\/api\/?$/, '');
export const SECONDARY_HOST = SECONDARY_BASE.replace(/\/api\/?$/, '');

function joinBase(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith('http')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// Try primary then fallback to secondary on network errors or 5xx responses
export async function apiFetch(pathOrUrl: string, options: RequestInit = {}) {
  const primaryUrl = joinBase(PRIMARY_BASE, pathOrUrl);
  const secondaryUrl = joinBase(SECONDARY_BASE, pathOrUrl);

  try {
    const res = await fetch(primaryUrl, options);
    if (!res.ok && res.status >= 500) {
      // try fallback
      const res2 = await fetch(secondaryUrl, options);
      return res2;
    }
    return res;
  } catch (err) {
    // network error -> try secondary
    try {
      const res2 = await fetch(secondaryUrl, options);
      return res2;
    } catch (err2) {
      throw err; // original error
    }
  }
}

export default apiFetch;
