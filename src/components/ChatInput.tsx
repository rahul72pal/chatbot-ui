import React, { useState } from 'react';
import { Send, Mic, Sparkles, MessageSquare } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceClick?: () => void;
  interactive?: boolean;
  isStreaming?: boolean;
  themeColor?: string;
  suggestedPrompts?: string[];
  showFloatingPrompts?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoiceClick,
  interactive = true,
  isStreaming = false,
  themeColor = '#4F46E5',
  suggestedPrompts = [],
  showFloatingPrompts = true
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim() || isStreaming || !interactive) return;
    onSend(inputText);
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    if (!interactive || isStreaming || !prompt.trim()) return;
    onSend(prompt.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activePrompts = (suggestedPrompts || []).filter(p => p && p.trim().length > 0);

  return (
    <div className="p-3 border-t border-[#1C2C4B] bg-[#091121] flex-shrink-0 relative">
      {/* Floating Prompt Suggestions over Input Field */}
      {showFloatingPrompts && activePrompts.length > 0 && (
        <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1 flex-shrink-0 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 shadow-sm select-none">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
              Floating Prompts
            </span>
            {activePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(prompt)}
                disabled={!interactive || isStreaming}
                title={`Click to send: "${prompt}"`}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-[#101D39]/95 hover:bg-[#152549] text-[#E0E7FF] hover:text-white border border-[#243653] hover:border-indigo-500/70 transition-all duration-200 shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group backdrop-blur-md"
              >
                <MessageSquare className="w-3 h-3 text-indigo-400 group-hover:text-cyan-300 transition-colors flex-shrink-0" />
                <span className="truncate max-w-[220px] font-medium">{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex items-end">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!interactive}
          className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl py-2.5 pl-3.5 pr-20 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5] transition-all resize-none min-h-[44px] max-h-[140px]"
          placeholder={interactive ? 'Type a message, tap mic, or click a floating prompt...' : 'Chat disabled in static preview'}
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
