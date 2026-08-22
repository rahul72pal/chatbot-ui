import { apiClient } from '../utils/apiClient';

export interface ChatbotPayload {
  name: string;
  description?: string;
  welcome_message?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  is_public?: boolean;
  theme_color?: string;
  avatar_icon?: string;
  avatar_url?: string;
  position?: 'left' | 'right';
  bubble_style?: 'pill' | 'square' | 'rounded';
  open_automatically?: boolean;
  pop_after_seconds?: number;
  show_welcome_tooltip?: boolean;
}

export const chatbotApi = {
  /**
   * Retrieves all custom chatbots owned by the user
   */
  getChatbots: async () => {
    return apiClient.get('/chatbot');
  },

  /**
   * Retrieves aggregated dashboard & chatbot statistics metrics
   */
  getDashboardStats: async () => {
    return apiClient.get('/chatbot/stats/summary');
  },


  /**
   * Retrieves a single chatbot by ID (authenticated)
   */
  getChatbot: async (chatbotId: string) => {
    return apiClient.get(`/chatbot/${chatbotId}`);
  },

  /**
   * Retrieves public details of a chatbot (unauthenticated)
   */
  getPublicChatbot: async (chatbotId: string) => {
    return apiClient.get(`/chatbot/public/${chatbotId}`);
  },

  /**
   * Registers a new custom chatbot
   */
  createChatbot: async (payload: ChatbotPayload) => {
    return apiClient.post('/chatbot', payload);
  },

  /**
   * Updates an existing chatbot by ID
   */
  updateChatbot: async (chatbotId: string, payload: ChatbotPayload) => {
    return apiClient.put(`/chatbot/${chatbotId}`, payload);
  },

  /**
   * Deletes a chatbot by ID
   */
  deleteChatbot: async (chatbotId: string) => {
    return apiClient.delete(`/chatbot/${chatbotId}`);
  },

  /**
   * Sends a message to the public widget chat endpoint
   */
  sendPublicChatMessage: async (chatbotId: string, payload: { message: string; history?: any[] }) => {
    return apiClient.post(`/chatbot/public/${chatbotId}/chat`, payload);
  }
};

export default chatbotApi;
