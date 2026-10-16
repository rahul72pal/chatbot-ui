import React from 'react';
import { FileText, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  bubbleStyle?: 'pill' | 'square' | 'rounded';
  themeColor?: string;
  debugMode?: boolean;
  isStreaming?: boolean;
  isLatestMessage?: boolean;
  expandedCitation?: boolean;
  onToggleCitation?: (id: string) => void;
  typingStatus?: string | null;
  activeTool?: string | null;
  children?: React.ReactNode;
}

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (keyPrefix: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-list`} className="list-disc list-inside space-y-1 my-1.5 pl-1">
            {listItems.map((item, i) => (
              <li key={i} className="text-[#F3F6FF] leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const parseInlineFormatting = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-bold text-[#F3F6FF]">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="bg-[#080E1B] px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300 border border-[#1C2C4B]">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        flushList(`line-${index}`);
        elements.push(
          <h3 key={index} className="font-bold text-[14px] text-[#F3F6FF] mt-2 mb-1">
            {parseInlineFormatting(trimmed.slice(4))}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(`line-${index}`);
        elements.push(
          <h2 key={index} className="font-bold text-[15px] text-[#F3F6FF] mt-2.5 mb-1">
            {parseInlineFormatting(trimmed.slice(3))}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList(`line-${index}`);
        elements.push(
          <h1 key={index} className="font-bold text-[16px] text-[#F3F6FF] mt-3 mb-1">
            {parseInlineFormatting(trimmed.slice(2))}
          </h1>
        );
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        listItems.push(trimmed.slice(2));
      } else if (trimmed === '') {
        flushList(`line-${index}`);
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        flushList(`line-${index}`);
        elements.push(
          <p key={index} className="leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    });

    flushList('final');
    return elements;
  };

  return <div className="space-y-1 text-[#F3F6FF] font-sans">{renderFormattedText(content)}</div>;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  bubbleStyle = 'rounded',
  themeColor = '#4F46E5',
  debugMode = false,
  expandedCitation = false,
  onToggleCitation,
  children
}) => {
  const isAI = message.sender === 'assistant';

  const getBubbleRadius = () => {
    if (bubbleStyle === 'pill') return 'rounded-[20px]';
    if (bubbleStyle === 'square') return 'rounded-sm';
    return 'rounded-xl';
  };

  const bubbleRadius = getBubbleRadius();

  return (
    <div
      className={`flex flex-col gap-1.5 max-w-[85%] ${
        isAI ? 'mr-auto items-start' : 'ml-auto items-end w-full'
      }`}
    >
      {isAI ? (
        // Assistant Message Bubble
        <div
          className={`bg-[#101D39] border border-[#1C2C4B] p-4 ${bubbleRadius} ${
            bubbleStyle === 'rounded' ? 'rounded-tl-xs' : ''
          } shadow-sm flex flex-col gap-2.5 w-full text-[#F3F6FF]`}
        >
          {children}

          {/* Sources / Citations Indicator */}
          {debugMode && message.sources && message.sources.length > 0 && (
            <div>
              <button
                onClick={() => onToggleCitation && onToggleCitation(message.id)}
                className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 bg-[#142342] hover:bg-[#1C2C4B] px-2.5 py-1 rounded-lg border border-[#243653] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {message.sources.length} sources used
                {expandedCitation ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Sources Panel Dropdown */}
              {expandedCitation && (
                <div className="flex flex-col gap-1 mt-2 pl-3 border-l-2 border-indigo-400">
                  {message.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-[#A3B3CF] hover:text-white cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>
                        {src.title} {src.page ? `(page ${src.page})` : ''}
                      </span>
                      <span className="text-[#71829F]">
                        ({src.score ? `score: ${src.score}` : ''})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          {message.content && (
            <div className="text-[13px] leading-relaxed font-sans">
              <MarkdownMessage content={message.content} />
            </div>
          )}

          {/* Debug/Meta Footer */}
          {debugMode && (message.tokens || message.latency) && (
            <div className="mt-1 pt-2 border-t border-[#1C2C4B] flex items-center justify-between text-[10px] font-mono text-[#71829F]">
              <div className="flex items-center gap-3">
                {message.tokens && (
                  <span>
                    Tokens: {message.tokens.in} in / {message.tokens.out} out
                  </span>
                )}
                {message.latency && <span>Latency: {message.latency}s</span>}
              </div>
              <div className="flex gap-2">
                <button className="hover:text-indigo-400 text-[#71829F] transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button className="hover:text-[#FB7185] text-[#71829F] transition-colors">
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // User Message Bubble
        <div
          className={`text-white p-3.5 ${bubbleRadius} ${
            bubbleStyle === 'rounded' ? 'rounded-tr-xs' : ''
          } shadow-sm max-w-full`}
          style={{ 
            background: themeColor && themeColor !== '#6366F1' 
              ? themeColor 
              : 'linear-gradient(110deg, #4F46E5 0%, #7C3AED 100%)' 
          }}
        >
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      )}
      <span className="text-[10px] text-[#71829F] px-1">{message.timestamp}</span>
    </div>
  );
};

export default MessageBubble;
