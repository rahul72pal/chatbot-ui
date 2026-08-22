import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { useChatStream } from '../hooks/useChatStream';

export interface ChatbotConfig {
  chatbotId?: string;
  name?: string;
  welcomeMessage?: string;
  themeColor?: string;
  avatar?: string;
  position?: 'left' | 'right';
  bubbleStyle?: 'pill' | 'square' | 'rounded';
  interactive?: boolean;
  showDebugToggle?: boolean;
  showWelcomeTooltip?: boolean;
  onQueryExecuted?: (query: string, results: any) => void;
}

export interface ChatbotContextState {
  config: ChatbotConfig;
  messages: Message[];
  isOpen: boolean;
  isStreaming: boolean;
  streamStatus: string | null;
  activeTool: string | null;
  debugMode: boolean;
  expandedCitations: Record<string, boolean>;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  toggleChat: (show?: boolean) => void;
  setDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCitation: (msgId: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ChatbotContext = createContext<ChatbotContextState | null>(null);

export interface ChatbotProviderProps extends ChatbotConfig {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  chatbotId = '',
  name = 'Support Assistant',
  welcomeMessage = 'Hi! How can I help you today?',
  themeColor = '#3525cd',
  avatar = 'support_agent',
  position = 'right',
  bubbleStyle = 'rounded',
  interactive = true,
  showDebugToggle = true,
  showWelcomeTooltip = true,
  defaultOpen = false,
  onQueryExecuted
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugMode, setDebugMode] = useState(true);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  const {
    streamStatus,
    activeTool,
    isStreaming,
    sendStreamMessage,
    resetStreamState
  } = useChatStream({ chatbotId, interactive, onQueryExecuted });

  // Initialize messages with welcome message when welcomeMessage changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content: welcomeMessage,
        timestamp: 'Just now'
      }
    ]);
  }, [welcomeMessage]);

  const clearChat = useCallback(() => {
    resetStreamState();
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content: welcomeMessage,
        timestamp: 'Just now'
      }
    ]);
  }, [welcomeMessage, resetStreamState]);

  const toggleChat = useCallback((show?: boolean) => {
    setIsOpen(prev => (typeof show === 'boolean' ? show : !prev));
  }, []);

  const toggleCitation = useCallback((msgId: string) => {
    setExpandedCitations(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming || !interactive) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        sender: 'user',
        content: text,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, userMessage]);
      sendStreamMessage(text, setMessages);
    },
    [interactive, isStreaming, sendStreamMessage]
  );

  const config: ChatbotConfig = {
    chatbotId,
    name,
    welcomeMessage,
    themeColor,
    avatar,
    position,
    bubbleStyle,
    interactive,
    showDebugToggle,
    showWelcomeTooltip,
    onQueryExecuted
  };

  const value: ChatbotContextState = {
    config,
    messages,
    isOpen,
    isStreaming,
    streamStatus,
    activeTool,
    debugMode,
    expandedCitations,
    sendMessage,
    clearChat,
    toggleChat,
    setDebugMode,
    toggleCitation,
    setMessages
  };

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
};

export default ChatbotProvider;
