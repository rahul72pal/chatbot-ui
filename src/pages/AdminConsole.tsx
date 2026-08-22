import React, { useState } from 'react';
import { Activity, Sliders, Search, Database } from 'lucide-react';
import { mockLogs } from '../data/mockData';

export const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'config'>('logs');

  // Configuration State
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful support assistant for yourchatbot. Answer the user's questions based ONLY on the provided context."
  );

  // Logs state
  const logs = mockLogs;
  const [logsSearchTerm, setLogsSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.query.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
    log.response.toLowerCase().includes(logsSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Developer Header */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            System Operations
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          Admin & System Operations Console
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Inspect incoming invocation logs, vector indexing parameters, and Qdrant DB health.
        </p>
      </header>

      {/* Tabs list */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'logs' 
                ? 'border-indigo-500 text-white font-bold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            Developer System Logs
          </button>

          <button 
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'config' 
                ? 'border-indigo-500 text-white font-bold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            RAG System Parameters
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Collection: chatbot_documents</span>
        </div>
      </div>

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <section className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-display font-bold text-base text-white">System Invocation Logs</h2>
              <p className="text-xs text-slate-400 mt-0.5">Inspect incoming query execution logs and response speeds.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logsSearchTerm}
                onChange={(e) => setLogsSearchTerm(e.target.value)}
                placeholder="Search log queries..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">Timestamp</th>
                  <th className="py-4 px-6 font-bold">Query</th>
                  <th className="py-4 px-6 font-bold">Latency</th>
                  <th className="py-4 px-6 font-bold">Tokens</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-4 px-6 max-w-xs truncate font-sans text-white font-medium">{log.query}</td>
                      <td className="py-4 px-6 text-indigo-300">{log.latency}s</td>
                      <td className="py-4 px-6 text-slate-300">{log.tokens.in} in / {log.tokens.out} out</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">{log.model}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">No logs matched your search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CONFIGURATION TAB */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-6">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
                <Sliders className="w-5 h-5 text-indigo-400" /> RAG System Parameters
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Chunk Size (Tokens)</label>
                  <input 
                    type="number" 
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Chunk Overlap (Tokens)</label>
                  <input 
                    type="number" 
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <label className="text-slate-300">Model Temperature</label>
                  <span className="font-mono text-indigo-400 font-bold">{temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer border border-slate-700"
                />
              </div>
            </section>

            <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-4">
              <h2 className="font-display font-bold text-base text-white border-b border-slate-800 pb-4">
                Global System Prompt Template
              </h2>
              <textarea 
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-xs font-mono text-white leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
              />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-display font-bold text-sm text-white">RAG Configuration Info</h3>
              <p>RAG parameter values guide chunk indexing pipelines into Qdrant Vector Store.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
