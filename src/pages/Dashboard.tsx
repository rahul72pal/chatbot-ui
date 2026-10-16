import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Bot, 
  MessageSquare, 
  MessageCircle, 
  Files, 
  ArrowRight, 
  Zap, 
  BarChart2, 
  TrendingUp, 
  User, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi, messageApi, documentApi } from '../api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const { data: documents = [] } = useQuery<any[]>({
    queryKey: ['documents'],
    queryFn: () => documentApi.getDocuments('') as Promise<any[]>,
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

  const activeChatbotsCount = stats?.active_chatbots !== undefined ? stats.active_chatbots : chatbots.length;
  const conversationsCount = stats?.total_conversations !== undefined ? stats.total_conversations : conversations.length;
  const messagesCount = stats?.total_messages !== undefined ? stats.total_messages : 0;
  const documentsCount = stats?.total_documents !== undefined ? stats.total_documents : documents.length;

  const filteredBots = chatbots.map((bot, index) => ({
    id: bot.id,
    index: index + 1,
    name: bot.name,
    status: bot.is_public !== false ? 'active' : 'inactive',
    model: bot.model || bot.default_model || 'gpt-4o-mini',
    docsCount: bot.docsCount || 0,
    conversationsCount: bot.conversations_count !== undefined ? bot.conversations_count : conversations.filter((c: any) => c.chatbot_id === bot.id).length,
    messagesCount: bot.messages_count !== undefined ? bot.messages_count : 0,
    lastUpdated: bot.updated_at ? new Date(bot.updated_at).toLocaleDateString() : 'Just now'
  })).filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner Row: Hero Overview (Left) + Create New Chatbot (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Hero Overview Banner */}
        <div className="lg:col-span-2 bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold tracking-wide">
                Workspace Overview
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
                Chatbot Management Dashboard
              </h1>
              <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-lg leading-relaxed">
                Monitor active chatbots, knowledge documents, and visitor chat sessions.
              </p>
            </div>

            {/* Graphic Badge */}
            <div className="hidden sm:flex items-center gap-3 bg-[#101D39]/90 border border-[#243653] rounded-2xl p-3.5 backdrop-blur-md shadow-lg flex-shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1.5px] flex items-center justify-center shadow-glow-sm">
                <div className="w-full h-full bg-[#0D1730] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#F3F6FF] leading-snug">Build smarter chatbots</p>
                <p className="text-[11px] text-[#71829F]">with your data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Card: Create New Chatbot */}
        <div 
          onClick={() => navigate('/builder')}
          className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] border border-indigo-400/30 rounded-2xl p-6 sm:p-7 flex items-center justify-between cursor-pointer group shadow-[0_8px_25px_rgba(79,70,229,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Chatbot</h2>
              <p className="text-xs text-white/80 mt-0.5">Start building your AI assistant</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Chatbots */}
        <div 
          onClick={() => navigate('/chatbots')}
          className="bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] hover:border-[#4F46E5]/40 rounded-2xl p-5 flex items-center justify-between transition-all group cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#818CF8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Active Chatbots</p>
              <p className="font-display text-2xl font-bold text-[#F3F6FF]">{activeChatbotsCount}</p>
              <p className="text-[11px] text-[#10D6A0] font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse" />
                Ready for embeds
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#142342] text-[#71829F] group-hover:text-[#F3F6FF] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 2: Conversations */}
        <div 
          onClick={() => navigate('/conversations')}
          className="bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] hover:border-[#7C3AED]/40 rounded-2xl p-5 flex items-center justify-between transition-all group cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#A855F7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Conversations</p>
              <p className="font-display text-2xl font-bold text-[#F3F6FF]">{conversationsCount}</p>
              <p className="text-[11px] text-[#A855F7] font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                Session threads
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#142342] text-[#71829F] group-hover:text-[#F3F6FF] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3: Messages Logged */}
        <div 
          onClick={() => navigate('/conversations')}
          className="bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] hover:border-[#22D3EE]/40 rounded-2xl p-5 flex items-center justify-between transition-all group cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#22D3EE] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Messages Logged</p>
              <p className="font-display text-2xl font-bold text-[#F3F6FF]">{messagesCount}</p>
              <p className="text-[11px] text-[#22D3EE] font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                Auto-summarized
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#142342] text-[#71829F] group-hover:text-[#F3F6FF] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4: RAG Documents */}
        <div 
          onClick={() => navigate('/documents')}
          className="bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] hover:border-[#10D6A0]/40 rounded-2xl p-5 flex items-center justify-between transition-all group cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#142342] border border-[#243653] text-[#10D6A0] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Files className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">RAG Documents</p>
              <p className="font-display text-2xl font-bold text-[#F3F6FF]">{documentsCount}</p>
              <p className="text-[11px] text-[#10D6A0] font-medium flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse" />
                Qdrant Vector DB
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-[#142342] text-[#71829F] group-hover:text-[#F3F6FF] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Split Area: Left (Chatbot List) + Right (Recent Activity & Quick Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Your AI Chatbots Table Card */}
        <div className="lg:col-span-2 bg-[#0D1730] border border-[#1C2C4B] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            {/* Table Header Controls */}
            <div className="p-5 sm:p-6 border-b border-[#1C2C4B] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[#F3F6FF]">
                  Your AI Chatbots ({filteredBots.length})
                </h2>
                <p className="text-xs text-[#71829F] mt-0.5">
                  Click preview to test widget or edit chatbot configuration.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-[#71829F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search chatbots..."
                    className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-3.5 pr-8 py-1.5 text-xs text-[#A3B3CF] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#71829F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Desktop & Tablet Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#1C2C4B] bg-[#091121] text-[#71829F] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    <th className="py-3.5 px-4 font-bold w-12 text-center">#</th>
                    <th className="py-3.5 px-4 font-bold min-w-[190px]">Chatbot Name</th>
                    <th className="py-3.5 px-4 font-bold min-w-[130px]">Model String</th>
                    <th className="py-3.5 px-4 font-bold min-w-[105px]">Conversations</th>
                    <th className="py-3.5 px-4 font-bold min-w-[90px]">Messages</th>
                    <th className="py-3.5 px-4 font-bold min-w-[110px]">Last Updated</th>
                    <th className="py-3.5 px-4 text-right font-bold min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2C4B] text-xs">
                  {isBotsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#A3B3CF]">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs">Loading chatbots from backend...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                          {/* Glowing Robot Icon Card matching reference */}
                          <div className="w-16 h-16 rounded-2xl bg-[#101D39] border border-[#243653] flex items-center justify-center text-[#818CF8] shadow-[0_0_30px_rgba(79,70,229,0.25)]">
                            <Bot className="w-8 h-8 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-[#F3F6FF]">No chatbots found</h3>
                            <p className="text-xs text-[#71829F] mt-1">
                              Create your first chatbot to get started with AI-powered conversations.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate('/builder')}
                            className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create New Chatbot</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBots.map((bot) => (
                      <tr key={bot.id} className="hover:bg-[#101D39]/60 transition-colors group">
                        <td className="py-4 px-4 font-mono text-[11px] text-[#71829F] text-center whitespace-nowrap">{bot.index}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#F3F6FF] text-xs whitespace-nowrap">{bot.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse flex-shrink-0" />
                                <span className="text-[10px] font-semibold text-[#10D6A0] uppercase tracking-wider whitespace-nowrap">
                                  Public Widget Active
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-semibold bg-[#101D39] text-[#C7D2FE] px-2.5 py-1 rounded-lg border border-[#1C2C4B] whitespace-nowrap inline-flex items-center">
                            {bot.model}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-semibold text-[#F3F6FF] whitespace-nowrap">{bot.conversationsCount}</td>

                        <td className="py-4 px-4 font-semibold text-[#22D3EE] whitespace-nowrap">{bot.messagesCount}</td>

                        <td className="py-4 px-4 text-[#71829F] text-[11px] whitespace-nowrap">{bot.lastUpdated}</td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button 
                              onClick={() => window.open(`/preview/${bot.id}`, '_blank')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#142342] text-[#C7D2FE] border border-[#243653] rounded-lg hover:bg-[#1C2C4B] hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
                              title="Open Standalone Preview"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Preview
                            </button>

                            <button 
                              onClick={() => navigate(`/builder?botId=${bot.id}`)}
                              className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
                              title="Edit Chatbot Configurations"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => handleDelete(bot.id, bot.name)}
                              className="p-1.5 text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-lg transition-colors"
                              title="Delete Chatbot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 640px) */}
            <div className="block sm:hidden divide-y divide-[#1C2C4B]">
              {isBotsLoading ? (
                <div className="py-12 text-center text-[#A3B3CF]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-7 h-7 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading chatbots from backend...</span>
                  </div>
                </div>
              ) : filteredBots.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#101D39] border border-[#243653] flex items-center justify-center text-indigo-400">
                      <Bot className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#F3F6FF]">No chatbots found</h3>
                      <p className="text-xs text-[#71829F] mt-1">
                        Create your first chatbot to get started.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/builder')}
                      className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Chatbot</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredBots.map((bot) => (
                  <div key={bot.id} className="p-4 flex flex-col gap-3 hover:bg-[#101D39]/40 transition-colors">
                    {/* Top Row: Info & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#F3F6FF] text-sm truncate">{bot.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0] animate-pulse flex-shrink-0" />
                            <span className="text-[10px] font-semibold text-[#10D6A0] uppercase tracking-wider">
                              Public Active
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={() => window.open(`/preview/${bot.id}`, '_blank')}
                          className="px-2 py-1 text-[11px] font-semibold bg-[#142342] text-[#C7D2FE] border border-[#243653] rounded-lg hover:bg-[#1C2C4B] transition-colors flex items-center gap-1"
                          title="Open Standalone Preview"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                        <button 
                          onClick={() => navigate(`/builder?botId=${bot.id}`)}
                          className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39] rounded-lg transition-colors"
                          title="Edit Chatbot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bot.id, bot.name)}
                          className="p-1.5 text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 rounded-lg transition-colors"
                          title="Delete Chatbot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Metadata Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[#101D39]/80 border border-[#1C2C4B] rounded-xl p-2.5 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#71829F] block mb-0.5">Model</span>
                        <span className="font-mono text-[11px] font-semibold text-[#C7D2FE] truncate block">
                          {bot.model}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71829F] block mb-0.5">Conversations</span>
                        <span className="font-semibold text-[#F3F6FF]">
                          {bot.conversationsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71829F] block mb-0.5">Messages</span>
                        <span className="font-semibold text-[#22D3EE]">
                          {bot.messagesCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Quick Stats */}
        <div className="flex flex-col gap-5">
          {/* Recent Activity Card matching reference */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2C4B]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-[#F3F6FF]">Recent Activity</h3>
              </div>
              <button 
                onClick={() => navigate('/conversations')}
                className="text-[11px] text-[#71829F] hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[#1C2C4B]/60 text-xs">
              {/* Item 1 */}
              <div className="py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#10D6A0]/15 border border-[#10D6A0]/30 text-[#10D6A0] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F3F6FF] truncate text-xs">New chatbot created</p>
                  <p className="text-[11px] text-[#71829F] truncate">Travel Assistant</p>
                </div>
                <span className="text-[10px] text-[#71829F] whitespace-nowrap">2h ago</span>
              </div>

              {/* Item 2 */}
              <div className="py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A855F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Files className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F3F6FF] truncate text-xs">Knowledge base updated</p>
                  <p className="text-[11px] text-[#71829F] truncate">Product Docs (5 files)</p>
                </div>
                <span className="text-[10px] text-[#71829F] whitespace-nowrap">5h ago</span>
              </div>

              {/* Item 3 */}
              <div className="py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F3F6FF] truncate text-xs">Conversation received</p>
                  <p className="text-[11px] text-[#71829F] truncate">User: "How does pricing work?"</p>
                </div>
                <span className="text-[10px] text-[#71829F] whitespace-nowrap">7h ago</span>
              </div>

              {/* Item 4 */}
              <div className="py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#22D3EE]/15 border border-[#22D3EE]/30 text-[#22D3EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Files className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F3F6FF] truncate text-xs">New document uploaded</p>
                  <p className="text-[11px] text-[#71829F] truncate">faq.pdf (2.4 MB)</p>
                </div>
                <span className="text-[10px] text-[#71829F] whitespace-nowrap">1d ago</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Card matching reference */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2C4B]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="font-display text-sm font-bold text-[#F3F6FF]">Quick Stats</h3>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#101D39] border border-[#1C2C4B] rounded-lg text-[11px] text-[#A3B3CF]">
                <span>Last 7 days</span>
                <ChevronDown className="w-3 h-3 text-[#71829F]" />
              </div>
            </div>

            {/* 2x2 Stats Grid matching reference */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {/* Stat 1 */}
              <div className="bg-[#101D39] border border-[#1C2C4B] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Total Chats</p>
                  <p className="font-display text-lg font-bold text-[#F3F6FF] mt-0.5">{conversationsCount}</p>
                </div>
                <div className="text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#101D39] border border-[#1C2C4B] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Total Users</p>
                  <p className="font-display text-lg font-bold text-[#F3F6FF] mt-0.5">
                    {conversationsCount > 0 ? conversationsCount : 0}
                  </p>
                </div>
                <div className="text-cyan-400">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#101D39] border border-[#1C2C4B] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Avg. Response Time</p>
                  <p className="font-display text-lg font-bold text-[#F3F6FF] mt-0.5">0ms</p>
                </div>
                <div className="text-[#10D6A0]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-[#101D39] border border-[#1C2C4B] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Uptime</p>
                  <p className="font-display text-lg font-bold text-[#F3F6FF] mt-0.5">100%</p>
                </div>
                <div className="text-[#10D6A0]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
