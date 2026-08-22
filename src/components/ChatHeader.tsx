import React from 'react';
import { Bot, RefreshCw, HelpCircle, MessageSquare, Headphones, X } from 'lucide-react';

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
  themeColor = '#3525cd',
  interactive = true,
  showDebugToggle = true,
  debugMode = true,
  onSetDebugMode,
  onClearChat,
  onClose
}) => {
  const getAvatarIcon = () => {
    if (avatar === 'faq' || avatar === 'quiz') return <HelpCircle className="w-5 h-5" />;
    if (avatar === 'sales' || avatar === 'shopping_bag') return <MessageSquare className="w-5 h-5" />;
    if (avatar === 'headphones' || avatar === 'support') return <Headphones className="w-5 h-5" />;
    return <Bot className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xs"
          style={{ backgroundColor: themeColor }}
        >
          {getAvatarIcon()}
        </div>
        <div>
          <span className="font-bold text-slate-900 block leading-tight text-[15px]">{name}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Usually replies in minutes</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showDebugToggle && onSetDebugMode && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debug</span>
            <button
              onClick={() => onSetDebugMode(!debugMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                debugMode ? 'bg-indigo-500/20' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform ${
                  debugMode ? 'translate-x-4 shadow' : 'translate-x-1'
                }`}
                style={{ backgroundColor: debugMode ? themeColor : '#94a3b8' }}
              />
            </button>
          </div>
        )}
        {interactive && onClearChat && (
          <button
            onClick={onClearChat}
            className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
