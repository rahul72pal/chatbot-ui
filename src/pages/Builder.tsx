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
      themeColor: '#4F46E5',
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
        themeColor: chatbotData.theme_color || '#4F46E5',
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
        themeColor: chatbotData.theme_color || '#4F46E5',
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

    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB} MB) exceeds the 2 MB limit. Please select a smaller PDF document.`, 'File Too Large');
      e.target.value = '';
      return;
    }

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
    { value: '#4F46E5', name: 'Indigo' },
    { value: '#7C3AED', name: 'Purple' },
    { value: '#2563EB', name: 'Blue' },
    { value: '#22D3EE', name: 'Cyan' },
    { value: '#10D6A0', name: 'Emerald' },
    { value: '#FB7185', name: 'Rose' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-28 text-[#F3F6FF] font-sans w-full">
      {/* Sticky Sub-Header Attached to Top Navbar */}
      <div className="-mt-4 -mx-4 lg:-mt-7 lg:-mx-7 border-b border-[#1C2C4B] bg-[#080E1B] px-5 py-3.5 sticky top-0 z-20 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/chatbots')}
            className="flex items-center gap-1.5 text-xs text-[#A3B3CF] hover:text-[#F3F6FF] transition-colors bg-[#101D39] hover:bg-[#142342] px-3.5 py-2 rounded-xl border border-[#1C2C4B] font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            Back to Chatbots
          </button>
          
          <div className="h-5 w-px bg-[#1C2C4B] hidden sm:block" />

          <div>
            <h1 className="font-display text-sm font-bold text-[#F3F6FF] flex items-center gap-2">
              {currentBotName || 'Untitled Chatbot'}
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Single Page Builder
              </span>
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-[#101D39] p-1 rounded-2xl border border-[#1C2C4B] gap-1 text-xs">
          <button 
            type="button"
            onClick={() => scrollToSection('appearance')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'appearance' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('knowledge')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'knowledge' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Knowledge Base
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('test')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'test' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
            }`}
          >
            <SearchCode className="w-3.5 h-3.5" />
            Test
          </button>

          <button 
            type="button"
            onClick={() => scrollToSection('deploy')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSection === 'deploy' ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm' : 'text-[#71829F] hover:text-[#F3F6FF]'
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
              className="flex items-center gap-1.5 text-xs text-[#C7D2FE] bg-[#142342] hover:bg-[#1C2C4B] px-3.5 py-2 rounded-xl border border-[#243653] font-bold transition-all"
              title="Open Dedicated Chatbot Preview Page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              Dedicated Preview
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto pt-2 px-2 sm:px-4 flex flex-col gap-8">
        
        {/* SECTION 1: APPEARANCE & CUSTOMIZATION */}
        <div ref={appearanceRef} id="section-appearance" className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#1C2C4B] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#F3F6FF]">1. Appearance & Customization</h2>
              <p className="text-xs text-[#71829F]">Define chatbot name, theme color, avatar icons, launcher alignment, and popups.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A3B3CF]">Chatbot Name</label>
              <input 
                type="text" 
                {...register('botName')}
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5] font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A3B3CF]">Welcome Message</label>
              <input 
                type="text" 
                {...register('welcomeMessage')}
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#A3B3CF]">Custom Chatbot Behavior Instructions</label>
            <textarea 
              {...register('systemPrompt')}
              rows={3}
              placeholder="e.g., You are a friendly customer support agent for Acme Inc. Be polite, use concise answers, and sign off with '- Team Acme'."
              className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5] leading-relaxed resize-none placeholder-[#71829F]"
            />
            <p className="text-[11px] text-[#71829F]">
              Defines the persona, identity, communication style, and custom instructions for your chatbot.
            </p>
          </div>

          {/* Theme Swatches */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#A3B3CF]">Theme Color</label>
            <div className="flex items-center gap-3">
              {colorSwatches.map((c) => (
                <button 
                  key={c.value}
                  type="button"
                  onClick={() => setValue('themeColor', c.value, { shouldDirty: true })}
                  className="w-9 h-9 rounded-full border border-[#1C2C4B] relative hover:scale-110 transition-transform flex items-center justify-center text-white shadow-md"
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
                className="w-9 h-9 rounded-xl cursor-pointer border border-[#1C2C4B] bg-transparent p-0"
                title="Custom color picker"
              />
            </div>
          </div>

          {/* Avatar Icon Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#A3B3CF]">Avatar Icon</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setValue('avatar', 'support', { shouldDirty: true })}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                  currentAvatar === 'support' 
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] border-indigo-400 text-white shadow-glow-sm' 
                    : 'bg-[#101D39] border-[#1C2C4B] text-[#71829F] hover:text-[#F3F6FF]'
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
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] border-indigo-400 text-white shadow-glow-sm' 
                    : 'bg-[#101D39] border-[#1C2C4B] text-[#71829F] hover:text-[#F3F6FF]'
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
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] border-indigo-400 text-white shadow-glow-sm' 
                    : 'bg-[#101D39] border-[#1C2C4B] text-[#71829F] hover:text-[#F3F6FF]'
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
              <label className="text-xs font-bold text-[#A3B3CF]">Position</label>
              <select 
                {...register('position')}
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs font-medium text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="right">Right aligned</option>
                <option value="left">Left aligned</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A3B3CF]">Bubble Style</label>
              <select 
                {...register('bubbleStyle')}
                className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-3 text-xs font-medium text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="rounded">Rounded Box</option>
                <option value="pill">Pill Shape</option>
                <option value="square">Sharp Square</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: KNOWLEDGE BASE & DOCUMENTS */}
        <div ref={knowledgeRef} id="section-knowledge" className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#1C2C4B] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#F3F6FF]">2. Knowledge Base & RAG Documents</h2>
              <p className="text-xs text-[#71829F]">Upload PDF training documents indexed into Qdrant Vector Database.</p>
            </div>
          </div>

          {isNewBot ? (
            <div className="border-2 border-dashed border-[#1C2C4B] rounded-2xl p-8 text-center bg-[#091121]/60 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center border border-[#FBBF24]/20 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#F3F6FF]">Save Chatbot First to Unlock Documents</h3>
              <p className="text-xs text-[#71829F] max-w-md leading-relaxed">
                Click <strong>"Save Changes"</strong> in the bottom bar below to create your chatbot first before uploading documents.
              </p>
            </div>
          ) : (
            <>
              <div className="border-2 border-dashed border-[#243653] hover:border-[#4F46E5] rounded-2xl p-8 text-center bg-[#101D39] relative transition-colors group">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept=".pdf"
                  disabled={isUploading}
                />
                <UploadCloud className="w-10 h-10 mx-auto text-[#71829F] group-hover:text-indigo-400 transition-colors mb-3" />
                <p className="text-sm font-bold text-[#F3F6FF]">Click or drag PDF file to upload & index</p>
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
                <h3 className="text-[11px] font-bold text-[#71829F] uppercase tracking-wider">
                  Indexed Knowledge Files ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <p className="text-xs text-[#71829F] py-3">No PDF documents uploaded for this chatbot yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-[#1C2C4B] rounded-xl bg-[#101D39]">
                        <div className="flex items-center gap-3 truncate max-w-[60%]">
                          <div className="w-8 h-8 rounded-lg bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center flex-shrink-0 font-bold">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-[#F3F6FF] truncate block">{doc.name || doc.filename}</span>
                            <span className="text-[10px] text-[#71829F] flex items-center gap-1.5 mt-0.5">
                              <span>{doc.size || 'PDF'}</span>
                              <span>•</span>
                              <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recently'}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#10D6A0]/10 border border-[#10D6A0]/30 text-[#10D6A0] text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {doc.chunks_count || 0} chunks
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteDocMutation.mutate(doc.id)}
                            className="p-1.5 text-[#71829F] hover:text-[#FB7185] rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div ref={testRef} id="section-test" className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#1C2C4B] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center font-bold">
              <SearchCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#F3F6FF]">3. Test & Evaluate</h2>
              <p className="text-xs text-[#71829F]">Test your chatbot in the Dedicated Sandbox Preview page.</p>
            </div>
          </div>

          <div className="bg-[#101D39] p-6 rounded-2xl border border-[#1C2C4B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#F3F6FF] block text-sm">Interactive Dedicated Sandbox</span>
              <p className="text-[#71829F]">Launch the full widget preview sandbox to test user message responses.</p>
            </div>

            {!isNewBot && (
              <button
                type="button"
                onClick={() => window.open(`/preview/${botId}`, '_blank')}
                className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" /> Open Dedicated Sandbox
              </button>
            )}
          </div>
        </div>

        {/* SECTION 4: EMBED & DEPLOY */}
        <div ref={deployRef} id="section-deploy" className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1C2C4B] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[#F3F6FF]">4. Embed & Deploy Script</h2>
                <p className="text-xs text-[#71829F]">Copy script tag snippet to embed on any HTML web page.</p>
              </div>
            </div>
          </div>

          <div className="relative bg-[#080E1B] rounded-2xl border border-[#1C2C4B] overflow-hidden shadow-2xl">
            <div className="px-5 py-3 border-b border-[#1C2C4B] flex justify-between items-center bg-[#091121] font-mono text-xs text-[#71829F]">
              <span>HTML Script Tag</span>
              <button 
                type="button"
                onClick={copyToClipboard}
                className="text-indigo-400 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-bold bg-indigo-500/10 border border-indigo-500/20"
              >
                {isCopied ? <Check className="w-4 h-4 text-[#10D6A0]" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-5 overflow-x-auto font-mono text-xs leading-relaxed text-indigo-200">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>

      </main>

      {/* Sticky Bottom Footer Bar */}
      <footer className="fixed bottom-0 lg:left-64 left-0 right-0 z-20 bg-[#080E1B] border-t border-[#1C2C4B] px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          
          <div>
            {isDirty ? (
              <div className="flex items-center gap-2 bg-[#FBBF24]/10 text-[#FBBF24] px-3.5 py-1.5 rounded-xl border border-[#FBBF24]/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                Unsaved changes
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#10D6A0]/10 text-[#10D6A0] px-3.5 py-1.5 rounded-xl border border-[#10D6A0]/30 text-xs font-semibold">
                <Check className="w-4 h-4 text-[#10D6A0]" />
                All changes saved
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || saveChatbotMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#1C2C4B] bg-[#101D39] hover:bg-[#142342] text-[#A3B3CF] transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={(!isDirty && !isNewBot) || saveChatbotMutation.isPending}
              className="btn-primary-gradient flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl disabled:opacity-40"
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
