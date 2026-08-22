import React, { useContext } from 'react';
import { MessageSquare, Bot, HelpCircle, Headphones, ShoppingBag } from 'lucide-react';
import { ChatbotContext } from '../context/ChatbotProvider';

export interface ChatLauncherProps {
  onClick?: () => void;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({ onClick }) => {
  const context = useContext(ChatbotContext);
  
  const config = context?.config || {};
  const isOpen = context?.isOpen || false;
  const toggleChat = context?.toggleChat;

  const {
    themeColor = '#3525cd',
    avatar = 'support',
    position = 'right',
    bubbleStyle = 'rounded',
    showWelcomeTooltip = true,
    welcomeMessage = 'Hi! How can I help you today?'
  } = config;

  if (isOpen) return null;

  const getLauncherRadius = () => {
    if (bubbleStyle === 'pill') return 'rounded-full';
    if (bubbleStyle === 'square') return 'rounded-md';
    return 'rounded-2xl';
  };

  const getAvatarIcon = () => {
    if (avatar === 'faq' || avatar === 'quiz') return <HelpCircle className="w-6 h-6" />;
    if (avatar === 'sales' || avatar === 'shopping_bag') return <ShoppingBag className="w-6 h-6" />;
    if (avatar === 'headphones' || avatar === 'support') return <Headphones className="w-6 h-6" />;
    if (avatar === 'bot') return <Bot className="w-6 h-6" />;
    return <MessageSquare className="w-6 h-6" />;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (toggleChat) {
      toggleChat(true);
    }
  };

  return (
    <div className="relative flex flex-col items-end gap-3 select-none">
      {/* Floating Welcome Tooltip */}
      {showWelcomeTooltip && (
        <div
          className={`bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold border border-slate-200 relative pointer-events-none transition-all duration-200 animate-bounce ${
            position === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{ animationDuration: '3s' }}
        >
          {welcomeMessage}
          <div
            className={`absolute -bottom-1.5 w-3 h-3 bg-white border-r border-b border-slate-200 transform rotate-45 ${
              position === 'left' ? 'left-5' : 'right-5'
            }`}
          />
        </div>
      )}

      {/* Launcher Floating Button */}
      <button
        onClick={handleClick}
        className={`w-14 h-14 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 duration-150 text-white z-40 outline-none border-none ${getLauncherRadius()}`}
        style={{ backgroundColor: themeColor }}
        title="Open Chat Assistant"
        aria-label="Open Chat Assistant"
      >
        {getAvatarIcon()}
      </button>
    </div>
  );
};

export default ChatLauncher;
