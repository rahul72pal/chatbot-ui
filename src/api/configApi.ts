import { apiClient } from '../utils/apiClient';

export const configApi = {
  /**
   * Retrieves saved LLM configurations
   */
  getLLMConfigs: async () => {
    return apiClient.get('/llm-config');
  },

  /**
   * Retrieves LLM configuration status flag (llm_configured: boolean)
   */
  getLLMConfigStatus: async () => {
    return apiClient.get('/llm-config/status');
  },

  /**
   * Creates or saves an LLM configuration
   */
  saveLLMConfig: async (payload: any) => {
    return apiClient.post('/llm-config', payload);
  },

  /**
   * Updates an existing LLM configuration
   */
  updateLLMConfig: async (id: string, payload: any) => {
    return apiClient.put(`/llm-config/${id}`, payload);
  }
};

export default configApi;
