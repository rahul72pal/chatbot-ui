import React, { useState } from 'react';
import { X, MessageSquare, Sparkles } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatPreviewProps {
  name: string;
  welcomeMessage: string;
  themeColor: string;
  avatar: string;
  position: 'left' | 'right';
  bubbleStyle: 'pill' | 'square' | 'rounded';
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  name,
  welcomeMessage,
  themeColor,
  avatar,
  position,
  bubbleStyle
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const getLauncherClasses = () => {
    const base = "w-14 h-14 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 duration-150 text-white z-20";
    if (bubbleStyle === 'pill') return `${base} rounded-full`;
    if (bubbleStyle === 'square') return `${base} rounded-sm`;
    return `${base} rounded-xl`;
  };

  return (
    <div className="w-full h-full bg-[#070B14] rounded-2xl border border-[#1C2C4B] shadow-2xl flex flex-col overflow-hidden relative min-h-[500px]">
      {/* Browser Chrome Header */}
      <div className="h-12 bg-[#091121] border-b border-[#1C2C4B] flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FB7185]/80"></div>
          <div className="w-3 h-3 rounded-full bg-[#FBBF24]/80"></div>
          <div className="w-3 h-3 rounded-full bg-[#10D6A0]/80"></div>
        </div>
        <div className="flex-1 max-w-xs md:max-w-md mx-auto bg-[#0D1730] border border-[#1C2C4B] rounded-lg h-7 flex items-center justify-center">
          <span className="font-mono text-[11px] text-[#71829F]">yoursaas.com</span>
        </div>
      </div>

      {/* Mock Website Body Content */}
      <div className="flex-1 bg-[#080E1B] p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-start pt-16 text-center select-none">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#142342] border border-[#243653] rounded-full text-[10px] font-bold text-[#C7D2FE] uppercase tracking-wider mb-4">
          <Sparkles className="w-3 h-3 text-[#22D3EE]" /> Next-Gen AI Assistant
        </div>
        
        <h2 className="text-[26px] md:text-[36px] font-bold text-[#F3F6FF] leading-tight tracking-tight mb-3">
          Understand your data <br />at the speed of thought.
        </h2>
        
        <p className="text-[13px] md:text-[15px] text-[#A3B3CF] max-w-lg mx-auto mb-6">
          The ultimate intelligent chatbot platform for modern products. Connect your vector knowledge base and start chatting.
        </p>

        <div className="flex gap-3 justify-center mb-8">
          <div className="px-5 py-2.5 btn-primary-gradient rounded-xl text-xs font-semibold cursor-pointer">
            Get Started
          </div>
          <div className="px-5 py-2.5 bg-[#101D39] border border-[#1C2C4B] text-[#F3F6FF] rounded-xl text-xs font-medium cursor-pointer">
            Documentation
          </div>
        </div>
      </div>

      {/* Floating Chat Widget Simulator */}
      <div 
        className={`absolute bottom-6 flex flex-col items-end gap-3 z-10 w-[90%] sm:w-80 md:w-96 transition-all duration-300 ${
          position === 'left' ? 'left-6' : 'right-6'
        }`}
      >
        {isOpen ? (
          <div className="w-full h-[400px] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative border border-[#1C2C4B] bg-[#080E1B]">
            <div className="absolute top-4 right-3 z-20 flex items-center gap-1.5 text-white/80">
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ChatWindow 
              name={name}
              welcomeMessage={welcomeMessage}
              themeColor={themeColor}
              avatar={avatar}
              bubbleStyle={bubbleStyle}
              interactive={true}
              showDebugToggle={false}
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsOpen(true)}
            className={getLauncherClasses()}
            style={{ backgroundColor: themeColor }}
            title="Open assistant"
          >
            <MessageSquare className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPreview;
