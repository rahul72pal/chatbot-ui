import React from 'react';
import { Database, Terminal } from 'lucide-react';
import type { RetrievalResult } from '../types';

interface RAGVisualizerProps {
  query: string;
  results: RetrievalResult[];
  latency?: string;
  topK?: number;
}

export const RAGVisualizer: React.FC<RAGVisualizerProps> = ({
  query,
  results,
  latency = '240ms',
  topK = 3
}) => {
  const getScoreColorClass = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-surface-container-high text-on-surface border-border-subtle';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="text-red-500 font-mono text-[10px] bg-red-100 px-1 py-0.5 rounded font-bold">PDF</span>;
      case 'md':
        return <span className="text-blue-500 font-mono text-[10px] bg-blue-100 px-1 py-0.5 rounded font-bold">MD</span>;
      default:
        return <span className="text-amber-500 font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded font-bold">HTML</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Columns: Search Results */}
      <div className="xl:col-span-2 flex flex-col">
        <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
          <div className="px-4 py-3 border-b border-border-subtle bg-surface-bright flex justify-between items-center">
            <h3 className="font-semibold text-[15px] text-on-surface flex items-center gap-2">
              <Database className="w-[18px] h-[18px] text-primary" />
              Vector Search Results
            </h3>
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Latency</span>
                <span className="font-mono text-[13px] text-on-surface font-semibold">{latency}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Top-K</span>
                <span className="font-mono text-[13px] text-on-surface font-semibold">{topK}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-container-low/50 text-[11px] text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-2.5 px-4 w-24 text-center">Score</th>
                  <th className="py-2.5 px-4 w-48">Document Source</th>
                  <th className="py-2.5 px-4">Chunk Preview</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-on-surface divide-y divide-border-subtle">
                {results.length > 0 ? (
                  results.map((res) => (
                    <tr key={res.rank} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer">
                      <td className="py-3 px-4 text-center font-mono text-text-muted">{res.rank}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center font-mono text-[12px] px-2 py-0.5 rounded border ${getScoreColorClass(res.score)}`}>
                          {res.score.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(res.type)}
                          <span className="truncate font-medium group-hover:text-primary transition-colors">
                            {res.source}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-on-surface-variant line-clamp-2 leading-relaxed text-[13px]">
                          {res.preview}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-text-muted font-mono">
                      No documents retrieved. Enter a query to trigger vector search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Prompt Inspection */}
      <div className="flex flex-col">
        <div className="bg-code-bg rounded-xl border border-[#27272A] shadow-xl overflow-hidden flex flex-col h-full max-h-[500px]">
          <div className="px-4 py-3 border-b border-[#27272A] flex justify-between items-center bg-[#18181B] sticky top-0 z-10">
            <h3 className="font-mono text-[12px] text-[#A1A1AA] font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              Constructed Prompt
            </h3>
            <span className="text-[10px] bg-[#27272A] text-white px-2 py-0.5 rounded font-mono">
              LLM Context
            </span>
          </div>

          <div className="p-4 overflow-y-auto font-mono text-[12px] leading-relaxed text-[#D4D4D8] custom-scrollbar flex-1 space-y-4">
            <div>
              <span className="text-blue-400 font-bold block mb-1">System:</span>
              <p className="pl-3 border-l-2 border-[#3F3F46] text-[#A1A1AA]">
                You are a helpful support assistant for yourchatbot. Answer the user's questions based ONLY on the provided context. If the answer is not in the context, say "I don't have that information."
              </p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">Context Block:</span>
              <div className="pl-3 border-l-2 border-[#3F3F46] space-y-2 mt-1">
                {results.length > 0 ? (
                  results.map((res) => (
                    <div key={res.rank} className="bg-[#27272A]/40 p-2.5 rounded border border-[#27272A]">
                      <span className="text-emerald-400 text-[10px] block mb-1 font-semibold">
                        --- Chunk {res.rank} (Score: {res.score.toFixed(2)}) ---
                      </span>
                      <p className="text-[11px] text-[#A1A1AA] line-clamp-3 leading-normal">
                        {res.preview}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted italic text-[11px]">No contexts injected.</p>
                )}
              </div>
            </div>

            <div>
              <span className="text-pink-400 font-bold block mb-1">User Query:</span>
              <p className="pl-3 border-l-2 border-[#3F3F46] text-white font-medium">
                {query || "..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RAGVisualizer;
