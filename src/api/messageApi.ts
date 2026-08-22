import { apiClient } from '../utils/apiClient';

export interface SendMessagePayload {
  message: string;
  conversation_id?: string | null;
  chatbot_id?: string | null;
}

export const messageApi = {
  /**
   * Posts a chat message to process through the backend AI model
   */
  sendMessage: async (payload: SendMessagePayload) => {
    return apiClient.post('/message', payload);
  },

  /**
   * Posts a chat message with streaming response (SSE events)
   */
  sendMessageStream: async (
    payload: SendMessagePayload,
    onEvent: (event: any) => void
  ) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const apiBase = 'http://localhost:8000';
    const response = await fetch(`${apiBase}/message/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            onEvent(data);
          } catch (e) {
            console.error('Error parsing SSE event', e);
          }
        }
      }
    }
  },

  /**
   * Retrieves conversation history and metadata by conversation ID
   */
  getConversationDetail: async (conversationId: string) => {
    return apiClient.get(`/conversation/${conversationId}`);
  },

  /**
   * Lists all active user conversations
   */
  getConversations: async () => {
    return apiClient.get('/conversation');
  },

  /**
   * Soft deletes a conversation by ID
   */
  deleteConversation: async (conversationId: string) => {
    return apiClient.delete(`/conversation/${conversationId}`);
  }
};

export default messageApi;
