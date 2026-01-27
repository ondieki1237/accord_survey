export const PRIMARY_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://survey.codewithseth.co.ke/api';

export const PRIMARY_HOST = PRIMARY_BASE.replace(/\/api\/?$/, '');

function joinBase(base: string, path: string) {
  if (!path) return base;
  if (path.startsWith('http')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// Use only the configured primary backend
export async function apiFetch(pathOrUrl: string, options: RequestInit = {}) {
  const url = joinBase(PRIMARY_BASE, pathOrUrl);
  const res = await fetch(url, options);
  return res;
}

export default apiFetch;
