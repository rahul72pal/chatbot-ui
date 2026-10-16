import React from 'react';
import { Bot, FileText, MessageSquare, Cpu, ShieldCheck, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api';
import type { AnalyticsOverview } from '../api';

export const Analytics: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery<AnalyticsOverview>({
    queryKey: ['analyticsOverview'],
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 0,
    refetchOnMount: true,
  });

  const totals = analytics?.totals || {
    chatbots: 0,
    chatbots_limit: 5,
    documents: 0,
    conversations: 0,
    messages: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  };

  const limits = analytics?.limits || {
    max_chatbots: 5,
    max_docs_per_chatbot: 2,
    max_doc_size_mb: 2.0
  };

  const chatbotsList = analytics?.chatbots || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['analyticsOverview'] });
    refetch();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#22D3EE] text-[11px] font-semibold">
              System Intelligence & Usage Limits
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            Usage Analytics & Resource Limits
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Real-time metric aggregation across chatbots, uploaded documents, conversations, and LLM token usage.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-semibold text-xs rounded-xl px-4 py-2.5 transition-all border border-[#1C2C4B] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 bg-[#101D39] border border-[#1C2C4B] p-2.5 px-3.5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div className="text-xs">
              <p className="text-[#F3F6FF] font-bold">Account Plan</p>
              <p className="text-[10px] text-[#71829F]">5 Chatbots • 2 Docs/Bot</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chatbots Limit Card */}
        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Created Chatbots</p>
            <div className="p-2 rounded-xl bg-[#142342] border border-[#243653] text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-[#F3F6FF]">
              {totals.chatbots} <span className="text-xs text-[#71829F] font-normal">/ {limits.max_chatbots} max</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              totals.chatbots >= limits.max_chatbots 
                ? 'bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/30' 
                : 'bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/30'
            }`}>
              {totals.chatbots >= limits.max_chatbots ? 'Limit Reached' : `${limits.max_chatbots - totals.chatbots} Available`}
            </span>
          </div>
          <div className="w-full bg-[#101D39] h-2 rounded-full overflow-hidden border border-[#1C2C4B]">
            <div 
              className={`h-full rounded-full transition-all ${totals.chatbots >= limits.max_chatbots ? 'bg-[#FB7185]' : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]'}`}
              style={{ width: `${Math.min(100, (totals.chatbots / limits.max_chatbots) * 100)}%` }}
            />
          </div>
        </div>

        {/* Total Documents Card */}
        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Uploaded Documents</p>
            <div className="p-2 rounded-xl bg-[#142342] border border-[#243653] text-[#22D3EE]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-[#F3F6FF]">{totals.documents}</span>
            <span className="text-xs font-bold text-[#22D3EE]">Max 2 Docs / Bot</span>
          </div>
          <p className="text-[11px] text-[#71829F]">Max file size: <strong className="text-[#A3B3CF]">2 MB</strong> per PDF</p>
        </div>

        {/* Conversations & Messages Card */}
        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Total Conversations</p>
            <div className="p-2 rounded-xl bg-[#142342] border border-[#243653] text-[#A855F7]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-[#F3F6FF]">{totals.conversations}</span>
            <span className="text-xs font-bold text-[#A3B3CF]">{totals.messages} msgs</span>
          </div>
          <p className="text-[11px] text-[#71829F]">Active chat sessions across all bots</p>
        </div>

        {/* Token Usage Card */}
        <div className="bg-[#0D1730] border border-[#1C2C4B] p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider">Total LLM Tokens</p>
            <div className="p-2 rounded-xl bg-[#142342] border border-[#243653] text-[#10D6A0]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-[#F3F6FF]">{totals.total_tokens.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#10D6A0] font-mono">Tokens</span>
          </div>
          <div className="flex justify-between text-[10px] text-[#71829F]">
            <span>Prompt: {totals.prompt_tokens.toLocaleString()}</span>
            <span>Completion: {totals.completion_tokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbots Performance Table */}
        <section className="lg:col-span-2 bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl">
          <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center justify-between border-b border-[#1C2C4B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Chatbot Resource Breakdown</span>
            </div>
            <span className="text-xs text-[#71829F] font-normal">
              {chatbotsList.length} / 5 Chatbots
            </span>
          </h2>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#71829F]">Loading analytics breakdown...</div>
          ) : chatbotsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#71829F]">No chatbots created yet. Create a chatbot in the Builder to view metrics.</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[380px]">
                <thead>
                  <tr className="text-[#71829F] uppercase text-[10px] border-b border-[#1C2C4B] pb-2 whitespace-nowrap">
                    <th className="pb-3 font-bold min-w-[150px]">Chatbot Name</th>
                    <th className="pb-3 font-bold min-w-[130px]">Linked Docs (Max 2)</th>
                    <th className="pb-3 font-bold text-right min-w-[100px]">Conversations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2C4B]/60">
                  {chatbotsList.map((cb) => (
                    <tr key={cb.id} className="hover:bg-[#101D39]/50 transition-colors">
                      <td className="py-3 font-semibold text-[#F3F6FF]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <span>{cb.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          cb.doc_count >= 2 
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                            : 'bg-[#101D39] text-[#A3B3CF] border border-[#1C2C4B]'
                        }`}>
                          {cb.doc_count} / 2 docs
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-indigo-400">
                        {cb.conversations_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* System Limits Summary Card */}
        <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4 mb-4">
              <Layers className="w-4 h-4 text-[#22D3EE]" />
              <span>Platform System Rules</span>
            </h2>
            <p className="text-xs text-[#71829F] leading-relaxed mb-4">
              Enforced limitations to guarantee system stability and optimal RAG performance.
            </p>

            <ul className="space-y-3 text-xs">
              <li className="p-3 bg-[#101D39] rounded-xl border border-[#1C2C4B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-[#A3B3CF]">Max Chatbots Per Account</span>
                </div>
                <span className="font-bold text-[#F3F6FF] font-mono">5 Chatbots</span>
              </li>

              <li className="p-3 bg-[#101D39] rounded-xl border border-[#1C2C4B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A855F7]" />
                  <span className="text-[#A3B3CF]">Max Documents Per Chatbot</span>
                </div>
                <span className="font-bold text-[#F3F6FF] font-mono">2 PDFs</span>
              </li>

              <li className="p-3 bg-[#101D39] rounded-xl border border-[#1C2C4B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                  <span className="text-[#A3B3CF]">Max PDF File Size</span>
                </div>
                <span className="font-bold text-[#F3F6FF] font-mono">2.0 MB</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
            <p className="font-bold mb-1">RAG Optimization Active</p>
            <p className="text-[11px] text-[#71829F]">
              Query Rewriting, Qdrant multi-query vector search, deduplication, and score reranking are enabled across all active chatbots.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
