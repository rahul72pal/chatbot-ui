import { apiClient } from '../utils/apiClient';

export const documentApi = {
  /**
   * Retrieves all documents uploaded for RAG vector search, filtered by chatbotId
   */
  getDocuments: async (chatbotId?: string) => {
    const path = chatbotId ? `/documents?chatbot_id=${encodeURIComponent(chatbotId)}` : '/documents';
    const res: any = await apiClient.get(path);
    return res.documents || [];
  },

  /**
   * Uploads a document file with chatbot association
   */
  uploadDocument: async (formData: FormData) => {
    return apiClient.post('/document/upload', formData);
  },

  /**
   * Deletes a document by ID (removes record from MongoDB and vector embeddings from Qdrant)
   */
  deleteDocument: async (documentId: string) => {
    return apiClient.delete(`/document/${documentId}`);
  }
};

export default documentApi;
