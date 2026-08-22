import { apiClient } from '../utils/apiClient';

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
  }
};

export default authApi;
