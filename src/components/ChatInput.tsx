import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  interactive?: boolean;
  isStreaming?: boolean;
  themeColor?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  interactive = true,
  isStreaming = false,
  themeColor = '#3525cd'
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim() || isStreaming || !interactive) return;
    onSend(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
      <div className="relative flex items-end shadow-xs">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!interactive}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[48px] max-h-[160px]"
          placeholder={interactive ? 'Type a message to test...' : 'Chat disabled in static preview'}
        />
        <button
          onClick={handleSend}
          disabled={!interactive || !inputText.trim() || isStreaming}
          className="absolute right-2.5 bottom-2.5 p-2 text-white rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          style={{ backgroundColor: themeColor }}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
        <span>Shift + Enter for new line</span>
        <span>Powered by yourchatbot</span>
      </div>
    </div>
  );
};

export default ChatInput;
