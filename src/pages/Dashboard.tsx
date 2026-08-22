import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MessageSquare, Files, MessageCircle, Bot, Edit2, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi, messageApi } from '../api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: chatbots = [], isLoading: isBotsLoading } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ['dashboardStats'],
    queryFn: () => chatbotApi.getDashboardStats(),
  });

  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations() as Promise<any[]>,
  });

  const deleteChatbotMutation = useMutation({
    mutationFn: (botId: string) => chatbotApi.deleteChatbot(botId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });

  const handleDelete = (botId: string, botName: string) => {
    if (window.confirm(`Are you sure you want to delete "${botName}"? This action cannot be undone.`)) {
      deleteChatbotMutation.mutate(botId);
    }
  };

  const filteredBots = chatbots.map(bot => ({
    id: bot.id,
    name: bot.name,
    status: bot.is_public ? 'active' : 'inactive',
    model: bot.model || 'gpt-3.5-turbo',
    docsCount: bot.docsCount || 0,
    conversationsCount: bot.conversations_count !== undefined ? bot.conversations_count : conversations.filter((c: any) => c.chatbot_id === bot.id).length,
    messagesCount: bot.messages_count !== undefined ? bot.messages_count : 0,
    lastUpdated: bot.updated_at ? new Date(bot.updated_at).toLocaleDateString() : 'Just now'
  })).filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              Workspace Overview
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Chatbot Management Dashboard
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Monitor active chatbots, knowledge documents, and visitor chat sessions.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            onClick={() => navigate('/builder')}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-glow-sm hover:shadow-glow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Chatbot</span>
          </button>
        </div>

        {/* Ambient Gradient Glow inside Header */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/10 blur-3xl pointer-events-none -z-0" />
      </header>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Chatbots</p>
            <p className="font-display text-2xl font-bold text-white">
              {stats?.active_chatbots !== undefined ? `${stats.active_chatbots}` : `${chatbots.length}`}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for embeds
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conversations</p>
            <p className="font-display text-2xl font-bold text-white">
              {stats?.total_conversations !== undefined ? stats.total_conversations : conversations.length}
            </p>
            <p className="text-[10px] text-purple-400 font-medium">Session threads</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Messages Logged</p>
            <p className="font-display text-2xl font-bold text-white">
              {stats?.total_messages !== undefined ? stats.total_messages : 0}
            </p>
            <p className="text-[10px] text-cyan-400 font-medium">Auto-summarized</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RAG Documents</p>
            <p className="font-display text-2xl font-bold text-white">
              {stats?.total_documents !== undefined ? stats.total_documents : 0}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">Qdrant Vector DB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Files className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section: Chatbots List */}
      <section className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/60">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Your AI Chatbots ({filteredBots.length})</h2>
            <p className="text-xs text-slate-400">Click preview to test widget or edit chatbot configuration.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chatbots..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Chatbot Name</th>
                <th className="py-4 px-6 font-bold">Model String</th>
                <th className="py-4 px-6 font-bold">Conversations</th>
                <th className="py-4 px-6 font-bold">Messages</th>
                <th className="py-4 px-6 font-bold">Last Updated</th>
                <th className="py-4 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {isBotsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading chatbots from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-3">
                    <p>No chatbots found. Create a chatbot to get started!</p>
                    <button
                      onClick={() => navigate('/builder')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create Chatbot
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBots.map((bot: any) => (
                  <tr key={bot.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 font-bold">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{bot.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Public Widget Active</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-[11px] font-semibold bg-slate-900 text-indigo-300 px-3 py-1 rounded-lg border border-slate-800 inline-block">
                        {bot.model}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-200">{bot.conversationsCount}</td>

                    <td className="py-4 px-6 font-semibold text-cyan-400">{bot.messagesCount}</td>

                    <td className="py-4 px-6 text-slate-400">{bot.lastUpdated}</td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => window.open(`/preview/${bot.id}`, '_blank')}
                          className="px-3 py-1.5 text-[11px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition-colors flex items-center gap-1.5"
                          title="Open Standalone Preview Sandbox"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Preview
                        </button>

                        <button 
                          onClick={() => navigate(`/builder?botId=${bot.id}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Chatbot Configurations"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleDelete(bot.id, bot.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Chatbot"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
