import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceClick?: () => void;
  interactive?: boolean;
  isStreaming?: boolean;
  themeColor?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoiceClick,
  interactive = true,
  isStreaming = false,
  themeColor = '#4F46E5'
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
    <div className="p-3 border-t border-[#1C2C4B] bg-[#091121] flex-shrink-0">
      <div className="relative flex items-end">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!interactive}
          className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl py-2.5 pl-3.5 pr-20 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5] transition-all resize-none min-h-[44px] max-h-[140px]"
          placeholder={interactive ? 'Type a message or tap mic...' : 'Chat disabled in static preview'}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          {onVoiceClick && (
            <button
              type="button"
              onClick={onVoiceClick}
              disabled={!interactive || isStreaming}
              className="p-2 text-indigo-400 hover:text-white hover:bg-[#142342] rounded-lg transition-all shadow-sm flex items-center justify-center border border-indigo-500/30"
              title="Speak with Voice Agent"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!interactive || !inputText.trim() || isStreaming}
            className="p-2 text-white rounded-lg transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: themeColor }}
            title="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-[#71829F]">
        <span>Shift + Enter for new line</span>
        <span className="font-medium text-indigo-400">Powered by yourchatbot</span>
      </div>
    </div>
  );
};

export default ChatInput;
