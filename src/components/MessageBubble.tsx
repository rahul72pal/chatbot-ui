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
  children?: React.ReactNode; // For rendering TypingIndicator inside AI bubble if needed
}

// Markdown formatter component for rich text rendering inside MessageBubble
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
              <li key={i} className="text-slate-800 leading-relaxed">
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
          return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        flushList(`line-${index}`);
        elements.push(
          <h3 key={index} className="font-bold text-[15px] text-slate-900 mt-2 mb-1">
            {parseInlineFormatting(trimmed.slice(4))}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(`line-${index}`);
        elements.push(
          <h2 key={index} className="font-bold text-[16px] text-slate-900 mt-3 mb-1">
            {parseInlineFormatting(trimmed.slice(3))}
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        flushList(`line-${index}`);
        elements.push(
          <h1 key={index} className="font-bold text-[17px] text-slate-900 mt-3 mb-1">
            {parseInlineFormatting(trimmed.slice(2))}
          </h1>
        );
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        listItems.push(trimmed.slice(2));
      } else if (trimmed === '') {
        flushList(`line-${index}`);
        elements.push(<div key={index} className="h-2" />);
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

  return <div className="space-y-1 text-slate-800 font-sans">{renderFormattedText(content)}</div>;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  bubbleStyle = 'rounded',
  themeColor = '#3525cd',
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
          className={`bg-white border border-slate-200 p-4 ${bubbleRadius} ${
            bubbleStyle === 'rounded' ? 'rounded-tl-xs' : ''
          } shadow-xs flex flex-col gap-3 w-full text-slate-800`}
        >
          {children}

          {/* Sources / Citations Indicator */}
          {debugMode && message.sources && message.sources.length > 0 && (
            <div>
              <button
                onClick={() => onToggleCitation && onToggleCitation(message.id)}
                className="flex items-center gap-1.5 text-[12px] font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                {message.sources.length} sources used
                {expandedCitation ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Sources Panel Dropdown */}
              {expandedCitation && (
                <div className="flex flex-col gap-1.5 mt-2 pl-3 border-l-2 border-indigo-400">
                  {message.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>
                        {src.title} {src.page ? `(page ${src.page})` : ''}
                      </span>
                      <span className="text-slate-400">
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
            <div className="text-[14px] text-slate-800 leading-relaxed font-sans">
              <MarkdownMessage content={message.content} />
            </div>
          )}

          {/* Debug/Meta Footer */}
          {debugMode && (message.tokens || message.latency) && (
            <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-3">
                {message.tokens && (
                  <span>
                    Tokens: {message.tokens.in} in / {message.tokens.out} out
                  </span>
                )}
                {message.latency && <span>Latency: {message.latency}s</span>}
              </div>
              <div className="flex gap-2">
                <button className="hover:text-indigo-600 text-slate-400 transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button className="hover:text-red-600 text-slate-400 transition-colors">
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
          } shadow-xs max-w-full`}
          style={{ backgroundColor: themeColor }}
        >
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      )}
      <span className="text-[10px] text-slate-400 px-1">{message.timestamp}</span>
    </div>
  );
};

export default MessageBubble;
