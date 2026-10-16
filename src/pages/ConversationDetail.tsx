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
  const themeColor = chatbot?.theme_color || '#4F46E5';

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
      <div className="min-h-[60vh] flex items-center justify-center text-[#F3F6FF] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#71829F] font-medium">Loading conversation messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">
      {/* Header Bar */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/conversations')}
            className="flex items-center gap-2 text-xs text-[#A3B3CF] hover:text-[#F3F6FF] transition-colors bg-[#101D39] hover:bg-[#142342] px-3.5 py-2 rounded-xl border border-[#1C2C4B] font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            Back to Sessions
          </button>

          <div className="h-6 w-px bg-[#1C2C4B] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-bold text-[#F3F6FF]">
                {conversation.title || `Chat Session #${conversationId.slice(0, 8)}`}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/30">
                <CheckCircle2 className="w-3 h-3" />
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-[#71829F] flex items-center gap-2 mt-0.5">
              <span>Assigned Chatbot: <strong className="text-[#A3B3CF]">{botName}</strong></span>
              <span>•</span>
              <span className="font-mono text-[#71829F]">ID: {conversationId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-2 text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-xl transition-colors border border-[#1C2C4B] flex items-center gap-1.5 text-xs font-semibold"
            title="Delete Conversation"
          >
            <Trash2 className="w-4 h-4 text-[#FB7185]" />
            <span className="hidden sm:inline">Delete Session</span>
          </button>
        </div>
      </header>

      {/* Transcript Chat Window */}
      <section className="bg-[#0D1730] rounded-2xl border border-[#1C2C4B] overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[75vh]">
        {/* Chat Window Header */}
        <div className="px-6 py-4 bg-[#091121] border-b border-[#1C2C4B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#F3F6FF] block">{botName} Transcript</span>
              <span className="text-[10px] text-[#71829F] flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                {messages.length} messages in history
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#A3B3CF] bg-[#101D39] px-3 py-1 rounded-lg border border-[#1C2C4B]">
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Read-Only Mode
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Qdrant RAG Enabled</span>
            </div>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#080E1B]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#71829F] space-y-2">
              <Bot className="w-10 h-10 text-[#71829F] mb-1 animate-pulse" />
              <p className="font-bold text-[#F3F6FF] text-sm">No messages recorded in this conversation yet</p>
              <p className="text-xs text-[#71829F] max-w-sm">
                Visitor chat prompts will automatically stream and record here in real-time.
              </p>
            </div>
          ) : (
            messages.map((msg: any, index: number) => {
              const isUser = msg.role === 'user';

              return (
                <div 
                  key={index} 
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar Icon */}
                  <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${
                      isUser 
                        ? 'bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED]' 
                        : 'bg-[#101D39] border border-[#243653] text-indigo-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="space-y-1.5 flex-1">
                    <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[11px] font-bold text-[#A3B3CF]">
                        {isUser ? 'Visitor Prompt' : botName}
                      </span>
                      {msg.created_at && (
                        <span className="text-[10px] text-[#71829F] flex items-center gap-1">
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
                      <div className="bg-[#101D39] border border-[#1C2C4B] rounded-xl p-3 text-xs text-[#A3B3CF] space-y-1.5">
                        <button
                          onClick={() => toggleReasoning(index)}
                          className="flex items-center justify-between w-full text-indigo-300 font-bold text-[11px] hover:text-indigo-200 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                            DeepSeek Reasoning Process
                          </span>
                          {expandedReasoning[index] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedReasoning[index] && (
                          <div className="pt-2 border-t border-[#1C2C4B] text-[11px] text-[#71829F] font-mono leading-relaxed whitespace-pre-wrap">
                            {msg.reasoning_details}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Text */}
                    <div 
                      className={`p-4 text-xs leading-relaxed rounded-2xl ${
                        isUser
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-tr-xs shadow-[0_4px_14px_rgba(79,70,229,0.25)]'
                          : 'bg-[#101D39] text-[#F3F6FF] rounded-tl-xs border border-[#1C2C4B]'
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
        <div className="p-4 bg-[#091121] border-t border-[#1C2C4B] flex items-center justify-between text-xs text-[#71829F]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FBBF24]" />
            <span className="font-medium text-[#A3B3CF]">Read-Only Session Archive</span>
          </div>
          <span className="text-[11px] text-[#71829F]">
            Messages are created by website visitors via public chatbot widgets.
          </span>
        </div>
      </section>
    </div>
  );
};

export default ConversationDetail;
