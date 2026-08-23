import { apiClient } from '../utils/apiClient';

export interface AnalyticsOverview {
  user_id: string;
  limits: {
    max_chatbots: number;
    max_docs_per_chatbot: number;
    max_doc_size_mb: number;
  };
  totals: {
    chatbots: number;
    chatbots_limit: number;
    documents: number;
    conversations: number;
    messages: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  chatbots: Array<{
    id: string;
    name: string;
    role: string;
    is_public: boolean;
    doc_count: number;
    conversations_count: number;
    messages_count: number;
  }>;
  recent_activity: Array<{
    conversation_id: string;
    chatbot_id: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get('/analytics/overview');
    return response?.data || response;
  },
};
