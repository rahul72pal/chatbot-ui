import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bot, 
  User, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Lock,
  Eye
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi, chatbotApi } from '../api';

export const ConversationDetail: React.FC = () => {
  const { conversationId = '' } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [expandedReasoning, setExpandedReasoning] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Conversation metadata and full message history
  const { 
    data: detailData, 
    isLoading 
  } = useQuery<any>({
    queryKey: ['conversationDetail', conversationId],
    queryFn: () => messageApi.getConversationDetail(conversationId),
    enabled: !!conversationId,
  });

  const conversation = detailData?.conversation || {};
  const messages = detailData?.messages || [];
  const chatbotId = conversation.chatbot_id || '';

  // Fetch chatbot details for name & avatar
  const { data: chatbot } = useQuery<any>({
    queryKey: ['chatbot', chatbotId],
    queryFn: () => chatbotApi.getChatbot(chatbotId),
    enabled: !!chatbotId,
  });

  const botName = chatbot?.name || 'Support Assistant';
  const themeColor = chatbot?.theme_color || '#6366F1';

  // Auto-scroll to bottom of chat history when messages load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Delete Conversation Mutation
  const deleteMutation = useMutation({
    mutationFn: (convId: string) => messageApi.deleteConversation(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/conversations');
    }
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entire conversation session?')) {
      deleteMutation.mutate(conversationId);
    }
  };

  const toggleReasoning = (idx: number) => {
    setExpandedReasoning(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading conversation messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">
      {/* Header Bar */}
      <header className="glass-card p-6 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/conversations')}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-2 rounded-xl border border-slate-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Conversations
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-bold text-white">
                {conversation.title || `Chat Session #${conversationId.slice(0, 8)}`}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Assigned Chatbot: <strong className="text-slate-200">{botName}</strong></span>
              <span>•</span>
              <span className="font-mono text-slate-500">ID: {conversationId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-slate-800 flex items-center gap-1.5 text-xs font-semibold"
            title="Delete Conversation"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Delete Session</span>
          </button>
        </div>
      </header>

      {/* Transcript Chat Window */}
      <section className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col h-[620px] max-h-[75vh]">
        {/* Chat Window Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">{botName} Transcript</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                {messages.length} messages in history
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Read-Only Mode
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Qdrant RAG Enabled</span>
            </div>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <Bot className="w-10 h-10 text-slate-600 mb-1 animate-pulse" />
              <p className="font-bold text-white text-sm">No messages recorded in this conversation yet</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Visitor chat prompts will automatically stream and record here in real-time.
              </p>
            </div>
          ) : (
            messages.map((msg: any, index: number) => {
              const isUser = msg.role === 'user';

              return (
                <div 
                  key={index} 
                  className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar Icon */}
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${
                      isUser 
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' 
                        : 'bg-slate-800 border border-slate-700 text-indigo-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1.5 flex-1">
                    <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[11px] font-bold text-slate-300">
                        {isUser ? 'Visitor Prompt' : botName}
                      </span>
                      {msg.created_at && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {msg.tokens && (
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {msg.tokens} tokens
                        </span>
                      )}
                    </div>

                    {/* Reasoning Accordion (If available) */}
                    {msg.reasoning_details && (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1.5">
                        <button
                          onClick={() => toggleReasoning(index)}
                          className="flex items-center justify-between w-full text-indigo-300 font-bold text-[11px] hover:text-indigo-200 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            DeepSeek Reasoning Process
                          </span>
                          {expandedReasoning[index] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedReasoning[index] && (
                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                            {msg.reasoning_details}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Text */}
                    <div 
                      className={`p-4 text-xs leading-relaxed rounded-2xl ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-glow-sm'
                          : 'bg-slate-900/90 text-slate-200 rounded-tl-xs border border-slate-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Read-Only Status Bar Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-slate-300">Read-Only Session Archive</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Messages are created by website visitors via public chatbot widgets.
          </span>
        </div>
      </section>
    </div>
  );
};

export default ConversationDetail;
