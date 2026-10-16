import React, { useContext } from 'react';
import { ChatbotContext, ChatbotProvider } from '../context/ChatbotProvider';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export interface ChatWindowProps {
  chatbotId?: string;
  name?: string;
  welcomeMessage?: string;
  themeColor?: string;
  avatar?: string;
  bubbleStyle?: 'pill' | 'square' | 'rounded';
  interactive?: boolean;
  onQueryExecuted?: (query: string, results: any) => void;
  showDebugToggle?: boolean;
  onClose?: () => void;
}

const ChatWindowInner: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const context = useContext(ChatbotContext);
  if (!context) return null;

  const {
    config,
    messages,
    isStreaming,
    streamStatus,
    activeTool,
    debugMode,
    expandedCitations,
    sendMessage,
    clearChat,
    setDebugMode,
    toggleCitation
  } = context;

  return (
    <div className="flex-1 flex flex-col bg-[#080E1B] border border-[#1C2C4B] rounded-2xl overflow-hidden h-full shadow-2xl">
      <ChatHeader
        name={config.name}
        avatar={config.avatar}
        themeColor={config.themeColor}
        interactive={config.interactive}
        showDebugToggle={config.showDebugToggle}
        debugMode={debugMode}
        onSetDebugMode={setDebugMode}
        onClearChat={clearChat}
        onClose={onClose}
      />

      <MessageList
        messages={messages}
        bubbleStyle={config.bubbleStyle}
        themeColor={config.themeColor}
        debugMode={debugMode}
        isStreaming={isStreaming}
        streamStatus={streamStatus}
        activeTool={activeTool}
        expandedCitations={expandedCitations}
        onToggleCitation={toggleCitation}
      />

      <ChatInput
        onSend={sendMessage}
        interactive={config.interactive}
        isStreaming={isStreaming}
        themeColor={config.themeColor}
      />
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatbotId,
  name = 'Support Assistant',
  welcomeMessage = 'Hi! How can I help you today?',
  themeColor = '#4F46E5',
  avatar = 'support',
  bubbleStyle = 'rounded',
  interactive = true,
  onQueryExecuted,
  showDebugToggle = true,
  onClose
}) => {
  return (
    <ChatbotProvider
      chatbotId={chatbotId}
      name={name}
      welcomeMessage={welcomeMessage}
      themeColor={themeColor}
      avatar={avatar}
      bubbleStyle={bubbleStyle}
      interactive={interactive}
      showDebugToggle={showDebugToggle}
      onQueryExecuted={onQueryExecuted}
    >
      <ChatWindowInner onClose={onClose} />
    </ChatbotProvider>
  );
};

export default ChatWindow;
