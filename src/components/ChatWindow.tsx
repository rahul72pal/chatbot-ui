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
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden h-full shadow-lg">
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

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const context = useContext(ChatbotContext);

  // If already inside ChatbotProvider, render Inner window
  if (context) {
    return <ChatWindowInner onClose={props.onClose} />;
  }

  // Otherwise, wrap self in ChatbotProvider for standalone usage
  return (
    <ChatbotProvider
      chatbotId={props.chatbotId}
      name={props.name}
      welcomeMessage={props.welcomeMessage}
      themeColor={props.themeColor}
      avatar={props.avatar}
      position="right"
      bubbleStyle={props.bubbleStyle}
      interactive={props.interactive}
      showDebugToggle={props.showDebugToggle}
      onQueryExecuted={props.onQueryExecuted}
      defaultOpen={true}
    >
      <ChatWindowInner onClose={props.onClose} />
    </ChatbotProvider>
  );
};

export default ChatWindow;
