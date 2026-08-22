import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Save, Cpu, Sliders, Check, Sparkles, CheckCircle2, Database } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../api';
import { useToast } from '../hooks/useToast';

export const ApiModels: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showKey, setShowKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Form states for LLM Configuration
  const [provider, setProvider] = useState('openai');
  const [modelName, setModelName] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);

  // Per-User Qdrant Vector DB states
  const [qdrantUrl, setQdrantUrl] = useState('');
  const [qdrantApiKey, setQdrantApiKey] = useState('');
  const [qdrantCollectionName, setQdrantCollectionName] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Fetch current LLM config
  const { data: configs } = useQuery<any>({
    queryKey: ['llmConfigs'],
    queryFn: () => configApi.getLLMConfigs(),
  });

  const configsList = Array.isArray(configs)
    ? configs
    : (configs as any)?.data && Array.isArray((configs as any).data)
    ? (configs as any).data
    : [];
  const existingConfig = configsList.length > 0 ? configsList[0] : null;

  useEffect(() => {
    if (existingConfig) {
      setEditingConfigId(existingConfig.id);
      if (existingConfig.provider) setProvider(existingConfig.provider);
      if (existingConfig.default_model || existingConfig.model) {
        setModelName(existingConfig.default_model || existingConfig.model);
      }
      if (existingConfig.api_key) setApiKey(existingConfig.api_key);
      if (existingConfig.base_url) setBaseUrl(existingConfig.base_url);
      if (existingConfig.temperature !== undefined) setTemperature(existingConfig.temperature);
      if (existingConfig.max_tokens !== undefined) setMaxTokens(existingConfig.max_tokens);
      if (existingConfig.qdrant_url) setQdrantUrl(existingConfig.qdrant_url);
      if (existingConfig.qdrant_api_key) setQdrantApiKey(existingConfig.qdrant_api_key);
      if (existingConfig.qdrant_collection_name) setQdrantCollectionName(existingConfig.qdrant_collection_name);
    }
  }, [existingConfig]);

  const saveConfigMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string | null; payload: any }) => {
      if (id) {
        return configApi.updateLLMConfig(id, payload);
      }
      return configApi.saveLLMConfig(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmConfigs'] });
      setSaveSuccess(true);
      toast.success('LLM model parameters & credentials saved!', 'Settings Saved');
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save settings', 'Save Error');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      config_type: provider === 'custom' ? 'custom' : 'provider',
      provider,
      default_model: modelName,
      model: modelName,
      api_key: apiKey,
      base_url: baseUrl,
      temperature: Number(temperature),
      max_tokens: Number(maxTokens),
    };
    
    if (qdrantApiKey) payload.qdrant_api_key = qdrantApiKey;
    if (qdrantCollectionName) payload.qdrant_collection_name = qdrantCollectionName;
    if (qdrantUrl) payload.qdrant_url = qdrantUrl;
    
    const targetId = editingConfigId || existingConfig?.id;
    saveConfigMutation.mutate({ id: targetId, payload });
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <header className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            Global AI Setup
          </span>
          {editingConfigId && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active Config ID: {editingConfigId.slice(0, 8)}...
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          {editingConfigId ? 'Edit LLM Configuration & Models' : 'LLM Configuration & Models'}
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Manage workspace AI provider credentials, manual string model names, and generation parameters.
        </p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main LLM Config Options */}
        <div className="md:col-span-2 space-y-6">
          
          {/* LLM Provider & Model Section */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Cpu className="w-5 h-5 text-indigo-400" />
              LLM Provider & String Model
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">LLM Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['openai', 'anthropic', 'gemini', 'custom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      provider === p 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-sm' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual String Input for Model Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Model Name (Manual Text Entry)
              </label>
              <input 
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4o, deepseek-chat, claude-3-5-sonnet-20241022"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">Type any string model name supported by your LLM API endpoint.</p>
            </div>

            {provider === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Custom API Base URL</label>
                <input 
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.your-custom-llm.com/v1"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </section>

          {/* API Token Credentials */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-5">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Key className="w-5 h-5 text-indigo-400" />
              API Secret Key Token
            </h2>

            <div className="relative">
              <input 
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full font-mono text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 pr-24 focus:outline-none focus:border-indigo-500"
                placeholder="Enter API token secret..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {isCopied ? <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          {/* User Qdrant Vector DB Credentials */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-5">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Database className="w-5 h-5 text-cyan-400" />
              Qdrant Vector Database Credentials
            </h2>
            <p className="text-xs text-slate-400">
              Provide your personal Qdrant API Key and Collection Name to route vector document search to your custom Qdrant DB.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Qdrant API Key</label>
                <input 
                  type="password"
                  value={qdrantApiKey}
                  onChange={(e) => setQdrantApiKey(e.target.value)}
                  placeholder="User Qdrant API Key"
                  className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Collection Name</label>
                <input 
                  type="text"
                  value={qdrantCollectionName}
                  onChange={(e) => setQdrantCollectionName(e.target.value)}
                  placeholder="e.g. my_company_docs"
                  className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Qdrant Server URL (Optional)</label>
              <input 
                type="url"
                value={qdrantUrl}
                onChange={(e) => setQdrantUrl(e.target.value)}
                placeholder="e.g. https://xyz.qdrant.tech or http://localhost:6333"
                className="w-full text-xs text-white bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </section>

          {/* Global Hyperparameters: Temperature & Max Tokens */}
          <section className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800/80 space-y-6">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Hyperparameters & Temperature
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-slate-300">Temperature</label>
                  <span className="font-mono text-indigo-400 font-bold">{temperature}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-700 mt-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Max Token Limit</label>
                <input 
                  type="number"
                  min="100"
                  max="4000"
                  step="50"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="submit"
                disabled={saveConfigMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-glow-sm disabled:opacity-50"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                {saveConfigMutation.isPending
                  ? 'Saving Config...'
                  : saveSuccess
                  ? 'Saved Successfully!'
                  : editingConfigId
                  ? 'Update LLM Configuration'
                  : 'Save LLM Configuration'}
              </button>
            </div>
          </section>
        </div>

        {/* Info Sidebar */}
        <aside className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Manual String Models
            </h3>
            <p>Your LLM configuration defines the default AI provider, model name, and generation hyperparameters for all chatbots in your workspace.</p>
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 space-y-1 text-indigo-200">
              <span className="font-bold block text-white">Manual String Entry:</span>
              <p className="text-[11px] leading-relaxed">You can manually enter any model string name supported by your API provider (e.g. gpt-4o, deepseek-chat, claude-3-5-sonnet-20241022).</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default ApiModels;
