import React, { useContext } from 'react';
import { ChatbotProvider, ChatbotContext, type ChatbotConfig } from '../context/ChatbotProvider';
import ChatLauncher from './ChatLauncher';
import ChatWindow from './ChatWindow';

export interface ChatWidgetProps extends ChatbotConfig {
  defaultOpen?: boolean;
}

const ChatWidgetContent: React.FC = () => {
  const context = useContext(ChatbotContext);
  if (!context) return null;

  const { isOpen, toggleChat, config } = context;
  const position = config.position || 'right';

  return (
    <div
      className={`fixed bottom-6 z-[99999] flex flex-col items-end gap-3 transition-all duration-300 w-[90%] sm:w-85 md:w-[380px] ${
        position === 'left' ? 'left-6 items-start' : 'right-6 items-end'
      }`}
    >
      {isOpen ? (
        <div className="w-full h-[540px] max-h-[calc(100vh-100px)] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 bg-white animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ChatWindow onClose={() => toggleChat(false)} />
        </div>
      ) : (
        <ChatLauncher />
      )}
    </div>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = (props) => {
  return (
    <ChatbotProvider {...props}>
      <ChatWidgetContent />
    </ChatbotProvider>
  );
};

export default ChatWidget;
