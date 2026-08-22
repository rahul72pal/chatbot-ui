const BASE_URL = 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  body?: any;
  params?: Record<string, any>;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('access_token');
  
  let fullPath = path;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullPath += (fullPath.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(options.headers || {});
  
  // Set JSON headers by default unless uploading files
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

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
    // If unauthorized, we can optionally clear token
    if (response.status === 401) {
      localStorage.removeItem('access_token');
    }
    const errorMessage = data?.detail || data?.message || 'Request failed';
    throw new Error(errorMessage);
  }

  return data;
}

export const apiClient = {
  get: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestOptions) => 
    request(path, { ...options, method: 'POST', body }),
  put: (path: string, body?: any, options?: RequestOptions) => 
    request(path, { ...options, method: 'PUT', body }),
  delete: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
