import React from 'react';
import { BarChart2, TrendingUp, Sparkles } from 'lucide-react';

export const Analytics: React.FC = () => {
  const topQueries = [
    { text: "How do I upgrade my plan?", count: 485, percentage: "38%" },
    { text: "What is your refund policy?", count: 320, percentage: "25%" },
    { text: "How do I reset my password?", count: 180, percentage: "14%" },
    { text: "Where is the API keys tab?", count: 110, percentage: "8%" },
    { text: "Can I connect my own custom database?", count: 85, percentage: "6%" }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            System Intelligence
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          Usage Analytics & Performance
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Review conversation activity, retrieval hits metrics, and model latency statistics.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Conversations</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-white">12,845</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +12%</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Messages</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-white">45,210</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +8%</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Average Latency</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-white">0.92s</span>
            <span className="text-xs font-bold text-emerald-400">-0.2s speedup</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">RAG Context Hits</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-white">96.4%</span>
            <span className="text-xs font-bold text-emerald-400">+1.5% accuracy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graph representation */}
        <section className="lg:col-span-2 glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4 mb-6">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            Conversations Over Time (Last 7 Days)
          </h2>
          
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {[180, 240, 310, 290, 350, 420, 380].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-indigo-300">{val}</span>
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 rounded-t-xl transition-all duration-200 relative group shadow-glow-sm"
                  style={{ height: `${(val / 450) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono p-1.5 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                    Day {idx + 1}: {val} convos
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Queries Table */}
        <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 flex flex-col">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Top Search Queries
          </h2>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {topQueries.map((query, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span className="truncate max-w-[70%]">{query.text}</span>
                  <span className="text-indigo-400 font-mono text-[11px]">{query.count} hits</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: query.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
