export const PRIMARY_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://survey.codewithseth.co.ke/api';

export const PRIMARY_HOST = PRIMARY_BASE.replace(/\/api\/?$/, '');

function joinBase(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith('http')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// apiFetch: use configured PRIMARY_BASE by default, but when running in the browser
// during local development prefer the local backend to avoid cross-origin / HTTP2 issues.
export async function apiFetch(pathOrUrl: string, options: RequestInit = {}) {
  let base = PRIMARY_BASE;

  if (typeof window !== 'undefined') {
    try {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        // prefer a local API if available for development convenience
        base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5090/api';
      }
    } catch (e) {
      // ignore and fall back to PRIMARY_BASE
    }
  }

  const url = joinBase(base, pathOrUrl);
  const res = await fetch(url, options);
  return res;
}

export default apiFetch;
