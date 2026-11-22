export const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  body?: any;
  params?: Record<string, any>;
}

/* ------------------------- Token refresh machinery ------------------------- */

let refreshPromise: Promise<boolean> | null = null;

/**
 * Call POST /auth/refresh with the stored refresh token and persist the new
 * token pair. Returns true on success, false when the session must end.
 *
 * Single-flight: concurrent 401s share one in-flight refresh request.
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (!data?.access_token || !data?.refresh_token) return false;

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        // Allow the next expired session to trigger a fresh refresh
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

/**
 * Public wrapper so streaming/voice fetches outside apiClient can also
 * share the same single-flight refresh on a 401.
 */
export async function tryRefreshAccessToken(): Promise<boolean> {
  return refreshAccessToken();
}

/** Clear the session and send the user to the login page. */
function forceLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

/* ------------------------------ Core request ------------------------------ */

function buildFullPath(path: string, params?: Record<string, any>): string {
  let fullPath = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullPath += (fullPath.includes('?') ? '&' : '?') + queryString;
    }
  }
  return fullPath;
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers || {});

  // Set JSON headers by default unless uploading files
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function executeRequest(fullPath: string, options: RequestOptions): Promise<any> {
  const headers = buildHeaders(options);

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${fullPath}`, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || 'Request failed';
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data;
}

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const fullPath = buildFullPath(path, options.params);

  try {
    return await executeRequest(fullPath, options);
  } catch (error: any) {
    // On an expired access token (401), refresh once and retry the original request.
    // Never refresh for the auth endpoints themselves.
    const isAuthCall = fullPath.startsWith('/auth/login')
      || fullPath.startsWith('/auth/signup')
      || fullPath.startsWith('/auth/refresh');

    if (error?.status === 401 && !isAuthCall) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Rebuild headers so the retry carries the new access token
        return await executeRequest(fullPath, options);
      }

      // Refresh failed (token expired/revoked) — end the session
      forceLogout();
      throw new Error('Session expired. Please sign in again.');
    }

    throw error;
  }
}

export const apiClient = {
  get: (path: string, options?: RequestOptions) =>
    request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestOptions) =>
    request(path, { ...options, method: 'POST', body }),
  put: (path: string, body?: any, options?: RequestOptions) =>
    request(path, { ...options, method: 'PUT', body }),
  patch: (path: string, body?: any, options?: RequestOptions) =>
    request(path, { ...options, method: 'PATCH', body }),
  delete: (path: string, options?: RequestOptions) =>
    request(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
