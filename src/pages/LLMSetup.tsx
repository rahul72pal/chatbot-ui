import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Server, Key, AlertCircle, CheckCircle2, Loader2, RefreshCw, Layers } from 'lucide-react';
import { configApi, messageApi, chatbotApi } from '../api';
import { useToast } from '../hooks/useToast';

export const LLMSetup: React.FC = () => {
  const toast = useToast();
  const [configType, setConfigType] = useState<'provider' | 'custom'>('provider');
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  
  // Custom Endpoint fields
  const [customName, setCustomName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  
  // Common fields
  const [apiKey, setApiKey] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Testing Flow states
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResponse, setTestResponse] = useState<string>('');
  const [testError, setTestError] = useState<string>('');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch existing LLM configuration if present
  const { data: configsData } = useQuery({
    queryKey: ['llmConfigs'],
    queryFn: configApi.getLLMConfigs,
  });

  // Fetch chatbots list if available for test payload
  const { data: chatbots = [] } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  const configsList = Array.isArray(configsData)
    ? configsData
    : (configsData as any)?.data && Array.isArray((configsData as any).data)
    ? (configsData as any).data
    : [];
  const existingConfig = configsList.length > 0 ? configsList[0] : null;

  useEffect(() => {
    if (existingConfig) {
      setEditingConfigId(existingConfig.id);
      if (existingConfig.config_type === 'custom') {
        setConfigType('custom');
        setProvider('custom' as any);
        setCustomName(existingConfig.name || '');
        setCustomBaseUrl(existingConfig.base_url || '');
        setCustomModel(existingConfig.model || '');
      } else {
        setConfigType('provider');
        if (existingConfig.provider) {
          setProvider(existingConfig.provider as any);
        }
        if (existingConfig.default_model) {
          setDefaultModel(existingConfig.default_model);
        }
      }
      if (existingConfig.api_key) {
        setApiKey(existingConfig.api_key);
      }
    }
  }, [existingConfig]);

  const handleProviderChange = (prov: 'openai' | 'anthropic' | 'gemini') => {
    setProvider(prov);
    if (prov === 'openai') setDefaultModel('gpt-4o');
    else if (prov === 'anthropic') setDefaultModel('claude-3-5-sonnet-20241022');
    else if (prov === 'gemini') setDefaultModel('gemini-1.5-pro');
  };

  // Step 2: Test LLM config via /message route
  const runLLMTest = async () => {
    setIsTesting(true);
    setTestStatus('testing');
    setTestError('');
    setTestResponse('');

    try {
      const firstBotId = chatbots.length > 0 ? chatbots[0].id : undefined;
      const testPayload: any = {
        message: 'Hello! Please confirm this automated test message to verify my LLM API configuration.'
      };
      if (firstBotId) {
        testPayload.chatbot_id = firstBotId;
      }

      const res: any = await messageApi.sendMessage(testPayload);

      if (res && (res.message || res.success)) {
        setTestStatus('success');
        const respMsg = res.message || 'LLM Connection verified successfully!';
        setTestResponse(respMsg);
        toast.success(respMsg, 'Connection Verified');
      } else {
        throw new Error(res?.detail || 'Received unexpected response format from test message.');
      }
    } catch (err: any) {
      setTestStatus('failed');
      const detailMsg = err?.response?.data?.detail || err?.message || 'Failed to connect to LLM provider via /message endpoint.';
      const errStr = typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg);
      setTestError(errStr);
      toast.error(errStr, 'Connection Test Failed');
    } finally {
      setIsTesting(false);
    }
  };

  // Step 1: Save LLM Config
  const setupConfigMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string | null; payload: any }) => {
      if (id) {
        return configApi.updateLLMConfig(id, payload);
      }
      return configApi.saveLLMConfig(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llmConfigs'] });
      toast.success('LLM configuration saved. Running connection test...', 'Config Saved');
      runLLMTest();
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to save configuration. Please check your credentials.';
      setErrorMsg(msg);
      toast.error(msg, 'Save Error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!apiKey) {
      setErrorMsg('API Key is required.');
      return;
    }

    const payload: any = {
      config_type: configType,
      api_key: apiKey,
    };

    if (configType === 'provider') {
      payload.provider = provider;
      payload.default_model = defaultModel;
    } else {
      if (!customName || !customBaseUrl || !customModel) {
        setErrorMsg('Please fill in all custom endpoint fields.');
        return;
      }
      payload.provider = 'custom';
      payload.name = customName;
      payload.base_url = customBaseUrl;
      payload.model = customModel;
      payload.default_model = customModel;
    }

    const targetId = editingConfigId || existingConfig?.id;
    setupConfigMutation.mutate({ id: targetId, payload });
  };

  return (
    <div className="bg-[#070B14] text-[#F3F6FF] font-sans min-h-screen w-full flex items-center justify-center p-4 antialiased relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <main className="w-full max-w-[500px] flex flex-col items-center">
        {/* Header */}
        <header className="flex flex-col items-center mb-8 w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1.5px] shadow-glow-indigo mb-4">
            <div className="w-full h-full bg-[#080E1B] rounded-[14px] flex items-center justify-center overflow-hidden">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#F3F6FF] mb-1 tracking-tight">
            {editingConfigId ? 'Edit LLM Configuration' : 'Configure LLM Provider'}
          </h1>
          <p className="text-xs text-[#71829F]">
            {testStatus === 'testing' || testStatus === 'success' || testStatus === 'failed'
              ? 'Verifying LLM API connection via /message route before dashboard access.'
              : editingConfigId
              ? 'Update your saved language model credentials and provider settings.'
              : 'Connect your language model API key before launching your chatbots.'}
          </p>
        </header>

        {/* Step Indicator */}
        <div className="w-full flex items-center justify-between mb-6 px-2 text-xs font-semibold text-[#71829F]">
          <div className="flex items-center gap-2 text-indigo-400">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-[10px] text-white">1</span>
            <span>Configure LLM</span>
          </div>
          <div className="w-8 h-[1px] bg-[#1C2C4B]" />
          <div className={`flex items-center gap-2 ${testStatus !== 'idle' ? 'text-indigo-400' : 'text-[#71829F]'}`}>
            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
              testStatus === 'success' 
                ? 'bg-[#10D6A0] border-[#10D6A0] text-[#070B14]' 
                : testStatus === 'testing'
                ? 'bg-indigo-600 border-indigo-500 text-white animate-pulse'
                : 'border-[#1C2C4B] bg-[#101D39] text-[#71829F]'
            }`}>2</span>
            <span>Test Connection</span>
          </div>
        </div>

        {/* Setup Card */}
        <div className="w-full bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Active Testing View */}
          {testStatus !== 'idle' && (
            <div className="space-y-4">
              {testStatus === 'testing' && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-3 text-indigo-300 text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Testing LLM connection via /message endpoint...</span>
                  </div>
                  <p className="text-[11px] text-[#71829F] leading-relaxed">
                    Sending verification query to your model ({configType === 'provider' ? defaultModel : customModel})...
                  </p>
                </div>
              )}

              {testStatus === 'success' && (
                <div className="p-4 bg-[#10D6A0]/10 border border-[#10D6A0]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-[#10D6A0] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>LLM Connection Verified Successfully!</span>
                  </div>
                  {testResponse && (
                    <div className="p-3 bg-[#101D39] rounded-xl border border-[#1C2C4B] text-[11px] text-[#A3B3CF] font-mono leading-relaxed">
                      "{testResponse}"
                    </div>
                  )}
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTestStatus('idle')}
                      className="flex-1 bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-semibold text-xs rounded-xl py-2.5 px-3 transition-all border border-[#1C2C4B] flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                      Edit Config
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="flex-1 btn-primary-gradient rounded-xl py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 bg-[#10D6A0] hover:bg-[#10D6A0]/90 text-[#070B14] font-bold text-xs rounded-xl py-2.5 px-3 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Dashboard</span>
                    </button>
                  </div>
                </div>
              )}

              {testStatus === 'failed' && (
                <div className="p-4 bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-[#FB7185] text-xs font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>LLM Connection Test Failed</span>
                  </div>
                  <div className="p-3 bg-[#101D39] rounded-xl border border-[#1C2C4B] text-[11px] text-[#FB7185] font-mono leading-relaxed overflow-x-auto max-h-[120px] whitespace-pre-wrap">
                    {testError || 'Could not verify API credentials using the /message endpoint.'}
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTestStatus('idle')}
                      className="flex-1 bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-bold text-xs rounded-xl py-2.5 px-3 transition-all border border-[#1C2C4B] flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={runLLMTest}
                      className="flex-1 btn-primary-gradient rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      Retry Test
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-[#71829F] hover:text-[#F3F6FF] text-xs pt-1 underline flex items-center justify-center gap-1 transition-colors"
                  >
                    Skip & Proceed to Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Configuration Form (shown when idle or allowing edits) */}
          {(testStatus === 'idle' || testStatus === 'failed') && (
            <>
              {editingConfigId && testStatus === 'idle' && (
                <div className="p-3 bg-[#10D6A0]/10 border border-[#10D6A0]/30 text-[#10D6A0] text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Editing active configuration (ID: {editingConfigId.slice(0, 8)}...)</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Toggle Type */}
              <div className="flex gap-2 p-1 bg-[#101D39] border border-[#1C2C4B] rounded-xl">
                <button
                  type="button"
                  onClick={() => setConfigType('provider')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
                    configType === 'provider'
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                      : 'text-[#71829F] hover:text-[#F3F6FF]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Standard Provider
                </button>
                <button
                  type="button"
                  onClick={() => setConfigType('custom')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-lg transition-all ${
                    configType === 'custom'
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                      : 'text-[#71829F] hover:text-[#F3F6FF]'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  Custom Endpoint
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {configType === 'provider' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block">
                        Select Provider
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['openai', 'anthropic', 'gemini'] as const).map((prov) => (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => handleProviderChange(prov)}
                            className={`py-2.5 px-3 text-xs font-bold border rounded-xl capitalize transition-all ${
                              provider === prov
                                ? 'border-indigo-400 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                                : 'border-[#1C2C4B] bg-[#101D39] text-[#71829F] hover:text-[#F3F6FF]'
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="model">
                        Default Model Name
                      </label>
                      <input
                        id="model"
                        type="text"
                        value={defaultModel}
                        onChange={(e) => setDefaultModel(e.target.value)}
                        placeholder="e.g. gpt-4o, deepseek-chat, claude-3-5-sonnet-20241022"
                        className="w-full text-xs font-mono text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                      />
                      <p className="text-[11px] text-[#71829F]">Type any model string supported by your provider.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="custom-name">
                        Endpoint Name
                      </label>
                      <input
                        id="custom-name"
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. OpenRouter"
                        className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="custom-url">
                        Base URL
                      </label>
                      <input
                        id="custom-url"
                        type="url"
                        required
                        value={customBaseUrl}
                        onChange={(e) => setCustomBaseUrl(e.target.value)}
                        placeholder="https://openrouter.ai/api/v1"
                        className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="custom-model">
                        Model Identifier Name
                      </label>
                      <input
                        id="custom-model"
                        type="text"
                        required
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="deepseek/deepseek-chat"
                        className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </>
                )}

                {/* API Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#71829F] uppercase tracking-wider block" htmlFor="api-key">
                    API Key
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#71829F]">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="api-key"
                      type="password"
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your API secret key"
                      className="w-full text-xs text-[#F3F6FF] bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-10 pr-4 py-3 placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={setupConfigMutation.isPending || isTesting}
                    className="w-full btn-primary-gradient rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {setupConfigMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving configuration...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Test LLM Config</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LLMSetup;
