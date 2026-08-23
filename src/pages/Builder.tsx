import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  FileText, 
  Palette, 
  SearchCode, 
  Rocket, 
  UploadCloud, 
  Check, 
  RefreshCw, 
  Copy, 
  ArrowLeft,
  Database,
  ExternalLink,
  Save,
  RotateCcw,
  HelpCircle,
  ShoppingBag,
  Headphones,
  Lock,
  Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi, documentApi } from '../api';
import { useToast } from '../hooks/useToast';
import { BASE_URL } from '../utils/apiClient';

interface FormValues {
  botName: string;
  welcomeMessage: string;
  systemPrompt: string;
  themeColor: string;
  avatar: 'support' | 'faq' | 'sales';
  position: 'left' | 'right';
  bubbleStyle: 'pill' | 'square' | 'rounded';
  openAutomatically: boolean;
  popAfterSeconds: number;
  showWelcomeTooltip: boolean;
}

export const Builder: React.FC = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const botId = searchParams.get('botId') || '';
  const isNewBot = !botId || botId.startsWith('chatbot-') || botId === 'new';

  const [activeSection, setActiveSection] = useState<'all' | 'appearance' | 'knowledge' | 'test' | 'deploy'>('all');

  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    setValue, 
    formState: { isDirty } 
  } = useForm<FormValues>({
    defaultValues: {
      botName: 'Support Assistant',
      welcomeMessage: 'Hi! How can I help you today?',
      systemPrompt: 'You are a helpful customer support AI agent.',
      themeColor: '#6366F1',
      avatar: 'support',
      position: 'right',
      bubbleStyle: 'rounded',
      openAutomatically: false,
      popAfterSeconds: 3,
      showWelcomeTooltip: true,
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const appearanceRef = useRef<HTMLDivElement>(null);
  const knowledgeRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  const deployRef = useRef<HTMLDivElement>(null);

  const { data: chatbotData } = useQuery({
    queryKey: ['chatbot', botId],
    queryFn: () => chatbotApi.getChatbot(botId),
    enabled: !!botId && !isNewBot,
  });

  const { data: documents = [], refetch: refetchDocs } = useQuery<any[]>({
    queryKey: ['documents', botId],
    queryFn: () => documentApi.getDocuments(botId) as Promise<any[]>,
    enabled: !!botId && !isNewBot,
  });

  useEffect(() => {
    if (chatbotData) {
      reset({
        botName: chatbotData.name || 'Support Assistant',
        welcomeMessage: chatbotData.welcome_message || 'Hi! How can I help you today?',
        systemPrompt: chatbotData.system_prompt || 'You are a helpful customer support AI agent.',
        themeColor: chatbotData.theme_color || '#6366F1',
        avatar: chatbotData.avatar_icon || 'support',
        position: chatbotData.position || 'right',
        bubbleStyle: chatbotData.bubble_style || 'rounded',
        openAutomatically: chatbotData.open_automatically ?? false,
        popAfterSeconds: chatbotData.pop_after_seconds ?? 3,
        showWelcomeTooltip: chatbotData.show_welcome_tooltip ?? true,
      });
    }
  }, [chatbotData, reset]);

  const saveChatbotMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.botName,
        welcome_message: values.welcomeMessage,
        description: values.welcomeMessage,
        system_prompt: values.systemPrompt,
        theme_color: values.themeColor,
        avatar_icon: values.avatar,
        position: values.position,
        bubble_style: values.bubbleStyle,
        open_automatically: values.openAutomatically,
        pop_after_seconds: Number(values.popAfterSeconds),
        show_welcome_tooltip: values.showWelcomeTooltip,
        is_public: true,
      };

      if (!isNewBot) {
        return chatbotApi.updateChatbot(botId, payload);
      } else {
        return chatbotApi.createChatbot(payload);
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ['chatbot', data.id] });
        setSearchParams({ botId: data.id });
      }
      toast.success('Chatbot configuration saved successfully!', 'Builder Saved');
      reset(watch());
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to save chatbot configurations.');
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => documentApi.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', botId] });
      refetchDocs();
    }
  });

  const currentThemeColor = watch('themeColor');
  const currentAvatar = watch('avatar');
  const currentBotName = watch('botName');

  // Fetch all chatbots for account limit check
  const { data: chatbots = [] } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  const onSubmit = (values: FormValues) => {
    if (isNewBot && chatbots.length >= 5) {
      toast.error('Limit reached: You can create a maximum of 5 chatbots per account.', 'Limit Reached');
      return;
    }
    saveChatbotMutation.mutate(values);
  };

  const handleDiscard = () => {
    if (chatbotData) {
      reset({
        botName: chatbotData.name || 'Support Assistant',
        welcomeMessage: chatbotData.welcome_message || 'Hi! How can I help you today?',
        systemPrompt: chatbotData.system_prompt || 'You are a helpful customer support AI agent.',
        themeColor: chatbotData.theme_color || '#6366F1',
        avatar: chatbotData.avatar_icon || 'support',
        position: chatbotData.position || 'right',
        bubbleStyle: chatbotData.bubble_style || 'rounded',
        openAutomatically: chatbotData.open_automatically ?? false,
        popAfterSeconds: chatbotData.pop_after_seconds ?? 3,
        showWelcomeTooltip: chatbotData.show_welcome_tooltip ?? true,
      });
    } else {
      reset();
    }
  };

  const scrollToSection = (section: 'appearance' | 'knowledge' | 'test' | 'deploy') => {
    setActiveSection(section);
    const refMap = {
      appearance: appearanceRef,
      knowledge: knowledgeRef,
      test: testRef,
      deploy: deployRef
    };
    refMap[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const embedCode = `<script 
  src="${BASE_URL}/widget.js" 
  data-chatbot-id="${botId || 'YOUR_BOT_ID'}" 
  defer>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (isNewBot) {
      alert('Please save the chatbot first before uploading documents.');
      return;
    }
    const file = e.target.files[0];

    // Enforce 2 MB size limit
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB} MB) exceeds the 2 MB limit. Please select a smaller PDF document.`, 'File Too Large');
      e.target.value = '';
      return;
    }

    // Enforce max 2 linked documents per chatbot
    if (documents.length >= 2) {
      toast.error('Limit reached: Each chatbot can only be linked to a maximum of 2 documents.', 'Limit Exceeded');
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('chatbot_id', botId);
    formData.append('file', file);

    documentApi.uploadDocument(formData)
      .then(() => {
        setIsUploading(false);
        queryClient.invalidateQueries({ queryKey: ['documents', botId] });
        refetchDocs();
      })
      .catch((err) => {
        setIsUploading(false);
        alert(err.message || 'Failed to upload document.');
      });
  };

  const colorSwatches = [
    { value: '#6366F1', name: 'Indigo' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#10B981', name: 'Emerald' },
    { value: '#F59E0B', name: 'Amber' },
    { value: '#EF4444', name: 'Ruby' },
    { value: '#A855F7', name: 'Purple' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-28 text-slate-100 font-sans w-full">
      {/* Full-width sticky sub-header attached directly to top navbar with 0 gap */}
      <div className="-mt-4 -mx-4 lg:-mt-6 lg:-mx-6 border-b border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-20 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/chatbots')}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-2 rounded-xl border border-slate-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chatbots
          </button>
          
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div>
            <h1 className="font-display text-sm font-bold text-white flex items-center gap-2">
              {currentBotName || 'Untitled Chatbot'}
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Single Page Builder
              </span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80 gap-1 text-xs">
          <button 
            type="button"
            onClick={() => scrollToSection('appearance')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'appearance' ? 'bg-indigo-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('knowledge')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'knowledge' ? 'bg-indigo-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Knowledge Base
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('test')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'test' ? 'bg-indigo-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SearchCode className="w-3.5 h-3.5" />
            Test
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('deploy')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'deploy' ? 'bg-indigo-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Deploy
          </button>
        </nav>

        {/* Dedicated Preview Button */}
        <div className="flex items-center gap-3">
          {!isNewBot && (
            <button
              type="button"
              onClick={() => window.open(`/preview/${botId}`, '_blank')}
              className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-600/20 hover:bg-indigo-600/30 px-3.5 py-2 rounded-xl border border-indigo-500/30 font-bold transition-all"
              title="Open Dedicated Chatbot Preview Page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              Dedicated Preview
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto pt-2 px-2 sm:px-4 flex flex-col gap-10">
        
        {/* SECTION 1: APPEARANCE & CUSTOMIZATION */}
        <div ref={appearanceRef} id="section-appearance" className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">1. Appearance & Customization</h2>
              <p className="text-xs text-slate-400">Define chatbot name, theme color, avatar icons, launcher alignment, and popups.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Chatbot Name</label>
              <input 
                type="text" 
                {...register('botName')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Welcome Message</label>
              <input 
                type="text" 
                {...register('welcomeMessage')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Custom Chatbot Behavior Instructions</label>
            <textarea 
              {...register('systemPrompt')}
              rows={3}
              placeholder="e.g., You are a friendly customer support agent for Acme Inc. Be polite, use concise answers, and sign off with '- Team Acme'."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
            <p className="text-[11px] text-slate-400">
              Defines the persona, identity, communication style, and custom instructions for your chatbot.
            </p>
          </div>

          {/* Theme Swatches */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Theme Color</label>
            <div className="flex items-center gap-3">
              {colorSwatches.map((c) => (
                <button 
                  key={c.value}
                  type="button"
                  onClick={() => setValue('themeColor', c.value, { shouldDirty: true })}
                  className="w-9 h-9 rounded-full border border-slate-700 relative hover:scale-110 transition-transform flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: c.value }}
                  aria-label={c.name}
                >
                  {currentThemeColor === c.value && <Check className="w-4 h-4" />}
                </button>
              ))}
              <input 
                type="color" 
                value={currentThemeColor} 
                onChange={(e) => setValue('themeColor', e.target.value, { shouldDirty: true })}
                className="w-9 h-9 rounded-xl cursor-pointer border border-slate-700 bg-transparent p-0"
                title="Custom color picker"
              />
            </div>
          </div>

          {/* Avatar Icon Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Avatar Icon</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setValue('avatar', 'support', { shouldDirty: true })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                  currentAvatar === 'support' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-sm' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                Support
              </button>

              <button
                type="button"
                onClick={() => setValue('avatar', 'faq', { shouldDirty: true })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                  currentAvatar === 'faq' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-sm' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                FAQ
              </button>

              <button
                type="button"
                onClick={() => setValue('avatar', 'sales', { shouldDirty: true })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                  currentAvatar === 'sales' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-sm' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Sales
              </button>
            </div>
          </div>

          {/* Position & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Position</label>
              <select 
                {...register('position')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="right">Right aligned</option>
                <option value="left">Left aligned</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Bubble Style</label>
              <select 
                {...register('bubbleStyle')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="rounded">Rounded Box</option>
                <option value="pill">Pill Shape</option>
                <option value="square">Sharp Square</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: KNOWLEDGE BASE & DOCUMENTS */}
        <div ref={knowledgeRef} id="section-knowledge" className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">2. Knowledge Base & RAG Documents</h2>
              <p className="text-xs text-slate-400">Upload PDF training documents indexed into Qdrant Vector Database.</p>
            </div>
          </div>

          {isNewBot ? (
            <div className="border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center bg-slate-900/60 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Save Chatbot First to Unlock Documents</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Click <strong>"Save Changes"</strong> in the bottom bar below to create your chatbot first before uploading documents.
              </p>
            </div>
          ) : (
            <>
              <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-3xl p-8 text-center bg-slate-900/60 relative transition-colors group">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept=".pdf"
                  disabled={isUploading}
                />
                <UploadCloud className="w-10 h-10 mx-auto text-slate-400 group-hover:text-indigo-400 transition-colors mb-3" />
                <p className="text-sm font-bold text-white">Click or drag PDF file to upload & index</p>
              </div>

              {isUploading && (
                <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-300">Uploading & Indexing vectors into Qdrant...</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Indexed Knowledge Files ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No PDF documents uploaded for this chatbot yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-800/80 rounded-2xl bg-slate-900/80">
                        <div className="flex items-center gap-3 truncate max-w-[60%]">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-white truncate block">{doc.name || doc.filename}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{doc.size || 'PDF'}</span>
                              <span>•</span>
                              <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {doc.chunks_count || 0} chunks
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteDocMutation.mutate(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* SECTION 3: TEST & EVALUATE */}
        <div ref={testRef} id="section-test" className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <SearchCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">3. Test & Evaluate</h2>
              <p className="text-xs text-slate-400">Test your chatbot in the Dedicated Sandbox Preview page.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white block text-sm">Interactive Dedicated Sandbox</span>
              <p className="text-slate-400">Launch the full widget preview sandbox to test user message responses.</p>
            </div>

            {!isNewBot && (
              <button
                type="button"
                onClick={() => window.open(`/preview/${botId}`, '_blank')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all shadow-glow-sm flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" /> Open Dedicated Sandbox
              </button>
            )}
          </div>
        </div>

        {/* SECTION 4: EMBED & DEPLOY */}
        <div ref={deployRef} id="section-deploy" className="glass-card border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">4. Embed & Deploy Script</h2>
                <p className="text-xs text-slate-400">Copy script tag snippet to embed on any HTML web page.</p>
              </div>
            </div>
          </div>

          <div className="relative bg-[#0B0F19] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900 font-mono text-xs text-slate-400">
              <span>HTML Script Tag</span>
              <button 
                type="button"
                onClick={copyToClipboard}
                className="text-indigo-400 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-bold bg-indigo-500/10 border border-indigo-500/20"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-5 overflow-x-auto font-mono text-xs leading-relaxed text-indigo-200">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>

      </main>

      {/* STICKY BOTTOM FOOTER BAR WITH SAVE AND DISCARD FUNCTIONALITY */}
      <footer className="fixed bottom-0 lg:left-64 left-0 right-0 z-20 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          
          <div>
            {isDirty ? (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-300 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Unsaved changes
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                All changes saved
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || saveChatbotMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={(!isDirty && !isNewBot) || saveChatbotMutation.isPending}
              className="flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-glow-sm disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              {saveChatbotMutation.isPending ? 'Saving...' : isNewBot ? 'Create & Save Chatbot' : 'Save Changes'}
            </button>
          </div>

        </div>
      </footer>
    </form>
  );
};

export default Builder;
