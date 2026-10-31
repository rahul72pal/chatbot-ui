import React, { useState } from 'react';
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  MessageSquare,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  HelpCircle,
  Headphones,
  Bot,
  Loader2,
} from 'lucide-react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';

export interface VoiceAgentViewProps {
  botName?: string;
  themeColor?: string;
  avatar?: string;
  welcomeMessage?: string;
  onSwitchToChat?: () => void;
  onClose?: () => void;
  onTurnComplete?: (transcript: string, reply: string) => void;
  chatbotId?: string;
}

export const VoiceAgentView: React.FC<VoiceAgentViewProps> = ({
  botName = 'Support Assistant',
  themeColor = '#4F46E5',
  avatar = 'support',
  welcomeMessage = 'Hello! How can I help you today?',
  onSwitchToChat,
  onClose,
  onTurnComplete,
  chatbotId,
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);

  const {
    voiceState,
    transcripts,
    errorMessage,
    audioLevel,
    isMuted,
    transport,
    selectedLanguage,
    setSelectedLanguage,
    setIsMuted,
    startListening,
    stopListening,
    interrupt,
    resetSession,
  } = useVoiceAgent({
    language: 'en',
    autoInitOnMount: true,
    welcomeMessage,
    preferWebSocket: true,
    chatbotId,
    onTurnComplete,
  });

  const getAvatarIcon = () => {
    if (avatar === 'faq' || avatar === 'quiz') return <HelpCircle className="w-4 h-4" />;
    if (avatar === 'sales' || avatar === 'shopping_bag') return <MessageSquare className="w-4 h-4" />;
    if (avatar === 'headphones' || avatar === 'support') return <Headphones className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getStatusLabel = () => {
    switch (voiceState) {
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening to you...';
      case 'processing':
        return 'Thinking & processing...';
      case 'speaking':
        return 'Speaking response...';
      case 'error':
        return 'Connection issue';
      default:
        return 'Ready to listen';
    }
  };

  const handleMainButtonClick = () => {
    if (voiceState === 'connecting' || voiceState === 'processing') return;
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      interrupt();
    } else {
      startListening();
    }
  };

  const dynamicScale = 1 + (audioLevel / 100) * 0.25;
  const outerRippleScale = 1 + (audioLevel / 100) * 0.45;
  const isConnecting = voiceState === 'connecting';
  const latestTurn = transcripts.length > 0 ? transcripts[transcripts.length - 1] : null;

  return (
    <div
      className="flex flex-col bg-[#080E1B] border border-[#1C2C4B] rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ height: '100%', minHeight: 0 }}
    >
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#1C2C4B] bg-[#091121] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {getAvatarIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#F3F6FF] text-xs leading-tight">{botName}</span>
              <span className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border ${
                voiceState === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : transport === 'websocket'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {voiceState === 'error'
                  ? 'WS Offline'
                  : voiceState === 'connecting'
                  ? 'WS Connecting'
                  : transport === 'websocket'
                  ? 'Live WS'
                  : 'Voice'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  voiceState === 'listening'
                    ? 'bg-rose-500 animate-ping'
                    : voiceState === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : isConnecting
                    ? 'bg-amber-400 animate-pulse'
                    : voiceState === 'processing'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-[10px] text-[#71829F]">{getStatusLabel()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSwitchToChat && (
            <button
              onClick={onSwitchToChat}
              className="px-2.5 py-1 bg-[#101D39] hover:bg-[#142342] text-[#A3B3CF] hover:text-[#F3F6FF] border border-[#1C2C4B] rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all"
              title="Switch to Text Chat"
            >
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              <span>Chat</span>
            </button>
          )}

          <button
            onClick={resetSession}
            className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
            title="Reset Voice Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
              title="Close Widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Voice Area ──────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-[#080E1B] via-[#091121] to-[#080E1B]"
        style={{ minHeight: 0 }}
      >
        {/* Ambient Glow Backdrop */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
          style={{
            backgroundColor:
              voiceState === 'listening'
                ? '#EF4444'
                : voiceState === 'speaking'
                ? '#10D6A0'
                : voiceState === 'processing'
                ? '#A855F7'
                : isConnecting
                ? '#F59E0B'
                : themeColor,
            transform: `scale(${dynamicScale})`,
          }}
        />

        {/* Orb + rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ripple Ring */}
          <div
            className="absolute rounded-full border transition-transform duration-150 pointer-events-none"
            style={{
              width: '180px',
              height: '180px',
              transform: `scale(${outerRippleScale})`,
              borderColor:
                voiceState === 'listening'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : voiceState === 'speaking'
                  ? 'rgba(16, 214, 160, 0.4)'
                  : isConnecting
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(99, 102, 241, 0.2)',
            }}
          />

          {/* Secondary Ring */}
          <div
            className="absolute rounded-full border transition-transform duration-200 pointer-events-none"
            style={{
              width: '140px',
              height: '140px',
              transform: `scale(${dynamicScale})`,
              borderColor:
                voiceState === 'listening'
                  ? 'rgba(239, 68, 68, 0.5)'
                  : voiceState === 'speaking'
                  ? 'rgba(16, 214, 160, 0.5)'
                  : isConnecting
                  ? 'rgba(245, 158, 11, 0.5)'
                  : 'rgba(99, 102, 241, 0.3)',
            }}
          />

          {/* Core Orb */}
          <div
            className="w-24 h-24 rounded-full shadow-2xl flex items-center justify-center relative cursor-pointer transition-all duration-300"
            style={{
              backgroundColor:
                voiceState === 'listening'
                  ? '#EF4444'
                  : voiceState === 'speaking'
                  ? '#10B981'
                  : voiceState === 'processing'
                  ? '#8B5CF6'
                  : isConnecting
                  ? '#F59E0B'
                  : themeColor,
              boxShadow:
                voiceState === 'listening'
                  ? '0 0 35px rgba(239, 68, 68, 0.6)'
                  : voiceState === 'speaking'
                  ? '0 0 35px rgba(16, 185, 129, 0.6)'
                  : isConnecting
                  ? '0 0 30px rgba(245, 158, 11, 0.5)'
                  : `0 0 30px ${themeColor}60`,
              transform: `scale(${dynamicScale})`,
            }}
            onClick={handleMainButtonClick}
          >
            {isConnecting || voiceState === 'processing' ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : voiceState === 'listening' ? (
              <Square className="w-7 h-7 text-white animate-pulse" />
            ) : voiceState === 'speaking' ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-9 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <Mic className="w-8 h-8 text-white transition-transform hover:scale-110" />
            )}
          </div>
        </div>

        {/* Waveform bars */}
        <div className="flex items-center justify-center gap-1.5 h-8 mt-6 mb-2">
          {[12, 24, 38, 55, 38, 24, 12].map((height, idx) => {
            const h =
              voiceState === 'listening' || voiceState === 'speaking'
                ? Math.max(6, Math.min(32, Math.round((audioLevel / 100) * height * 1.5)))
                : isConnecting || voiceState === 'processing'
                ? Math.round(10 + Math.sin(Date.now() / 200 + idx) * 8)
                : 4;
            return (
              <span
                key={idx}
                className="w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${h}px`,
                  backgroundColor:
                    voiceState === 'listening'
                      ? '#EF4444'
                      : voiceState === 'speaking'
                      ? '#10D6A0'
                      : voiceState === 'processing'
                      ? '#A855F7'
                      : isConnecting
                      ? '#F59E0B'
                      : '#2A3C60',
                }}
              />
            );
          })}
        </div>

        {/* Status text */}
        <div className="text-center mb-2">
          <h3 className="text-sm font-bold text-[#F3F6FF]">
            {isConnecting
              ? 'Connecting...'
              : voiceState === 'listening'
              ? 'Listening...'
              : voiceState === 'processing'
              ? 'Processing speech...'
              : voiceState === 'speaking'
              ? 'Speaking response...'
              : 'Tap to Speak'}
          </h3>
          <p className="text-[11px] text-[#71829F] mt-0.5">
            {isConnecting
              ? 'Setting up your voice session...'
              : voiceState === 'listening'
              ? 'Tap the orb when you are done speaking'
              : voiceState === 'processing'
              ? 'Thinking and executing tools...'
              : voiceState === 'speaking'
              ? 'Tap to interrupt anytime'
              : 'Say "Check availability" or ask any question'}
          </p>
        </div>

        {/* Error callout */}
        {errorMessage && (
          <div className="mt-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 text-rose-300 max-w-xs">
            <div className="flex items-start gap-1.5 min-w-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="text-[11px] leading-tight text-left">{errorMessage}</span>
            </div>
            <button
              onClick={resetSession}
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-lg text-[10px] font-semibold flex-shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ── Transcript Drawer ────────────────────────────────────────────────── */}
      <div className="border-t border-[#1C2C4B] bg-[#091121] flex flex-col flex-shrink-0 transition-all duration-300">
        <div
          onClick={() => setShowFullTranscript(!showFullTranscript)}
          className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#101D39] transition-colors text-[10px] text-[#71829F] font-semibold uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Live Conversation Transcript
          </span>
          <div className="flex items-center gap-1 text-[#F3F6FF]">
            <span>{showFullTranscript ? 'Hide' : 'View full'}</span>
            {showFullTranscript ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </div>
        </div>

        {showFullTranscript ? (
          <div className="max-h-40 overflow-y-auto px-4 py-2 space-y-2.5 text-xs border-t border-[#1C2C4B]/50 bg-[#080E1B]">
            {transcripts.map((t) => (
              <div key={t.id} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    t.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-[#101D39] text-[#F3F6FF] border border-[#1C2C4B] rounded-bl-sm'
                  }`}
                >
                  <span className="block text-[9px] font-bold opacity-60 uppercase mb-0.5">
                    {t.role === 'user' ? 'You' : botName}
                  </span>
                  {t.text}
                </div>
                {t.timings && (
                  <span className="text-[9px] text-[#71829F] mt-0.5 px-1">
                    Latency: {t.timings.stt + t.timings.llm + t.timings.tts}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : latestTurn ? (
          <div className="px-4 py-2.5 bg-[#080E1B]/60 text-xs">
            <div className="text-[#71829F] text-[10px] font-bold uppercase mb-0.5">
              {latestTurn.role === 'user' ? 'You' : botName}:
            </div>
            <p className="text-[#F3F6FF] text-xs line-clamp-2 leading-relaxed">{latestTurn.text}</p>
          </div>
        ) : null}

        {/* Bottom toolbar */}
        <div className="p-2.5 border-t border-[#1C2C4B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isMuted
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-[#101D39] border-[#1C2C4B] text-[#A3B3CF] hover:text-white'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-medium">{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#101D39] border border-[#1C2C4B] rounded-xl px-2 py-1.5 text-[10px] font-semibold text-[#A3B3CF] focus:outline-none focus:border-indigo-500 cursor-pointer"
              title="Speech Language"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#71829F] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                voiceState === 'error'
                  ? 'bg-rose-400'
                  : transport === 'websocket'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {voiceState === 'error'
                ? 'WebSocket Disconnected'
                : voiceState === 'connecting'
                ? 'Connecting WebSocket'
                : transport === 'websocket'
                ? 'WebSocket Streaming'
                : 'HTTP Voice Turn'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentView;
