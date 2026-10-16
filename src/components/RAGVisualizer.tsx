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
    if (score >= 0.9) return 'bg-[#10D6A0]/10 text-[#10D6A0] border-[#10D6A0]/30';
    if (score >= 0.8) return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    return 'bg-[#142342] text-[#A3B3CF] border-[#243653]';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="text-[#FB7185] font-mono text-[10px] bg-[#FB7185]/10 border border-[#FB7185]/20 px-1 py-0.5 rounded font-bold">PDF</span>;
      case 'md':
        return <span className="text-[#22D3EE] font-mono text-[10px] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-1 py-0.5 rounded font-bold">MD</span>;
      default:
        return <span className="text-[#FBBF24] font-mono text-[10px] bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-1 py-0.5 rounded font-bold">HTML</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      {/* Left Columns: Search Results */}
      <div className="xl:col-span-2 flex flex-col">
        <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-[#1C2C4B] bg-[#091121] flex justify-between items-center">
            <h3 className="font-semibold text-xs text-[#F3F6FF] flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Vector Search Results
            </h3>
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#71829F] uppercase font-bold tracking-wider">Latency</span>
                <span className="font-mono text-xs text-[#F3F6FF] font-semibold">{latency}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#71829F] uppercase font-bold tracking-wider">Top-K</span>
                <span className="font-mono text-xs text-[#F3F6FF] font-semibold">{topK}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1C2C4B] bg-[#091121]/60 text-[10px] text-[#71829F] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-2.5 px-4 w-24 text-center">Score</th>
                  <th className="py-2.5 px-4 w-48">Document Source</th>
                  <th className="py-2.5 px-4">Chunk Preview</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#F3F6FF] divide-y divide-[#1C2C4B]">
                {results.length > 0 ? (
                  results.map((res) => (
                    <tr key={res.rank} className="hover:bg-[#101D39]/50 transition-colors group cursor-pointer">
                      <td className="py-3 px-4 text-center font-mono text-[#71829F]">{res.rank}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center font-mono text-[11px] px-2 py-0.5 rounded border ${getScoreColorClass(res.score)}`}>
                          {res.score.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(res.type)}
                          <span className="truncate font-medium group-hover:text-indigo-400 transition-colors text-xs">
                            {res.source}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-[#A3B3CF] line-clamp-2 leading-relaxed text-xs">
                          {res.preview}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#71829F] font-mono text-xs">
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
        <div className="bg-[#080E1B] rounded-2xl border border-[#1C2C4B] shadow-xl overflow-hidden flex flex-col h-full max-h-[500px]">
          <div className="px-4 py-3 border-b border-[#1C2C4B] flex justify-between items-center bg-[#091121] sticky top-0 z-10">
            <h3 className="font-mono text-xs text-[#A3B3CF] font-semibold flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Constructed Prompt
            </h3>
            <span className="text-[10px] bg-[#142342] text-indigo-300 border border-[#243653] px-2 py-0.5 rounded font-mono">
              LLM Context
            </span>
          </div>

          <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed text-[#A3B3CF] custom-scrollbar flex-1 space-y-4">
            <div>
              <span className="text-indigo-400 font-bold block mb-1">System:</span>
              <p className="pl-3 border-l-2 border-[#1C2C4B] text-[#71829F]">
                You are a helpful support assistant for yourchatbot. Answer the user's questions based ONLY on the provided context. If the answer is not in the context, say "I don't have that information."
              </p>
            </div>

            <div>
              <span className="text-[#FBBF24] font-bold block mb-1">Context Block:</span>
              <div className="pl-3 border-l-2 border-[#1C2C4B] space-y-2 mt-1">
                {results.length > 0 ? (
                  results.map((res) => (
                    <div key={res.rank} className="bg-[#0D1730] p-2.5 rounded-xl border border-[#1C2C4B]">
                      <span className="text-[#10D6A0] text-[10px] block mb-1 font-semibold">
                        --- Chunk {res.rank} (Score: {res.score.toFixed(2)}) ---
                      </span>
                      <p className="text-[11px] text-[#A3B3CF] line-clamp-3 leading-normal">
                        {res.preview}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#71829F] italic text-[11px]">No contexts injected.</p>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#FB7185] font-bold block mb-1">User Query:</span>
              <p className="pl-3 border-l-2 border-[#1C2C4B] text-[#F3F6FF] font-medium">
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
