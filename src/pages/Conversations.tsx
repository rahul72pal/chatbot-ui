import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Eye, 
  Bot, 
  Calendar, 
  CheckCircle2, 
  MessageCircle,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi, chatbotApi } from '../api';
import { useToast } from '../hooks/useToast';

export const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatbotFilter, setSelectedChatbotFilter] = useState('');

  // Fetch list of active conversations
  const { data: conversations = [], isLoading: isConvsLoading } = useQuery<any[]>({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations() as Promise<any[]>,
  });

  // Fetch chatbots list to display bot names
  const { data: chatbots = [] } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  const chatbotMap: Record<string, string> = {};
  chatbots.forEach((bot) => {
    chatbotMap[bot.id] = bot.name;
  });

  // Delete Conversation Mutation
  const deleteMutation = useMutation({
    mutationFn: (convId: string) => messageApi.deleteConversation(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Conversation history deleted.', 'Deleted');
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to delete conversation.';
      toast.error(msg, 'Deletion Error');
    }
  });

  const handleDelete = (convId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete conversation "${title || convId}"?`)) {
      deleteMutation.mutate(convId);
    }
  };

  const filteredConversations = conversations
    .filter((c: any) => {
      const matchesSearch = 
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.id || c.conversation_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chatbotMap[c.chatbot_id] || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBot = selectedChatbotFilter ? c.chatbot_id === selectedChatbotFilter : true;
      
      return matchesSearch && matchesBot;
    });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold">
              Session Management
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            Conversation Sessions
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Inspect visitor chat sessions, view detailed transcripts, citations, and conversation performance.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => navigate('/builder')}
            className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chatbot</span>
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Total Conversations</p>
            <p className="font-display text-2xl font-bold text-[#F3F6FF]">{conversations.length}</p>
            <p className="text-[11px] text-[#10D6A0] font-medium flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10D6A0]" /> Active sessions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Associated Chatbots</p>
            <p className="font-display text-2xl font-bold text-[#F3F6FF]">{chatbots.length}</p>
            <p className="text-[11px] text-[#A855F7] font-medium pt-0.5">Deployed assistants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#A855F7] flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Storage Policy</p>
            <p className="font-display text-xl font-bold text-[#F3F6FF]">24-Hour TTL</p>
            <p className="text-[11px] text-[#22D3EE] font-medium pt-0.5">Auto-expiring memory</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#22D3EE] flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Conversations Table Card */}
      <section className="bg-[#0D1730] rounded-2xl border border-[#1C2C4B] overflow-hidden shadow-xl">
        <div className="p-5 sm:p-6 border-b border-[#1C2C4B] bg-[#091121] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#F3F6FF]">
              Active Sessions ({filteredConversations.length})
            </h2>
            <p className="text-xs text-[#71829F] mt-0.5">Click "View Messages" to open the full message transcript.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Filter by Chatbot */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedChatbotFilter}
                onChange={(e) => setSelectedChatbotFilter(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-[#A3B3CF] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
              >
                <option value="">All Chatbots</option>
                {chatbots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#71829F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#71829F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-[#1C2C4B] bg-[#091121]/60 text-[#71829F] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-5 font-bold min-w-[200px]">Conversation Session</th>
                <th className="py-3.5 px-5 font-bold min-w-[140px]">Chatbot</th>
                <th className="py-3.5 px-5 font-bold min-w-[150px]">Summary / Info</th>
                <th className="py-3.5 px-5 font-bold min-w-[100px]">Status</th>
                <th className="py-3.5 px-5 font-bold min-w-[110px]">Last Updated</th>
                <th className="py-3.5 px-5 text-right font-bold min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2C4B] text-xs">
              {isConvsLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#A3B3CF]">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading active conversation sessions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#71829F] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#101D39] border border-[#243653] flex items-center justify-center text-[#71829F] mx-auto">
                      <MessageSquare className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="font-bold text-[#F3F6FF] text-sm">No conversation sessions found</p>
                    <p className="text-xs text-[#71829F]">Visitor messages on your embedded widgets will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv: any) => {
                  const convId = conv.id || conv.conversation_id;
                  const botName = chatbotMap[conv.chatbot_id] || 'Support Assistant';

                  return (
                    <tr key={convId} className="hover:bg-[#101D39]/50 transition-colors group">
                      {/* Title & ID */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center flex-shrink-0 font-bold">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#F3F6FF] text-xs max-w-xs truncate">
                              {conv.title || `Chat Session #${convId.slice(0, 8)}`}
                            </p>
                            <p className="text-[10px] font-mono text-[#71829F] mt-0.5 truncate max-w-xs">
                              ID: {convId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Chatbot Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3.5 h-3.5 text-[#A855F7]" />
                          <span className="font-bold text-[#F3F6FF]">{botName}</span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-[#A3B3CF] truncate text-xs">
                          {conv.summary ? conv.summary : 'Active visitor chat session'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-5 text-[#71829F] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#71829F]" />
                          <span>{conv.updated_at ? new Date(conv.updated_at).toLocaleString() : 'Recently'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/conversations/${convId}`)}
                            className="px-3 py-1.5 text-[11px] font-semibold bg-[#142342] text-[#C7D2FE] border border-[#243653] hover:bg-[#1C2C4B] hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                            title="Show Message Transcript"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Messages
                          </button>

                          <button
                            onClick={() => handleDelete(convId, conv.title)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-xl transition-colors disabled:opacity-40"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Conversations;
