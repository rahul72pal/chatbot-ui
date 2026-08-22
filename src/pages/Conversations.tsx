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
  Plus
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

  // Create a quick lookup map for chatbot names
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
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden shadow-2xl">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              Session Management
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Conversation Sessions
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Inspect visitor chat sessions, view detailed transcripts, and manage conversation history.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            onClick={() => navigate('/builder')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-glow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chatbot</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 blur-3xl pointer-events-none -z-0" />
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Conversations</p>
            <p className="font-display text-2xl font-bold text-white">{conversations.length}</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active sessions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Associated Chatbots</p>
            <p className="font-display text-2xl font-bold text-white">{chatbots.length}</p>
            <p className="text-[10px] text-purple-400 font-medium">Deployed assistants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Storage Policy</p>
            <p className="font-display text-xl font-bold text-white">24-Hour TTL</p>
            <p className="text-[10px] text-cyan-400 font-medium">Auto-expiring memory</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Conversations Table */}
      <section className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-white">
              Active Sessions ({filteredConversations.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Click "View Messages" to view full chat history transcript.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Filter by Chatbot */}
            <select
              value={selectedChatbotFilter}
              onChange={(e) => setSelectedChatbotFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Chatbots</option>
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Conversation Session</th>
                <th className="py-4 px-6 font-bold">Chatbot</th>
                <th className="py-4 px-6 font-bold">Summary / Info</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Last Updated</th>
                <th className="py-4 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {isConvsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading active conversation sessions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-white">No conversation sessions found</p>
                    <p className="text-xs text-slate-400">Visitor messages on your embedded widgets will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv: any) => {
                  const convId = conv.id || conv.conversation_id;
                  const botName = chatbotMap[conv.chatbot_id] || 'Support Assistant';

                  return (
                    <tr key={convId} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Title & ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 font-bold">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm max-w-xs truncate">
                              {conv.title || `Chat Session #${convId.slice(0, 8)}`}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-xs">
                              ID: {convId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Chatbot Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-bold text-slate-200">{botName}</span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-slate-300 truncate">
                          {conv.summary ? conv.summary : 'Active visitor chat session'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{conv.updated_at ? new Date(conv.updated_at).toLocaleString() : 'Recently'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/conversations/${convId}`)}
                            className="px-3.5 py-1.5 text-[11px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl transition-all flex items-center gap-1.5 shadow-glow-sm"
                            title="Show Message Transcript UI"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Messages
                          </button>

                          <button
                            onClick={() => handleDelete(convId, conv.title)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors disabled:opacity-40"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
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
