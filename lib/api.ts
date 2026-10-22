const RAW_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9010/api').trim().replace(/\/+$/, '');
const SERVER_URL = RAW_URL.replace(/\/api$/, '');
const API_URL = `${SERVER_URL}/api`;

function resolveEndpoint(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return clean.startsWith('/api/') ? `${SERVER_URL}${clean}` : `${API_URL}${clean}`;
}

function unwrap<T>(data: any): T {
  return data?.statusCode !== undefined && 'body' in data ? data.body : data;
}

export const api = {
  get: async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(resolveEndpoint(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`API GET request to ${endpoint} failed with status ${res.status}`);
    }
    return unwrap<T>(await res.json());
  },

  post: async <T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> => {
    const res = await fetch(resolveEndpoint(endpoint), {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`API POST request to ${endpoint} failed with status ${res.status}`);
    }
    return unwrap<T>(await res.json());
  },
};

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/images/')) return path;
  if (path.startsWith('/')) return `${SERVER_URL}${path}`;
  // Bare filenames (e.g. "compressed-123.png" stored by deals-offers,
  // testimonials) live under the static /uploads/ dir.
  return `${SERVER_URL}/uploads/${path}`;
}

export function getUploadUrl(path?: string, folder?: string): string {
  if (!path) return `${API_URL}/upload/image`;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/images/')) return getImageUrl(path);
  if (path.startsWith('/')) return getImageUrl(path);
  // Bare filename + known subfolder (e.g. banners live in /uploads/banners/).
  if (folder) return `${SERVER_URL}/uploads/${folder}/${path}`;
  return getImageUrl(path);
}

// Server-side API client for server components
export async function getServerApiClientInstance() {
  return {
    get: async (endpoint: string) => {
      const res = await fetch(resolveEndpoint(endpoint), {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
      return unwrap(await res.json());
    },
    post: async (endpoint: string, body: any) => {
      const res = await fetch(resolveEndpoint(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
      return unwrap(await res.json());
    },
  };
}
