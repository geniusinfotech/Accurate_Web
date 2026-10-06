import { ApiError as ApiErrorType } from '@/lib/types';

const RAW_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9010/api').trim().replace(/\/+$/, '');
const SERVER_URL = RAW_URL.replace(/\/api$/, '');
const API_URL = `${SERVER_URL}/api`;

function resolveEndpoint(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return clean.startsWith('/api/') ? `${SERVER_URL}${clean}` : `${API_URL}${clean}`;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * The API wraps every response as { statusCode, response, body } via the global
 * TransformInterceptor. Callers want the controller's actual return value, so
 * peel the envelope off. Sniffing for both keys (rather than a blind `.body`)
 * keeps this safe for any endpoint that legitimately returns a `body` field.
 */
function unwrap<T>(json: any): T {
  if (
    json &&
    typeof json === 'object' &&
    !Array.isArray(json) &&
    'body' in json &&
    'statusCode' in json
  ) {
    return json.body as T;
  }
  return json as T;
}

/** Pull a human-readable message out of the error envelope's several shapes. */
function errorMessage(data: any, fallback: string): string {
  const pick = (v: any): string | undefined => {
    if (typeof v === 'string' && v.trim()) return v;
    if (Array.isArray(v)) {
      // class-validator returns string[], backend filter wraps as [{message}]
      const parts = v
        .map((e) => (typeof e === 'string' ? e : e?.message))
        .filter((s) => typeof s === 'string' && s.trim());
      if (parts.length > 0) return parts.join(', ');
    }
    return undefined;
  };
  const candidate =
    pick(data?.body?.response?.message) ??
    pick(data?.body?.response) ??
    pick(data?.body?.message) ??
    pick(data?.response?.message) ??
    pick(data?.response) ??
    pick(data?.message);
  return candidate ?? fallback;
}

// The access cookie lives 1h; the refresh cookie 7d. On a 401, renew once and retry.
// One shared in-flight refresh so parallel requests don't each rotate the token.
let refreshing: Promise<boolean> | null = null;
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function authedFetch(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status !== 401 || /\/auth\/(login|register|refresh)\b/.test(url)) return res;
  return (await refreshSession()) ? fetch(url, init) : res;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await authedFetch(resolveEndpoint(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${SERVER_URL}. Is the backend running (port 9010)?`,
      0,
      null
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      errorMessage(errorData, `Request failed with status ${res.status}`),
      res.status,
      errorData
    );
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  return unwrap<T>(data);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(endpoint, options);
}

export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST'
): Promise<T> {
  let res: Response;
  try {
    res = await authedFetch(resolveEndpoint(endpoint), {
      method,
      body: formData,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${SERVER_URL}. Is the backend running (port 9010)?`,
      0,
      null
    );
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      errorMessage(errorData, `Upload failed with status ${res.status}`),
      res.status,
      errorData
    );
  }

  return unwrap(await res.json());
}

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/')) return `${SERVER_URL}${path}`;
  // Bare filenames (e.g. "compressed-123.png" stored by deals-offers,
  // testimonials) live under the static /uploads/ dir.
  return `${SERVER_URL}/uploads/${path}`;
}

export function getUploadUrl(path: string, folder?: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/')) return getImageUrl(path);
  // Bare filename + known subfolder (e.g. banners live in /uploads/banners/).
  if (folder) return `${SERVER_URL}/uploads/${folder}/${path}`;
  return getImageUrl(path);
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};