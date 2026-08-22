import { useContext } from 'react';
import { ChatbotContext, type ChatbotContextState } from '../context/ChatbotProvider';

export function useChatbot(): ChatbotContextState {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export default useChatbot;
