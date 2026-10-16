import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Bot, 
  Copy, 
  Check, 
  Code, 
  Zap, 
  X, 
  Headphones, 
  HelpCircle, 
  ShoppingBag 
} from 'lucide-react';
import { chatbotApi } from '../api';
import ChatWindow from '../components/ChatWindow';
import { BASE_URL } from '../utils/apiClient';

export const DedicatedPreview: React.FC = () => {
  const { botId = '' } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'embed'>('preview');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch chatbot config from public or authenticated endpoint
  const { data: chatbot, isLoading } = useQuery<any>({
    queryKey: ['public-chatbot', botId],
    queryFn: async () => {
      try {
        return await chatbotApi.getPublicChatbot(botId);
      } catch (err) {
        return await chatbotApi.getChatbot(botId);
      }
    },
    enabled: !!botId,
  });

  const name = chatbot?.name || 'Support Assistant';
  const welcomeMessage = chatbot?.welcome_message || chatbot?.description || 'Hi! How can I help you today?';
  const themeColor = chatbot?.theme_color || '#4F46E5';
  const avatar = chatbot?.avatar_icon || chatbot?.avatar_url || 'support';
  const bubbleStyle = chatbot?.bubble_style || 'rounded';
  const position = chatbot?.position || 'right';
  const showWelcomeTooltip = chatbot?.show_welcome_tooltip ?? true;
  const openAutomatically = chatbot?.open_automatically ?? false;
  const popAfterSeconds = chatbot?.pop_after_seconds ?? 3;

  useEffect(() => {
    if (openAutomatically) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, (popAfterSeconds || 3) * 1000);
      return () => clearTimeout(timer);
    }
  }, [openAutomatically, popAfterSeconds]);

  const embedScript = `<script 
  src="${BASE_URL}/widget.js" 
  data-chatbot-id="${botId || 'YOUR_BOT_ID'}" 
  defer>
</script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLauncherClasses = () => {
    const base = "w-14 h-14 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 duration-200 text-white z-40 relative";
    if (bubbleStyle === 'pill') return `${base} rounded-full`;
    if (bubbleStyle === 'square') return `${base} rounded-xl`;
    return `${base} rounded-2xl`;
  };

  const getAvatarIcon = () => {
    if (avatar === 'faq') return <HelpCircle className="w-6 h-6" />;
    if (avatar === 'sales') return <ShoppingBag className="w-6 h-6" />;
    return <Headphones className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-[#F3F6FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-[#71829F]">Loading Dedicated Chatbot Sandbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F3F6FF] flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="bg-[#091121] border-b border-[#1C2C4B] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/builder?botId=${botId}`)}
            className="flex items-center gap-1.5 text-xs text-[#A3B3CF] hover:text-[#F3F6FF] transition-colors bg-[#101D39] hover:bg-[#142342] px-3.5 py-2 rounded-xl border border-[#1C2C4B] font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            Back to Builder
          </button>
          <div className="h-5 w-px bg-[#1C2C4B] hidden sm:block" />
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#F3F6FF] flex items-center gap-2">
                {name}
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse"></span>
                  Sandbox Active
                </span>
              </h1>
              <p className="text-[11px] text-[#71829F] truncate max-w-xs">ID: {botId}</p>
            </div>
          </div>
        </div>

        {/* Switcher & Copy */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#101D39] p-1 rounded-xl border border-[#1C2C4B] text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'preview' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
              }`}
            >
              Interactive Preview
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'embed' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Embed Code
            </button>
          </div>

          <button
            onClick={copyEmbed}
            className="hidden md:flex items-center gap-1.5 btn-primary-gradient text-xs font-bold px-4 py-2 rounded-xl"
          >
            {copied ? <Check className="w-4 h-4 text-[#10D6A0]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Script Tag'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full items-center">
        {activeTab === 'preview' ? (
          <div className="w-full flex-1 flex flex-col gap-6">
            {/* Simulated Host Web Page Canvas */}
            <div className="w-full bg-[#0D1730] border border-[#1C2C4B] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl min-h-[500px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#818CF8 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 mb-6">
                <Zap className="w-3.5 h-3.5 text-[#22D3EE]" /> Simulated Website Canvas
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[#F3F6FF] leading-tight tracking-tight mb-4 max-w-3xl">
                Experience your chatbot widget live in real time
              </h2>

              <p className="text-[#A3B3CF] text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Click the floating chat launcher in the bottom <strong className="text-white capitalize">{position}</strong> corner to open and test your AI chatbot.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-6 py-3.5 rounded-xl font-bold text-xs btn-primary-gradient"
                >
                  {isOpen ? 'Close Floating Chat Widget' : 'Open Floating Chat Widget'}
                </button>
                <button 
                  onClick={copyEmbed}
                  className="px-6 py-3.5 rounded-xl font-bold text-xs bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] border border-[#1C2C4B] transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-[#10D6A0]" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Script Tag Copied!' : 'Copy Script Tag'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-[#0D1730] border border-[#1C2C4B] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#F3F6FF] mb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                Embed Chatbot on Any Website
              </h2>
              <p className="text-xs text-[#71829F]">
                Copy and paste this script tag right before <code className="text-indigo-300 font-mono">&lt;/body&gt;</code> on any HTML web page.
              </p>
            </div>

            <div className="relative bg-[#080E1B] border border-[#1C2C4B] rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 bg-[#091121] border-b border-[#1C2C4B] flex justify-between items-center text-xs text-[#71829F] font-mono">
                <span>HTML Embed Snippet</span>
                <button
                  onClick={copyEmbed}
                  className="flex items-center gap-1 hover:text-white text-indigo-400 font-sans font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10D6A0]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-indigo-200 overflow-x-auto">
                <code>{embedScript}</code>
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING WIDGET SIMULATOR */}
      <div 
        className={`fixed bottom-6 flex flex-col items-end gap-3 z-50 w-[90%] sm:w-85 md:w-96 transition-all duration-300 ${
          position === 'left' ? 'left-6 items-start' : 'right-6 items-end'
        }`}
      >
        {isOpen ? (
          <div className="w-full h-[540px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative border border-[#1C2C4B] bg-[#080E1B]">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 z-30 text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close widget"
            >
              <X className="w-5 h-5" />
            </button>

            <ChatWindow 
              name={name}
              welcomeMessage={welcomeMessage}
              themeColor={themeColor}
              avatar={avatar}
              bubbleStyle={bubbleStyle}
              chatbotId={botId}
              interactive={true}
              showDebugToggle={false}
            />
          </div>
        ) : (
          <div className="flex flex-col items-end gap-3">
            {showWelcomeTooltip && (
              <div 
                className="bg-[#091121] text-[#F3F6FF] px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold border border-[#1C2C4B] relative animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                {welcomeMessage}
                <div 
                  className={`absolute -bottom-1.5 w-3 h-3 bg-[#091121] border-r border-b border-[#1C2C4B] transform rotate-45 ${
                    position === 'left' ? 'left-5' : 'right-5'
                  }`}
                />
              </div>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className={getLauncherClasses()}
              style={{ backgroundColor: themeColor }}
              title="Open Chat Assistant"
            >
              {getAvatarIcon()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DedicatedPreview;
