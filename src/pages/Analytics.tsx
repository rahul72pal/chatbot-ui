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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              System Intelligence & Usage Limits
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            Usage Analytics & Resource Limits
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Real-time metric aggregation across chatbots, uploaded documents, conversations, and LLM token usage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl px-3.5 py-2.5 transition-all border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div className="text-xs">
              <p className="text-slate-300 font-bold">Account Plan Limits</p>
              <p className="text-[11px] text-slate-400">5 Chatbots • 2 Docs/Bot • 2MB Max</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Chatbots Limit Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created Chatbots</p>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-white">
              {totals.chatbots} <span className="text-xs text-slate-400 font-normal">/ {limits.max_chatbots} max</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${totals.chatbots >= limits.max_chatbots ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
              {totals.chatbots >= limits.max_chatbots ? 'Limit Reached' : `${limits.max_chatbots - totals.chatbots} Available`}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all ${totals.chatbots >= limits.max_chatbots ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
              style={{ width: `${Math.min(100, (totals.chatbots / limits.max_chatbots) * 100)}%` }}
            />
          </div>
        </div>

        {/* Total Documents Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Documents</p>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-white">{totals.documents}</span>
            <span className="text-xs font-bold text-cyan-300">Max 2 Docs / Bot</span>
          </div>
          <p className="text-[11px] text-slate-400">Max file size: <strong>2 MB</strong> per PDF</p>
        </div>

        {/* Conversations & Messages Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Conversations</p>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-white">{totals.conversations}</span>
            <span className="text-xs font-bold text-slate-400">{totals.messages} msgs</span>
          </div>
          <p className="text-[11px] text-slate-400">Active chat sessions across all bots</p>
        </div>

        {/* Token Usage Card */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total LLM Tokens</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-2xl font-bold text-white">{totals.total_tokens.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">Tokens</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Prompt: {totals.prompt_tokens.toLocaleString()}</span>
            <span>Completion: {totals.completion_tokens.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chatbots Performance Table */}
        <section className="lg:col-span-2 glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
          <h2 className="font-display font-bold text-base text-white flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>Chatbot Resource Breakdown</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              {chatbotsList.length} / 5 Chatbots
            </span>
          </h2>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading analytics breakdown...</div>
          ) : chatbotsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No chatbots created yet. Create a chatbot in the Builder to view metrics.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-800/60 pb-2">
                    <th className="pb-3 font-bold">Chatbot Name</th>
                    <th className="pb-3 font-bold">Linked Docs (Max 2)</th>
                    <th className="pb-3 font-bold text-right">Conversations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {chatbotsList.map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-indigo-400" />
                          <span>{cb.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            cb.doc_count >= 2 ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {cb.doc_count} / 2 docs
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-indigo-300">
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
        <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4 mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Platform System Rules</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enforced limitations to guarantee system stability and optimal RAG performance.
            </p>

            <ul className="space-y-3 text-xs">
              <li className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300">Max Chatbots Per Account</span>
                </div>
                <span className="font-bold text-white font-mono">5 Chatbots</span>
              </li>

              <li className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Max Documents Per Chatbot</span>
                </div>
                <span className="font-bold text-white font-mono">2 PDFs</span>
              </li>

              <li className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Max PDF File Size</span>
                </div>
                <span className="font-bold text-white font-mono">2.0 MB</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 leading-relaxed">
            <p className="font-bold mb-1">RAG Optimization Active</p>
            <p className="text-[11px] text-slate-400">
              Query Rewriting, Qdrant multi-query vector search, deduplication, and score reranking are enabled across all active chatbots.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Analytics;
