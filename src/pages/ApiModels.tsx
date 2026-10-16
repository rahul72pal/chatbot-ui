import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Save, Cpu, Sliders, Check, Sparkles, CheckCircle2 } from 'lucide-react';
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
      if (existingConfig.config_type === 'custom') {
        setProvider('custom');
      } else if (existingConfig.provider) {
        setProvider(existingConfig.provider);
      }
      if (existingConfig.default_model || existingConfig.model) {
        setModelName(existingConfig.default_model || existingConfig.model);
      }
      if (existingConfig.api_key) setApiKey(existingConfig.api_key);
      if (existingConfig.base_url) setBaseUrl(existingConfig.base_url);
      if (existingConfig.temperature !== undefined) setTemperature(existingConfig.temperature);
      if (existingConfig.max_tokens !== undefined) setMaxTokens(existingConfig.max_tokens);
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] p-6 sm:p-7 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold">
              Global AI Setup
            </span>
            {editingConfigId && (
              <span className="px-3 py-1 rounded-full bg-[#10D6A0]/10 border border-[#10D6A0]/30 text-[#10D6A0] text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Config ID: {editingConfigId.slice(0, 8)}...
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            {editingConfigId ? 'Edit LLM Configuration & Models' : 'LLM Configuration & Models'}
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Manage workspace AI provider credentials, manual string model names, and generation parameters.
          </p>
        </div>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main LLM Config Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* LLM Provider & Model Section */}
          <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl space-y-6">
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4">
              <Cpu className="w-4 h-4 text-indigo-400" />
              LLM Provider & String Model
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A3B3CF]">LLM Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['openai', 'anthropic', 'gemini', 'custom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      provider === p 
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] border-indigo-400 text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)]' 
                        : 'bg-[#101D39] border-[#1C2C4B] text-[#71829F] hover:text-[#F3F6FF] hover:border-[#243653]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual String Input for Model Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A3B3CF]">
                Model Name (Manual Text Entry)
              </label>
              <input 
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4o, deepseek-chat, claude-3-5-sonnet-20241022"
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs font-mono text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
              />
              <p className="text-[11px] text-[#71829F]">Type any string model name supported by your LLM API endpoint.</p>
            </div>

            {provider === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A3B3CF]">Custom API Base URL</label>
                <input 
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.your-custom-llm.com/v1"
                  className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs font-mono text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            )}
          </section>

          {/* API Token Credentials */}
          <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl space-y-5">
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4">
              <Key className="w-4 h-4 text-indigo-400" />
              API Secret Key Token
            </h2>

            <div className="relative">
              <input 
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full font-mono text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 pr-24 focus:outline-none focus:border-[#4F46E5]"
                placeholder="Enter API token secret..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1.5 text-[#71829F] hover:text-[#F3F6FF] transition-colors"
                >
                  {isCopied ? <span className="text-[10px] text-[#10D6A0] font-sans font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          {/* Global Hyperparameters: Temperature & Max Tokens */}
          <section className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl space-y-6">
            <h2 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2.5 border-b border-[#1C2C4B] pb-4">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Hyperparameters & Temperature
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#A3B3CF]">Temperature</label>
                  <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-xs">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <div className="relative flex items-center h-10">
                  <input 
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg cursor-pointer accent-indigo-500 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #4F46E5 0%, #7C3AED ${(temperature / 2) * 100}%, #101D39 ${(temperature / 2) * 100}%, #101D39 100%)`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#A3B3CF]">Max Token Limit</label>
                  <span className="font-mono text-purple-400 font-bold bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-lg text-xs">
                    {maxTokens} Tokens
                  </span>
                </div>
                <input 
                  type="number"
                  min="100"
                  max="4000"
                  step="50"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 100)}
                  className="w-full h-10 bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-2 text-xs font-mono text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1C2C4B] flex justify-end">
              <button 
                type="submit"
                disabled={saveConfigMutation.isPending}
                className="btn-primary-gradient px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-[#10D6A0]" /> : <Save className="w-4 h-4" />}
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
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-6 rounded-2xl shadow-xl space-y-4 text-xs text-[#A3B3CF] leading-relaxed">
            <h3 className="font-display font-bold text-sm text-[#F3F6FF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Manual String Models
            </h3>
            <p>Your LLM configuration defines the default AI provider, model name, and generation hyperparameters for all chatbots in your workspace.</p>
            <div className="p-4 bg-[#101D39] rounded-xl border border-[#1C2C4B] space-y-1 text-[#C7D2FE]">
              <span className="font-bold block text-[#F3F6FF]">Manual String Entry:</span>
              <p className="text-[11px] leading-relaxed text-[#71829F]">You can manually enter any model string name supported by your API provider (e.g. gpt-4o, deepseek-chat, claude-3-5-sonnet-20241022).</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default ApiModels;
