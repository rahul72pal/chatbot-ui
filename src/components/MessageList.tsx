import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  bubbleStyle?: 'pill' | 'square' | 'rounded';
  themeColor?: string;
  debugMode?: boolean;
  isStreaming?: boolean;
  streamStatus?: string | null;
  activeTool?: string | null;
  expandedCitations?: Record<string, boolean>;
  onToggleCitation?: (msgId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  bubbleStyle = 'rounded',
  themeColor = '#3525cd',
  debugMode = false,
  isStreaming = false,
  streamStatus,
  activeTool,
  expandedCitations = {},
  onToggleCitation
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamStatus]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-slate-50">
      {messages.map((msg, index) => {
        const isLatestAI = msg.sender === 'assistant' && index === messages.length - 1;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            bubbleStyle={bubbleStyle}
            themeColor={themeColor}
            debugMode={debugMode}
            isStreaming={isStreaming}
            isLatestMessage={isLatestAI}
            expandedCitation={expandedCitations[msg.id]}
            onToggleCitation={onToggleCitation}
          >
            {isLatestAI && isStreaming && streamStatus && (
              <TypingIndicator status={streamStatus} activeTool={activeTool} />
            )}
          </MessageBubble>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
