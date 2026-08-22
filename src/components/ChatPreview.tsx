import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
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
    <div className="w-full h-full bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
      {/* Browser chrome header */}
      <div className="h-12 bg-surface-container-low border-b border-border-subtle flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 max-w-xs md:max-w-md mx-auto bg-white border border-border-subtle rounded-md h-7 flex items-center justify-center">
          <span className="font-mono text-[11px] text-text-muted">yoursaas.com</span>
        </div>
      </div>

      {/* Fake website body content */}
      <div className="flex-1 bg-surface-bright p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-start pt-16 text-center select-none">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748B 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="inline-block px-3 py-1 bg-surface-container border border-border-subtle rounded-full text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4">
          Introducing Analytics 2.0
        </div>
        
        <h2 className="text-[28px] md:text-[40px] font-bold text-on-surface leading-tight tracking-tight mb-3">
          Understand your data <br />at the speed of thought.
        </h2>
        
        <p className="text-[14px] md:text-[16px] text-text-muted max-w-xl mx-auto mb-6">
          The ultimate analytics platform for modern engineering teams. No SQL required. Just ask questions in plain English.
        </p>

        <div className="flex gap-3 justify-center mb-8">
          <div className="px-5 py-2.5 bg-on-surface text-white rounded-lg text-[13px] font-medium">Get Started</div>
          <div className="px-5 py-2.5 bg-white border border-border-subtle text-on-surface rounded-lg text-[13px] font-medium">Documentation</div>
        </div>

        {/* Decorative Grid items */}
        <div className="w-full max-w-2xl bg-white border border-border-subtle rounded-t-xl shadow-xs p-4 flex flex-col gap-3">
          <div className="flex gap-2 border-b border-border-subtle pb-3">
            <div className="h-3 w-16 bg-surface-container rounded"></div>
            <div className="h-3 w-24 bg-surface-container rounded"></div>
          </div>
          <div className="flex gap-3 h-24">
            <div className="w-1/3 bg-surface-container rounded-md"></div>
            <div className="w-2/3 bg-surface-container rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Floating Chat widget simulator */}
      <div 
        className={`absolute bottom-6 flex flex-col items-end gap-3 z-10 w-[90%] sm:w-80 md:w-96 transition-all duration-300 ${
          position === 'left' ? 'left-6' : 'right-6'
        }`}
      >
        {isOpen ? (
          <div className="w-full h-[400px] flex flex-col rounded-xl overflow-hidden shadow-2xl relative border border-border-subtle">
            {/* Custom minimize header action */}
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
          /* Closed Widget Launcher Bubble */
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
