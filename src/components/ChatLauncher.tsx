import React, { useContext } from 'react';
import { MessageSquare, Bot, HelpCircle, Headphones, ShoppingBag, Mic } from 'lucide-react';
import { ChatbotContext } from '../context/ChatbotProvider';

export interface ChatLauncherProps {
  onClick?: () => void;
  onVoiceClick?: () => void;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({ onClick, onVoiceClick }) => {
  const context = useContext(ChatbotContext);

  const config = context?.config || {};
  const isOpen = context?.isOpen || false;
  const toggleChat = context?.toggleChat;
  const openWithMode = context?.openWithMode;

  const {
    themeColor = '#4F46E5',
    avatar = 'support',
    position = 'right',
    bubbleStyle = 'rounded',
    showWelcomeTooltip = true,
    welcomeMessage = 'Hi! How can I help you today?'
  } = config;

  if (isOpen) return null;

  const getLauncherRadius = () => {
    if (bubbleStyle === 'pill') return 'rounded-full';
    if (bubbleStyle === 'square') return 'rounded-xl';
    return 'rounded-2xl';
  };

  const getAvatarIcon = () => {
    if (avatar === 'faq' || avatar === 'quiz') return <HelpCircle className="w-6 h-6" />;
    if (avatar === 'sales' || avatar === 'shopping_bag') return <ShoppingBag className="w-6 h-6" />;
    if (avatar === 'headphones' || avatar === 'support') return <Headphones className="w-6 h-6" />;
    if (avatar === 'bot') return <Bot className="w-6 h-6" />;
    return <MessageSquare className="w-6 h-6" />;
  };

  const handleChatClick = () => {
    if (onClick) {
      onClick();
    } else if (openWithMode) {
      openWithMode('chat');
    } else if (toggleChat) {
      toggleChat(true);
    }
  };

  const handleVoiceClick = () => {
    if (onVoiceClick) {
      onVoiceClick();
    } else if (openWithMode) {
      openWithMode('voice');
    } else if (toggleChat) {
      toggleChat(true);
    }
  };

  return (
    <div className={`relative flex flex-col select-none ${position === 'left' ? 'items-start' : 'items-end'} gap-3`}>
      {/* Floating Welcome Tooltip */}
      {showWelcomeTooltip && (
        <div
          className={`bg-[#091121] text-[#F3F6FF] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold border border-[#1C2C4B] relative pointer-events-none transition-all duration-200 animate-bounce ${
            position === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{ animationDuration: '3s' }}
        >
          <div className="flex items-center gap-1.5">
            <span>{welcomeMessage}</span>
          </div>
          <div
            className={`absolute -bottom-1.5 w-3 h-3 bg-[#091121] border-r border-b border-[#1C2C4B] transform rotate-45 ${
              position === 'left' ? 'left-5' : 'right-5'
            }`}
          />
        </div>
      )}

      {/* Floating Launcher Action Group: Voice Trigger + Chat Trigger */}
      <div className="flex items-center gap-3">
        {/* Voice Agent Launcher Trigger */}
        <button
          onClick={handleVoiceClick}
          className="w-12 h-12 shadow-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 duration-200 text-white z-40 outline-none border border-white/20 relative group"
          title="Talk with Voice Agent"
          aria-label="Open Voice Agent"
        >
          <Mic className="w-5 h-5 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#091121]"></span>
          </span>
          {/* Hover Tooltip */}
          <span className="absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#091121] text-white text-[10px] font-bold px-2 py-1 rounded-md border border-[#1C2C4B] whitespace-nowrap pointer-events-none shadow-lg">
            Voice Agent
          </span>
        </button>

        {/* Primary Text Chatbot Launcher */}
        <button
          onClick={handleChatClick}
          className={`w-14 h-14 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 duration-150 text-white z-40 outline-none border-none relative group ${getLauncherRadius()}`}
          style={{ backgroundColor: themeColor }}
          title="Open Chat Assistant"
          aria-label="Open Chat Assistant"
        >
          {getAvatarIcon()}
          {/* Hover Tooltip */}
          <span className="absolute bottom-16 opacity-0 group-hover:opacity-100 transition-opacity bg-[#091121] text-white text-[10px] font-bold px-2 py-1 rounded-md border border-[#1C2C4B] whitespace-nowrap pointer-events-none shadow-lg">
            Text Chat
          </span>
        </button>
      </div>
    </div>
  );
};

export default ChatLauncher;
