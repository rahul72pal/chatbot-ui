import React from 'react';
import { Bot, HelpCircle, MessageSquare, Headphones, X, RotateCcw } from 'lucide-react';

interface ChatHeaderProps {
  name?: string;
  avatar?: string;
  themeColor?: string;
  interactive?: boolean;
  showDebugToggle?: boolean;
  debugMode?: boolean;
  onSetDebugMode?: (val: boolean) => void;
  onClearChat?: () => void;
  onClose?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name = 'Support Assistant',
  avatar = 'support',
  themeColor = '#4F46E5',
  showDebugToggle = true,
  debugMode = true,
  onSetDebugMode,
  onClearChat,
  onClose
}) => {
  const getAvatarIcon = () => {
    if (avatar === 'faq' || avatar === 'quiz') return <HelpCircle className="w-4 h-4" />;
    if (avatar === 'sales' || avatar === 'shopping_bag') return <MessageSquare className="w-4 h-4" />;
    if (avatar === 'headphones' || avatar === 'support') return <Headphones className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#1C2C4B] bg-[#091121] flex-shrink-0">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: themeColor }}
        >
          {getAvatarIcon()}
        </div>
        <div>
          <span className="font-bold text-[#F3F6FF] block leading-tight text-xs">{name}</span>
          <span className="text-[10px] text-[#71829F] mt-0.5 block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse" />
            AI Assistant Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onClearChat && (
          <button
            onClick={onClearChat}
            className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {showDebugToggle && onSetDebugMode && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Debug</span>
            <button
              onClick={() => onSetDebugMode(!debugMode)}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${
                debugMode ? 'bg-[#4F46E5]' : 'bg-[#142342]'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                  debugMode ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
