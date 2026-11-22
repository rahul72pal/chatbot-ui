import { apiClient, BASE_URL } from '../utils/apiClient';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SignupPayload {
  email: string;
  password?: string;
  full_name?: string;
}

export const authApi = {
  /**
   * Log in user with credentials
   */
  login: async (payload: LoginPayload) => {
    return apiClient.post('/auth/login', payload);
  },

  /**
   * Register a new account
   */
  signup: async (payload: SignupPayload) => {
    return apiClient.post('/auth/signup', payload);
  },

  /**
   * Get current authenticated user profile
   */
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Exchange a refresh token for a new access + refresh token pair.
   * Called automatically by the apiClient on 401; exposed for proactive use.
   */
  refresh: async (refresh_token: string) => {
    // Bypass apiClient so a failing refresh never triggers another refresh
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Refresh failed');
    }
    return data;
  }
};

export default authApi;
