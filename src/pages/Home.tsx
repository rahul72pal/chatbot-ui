import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Database,
  Code,
  BarChart3,
  ArrowRight,
  Copy,
  Check,
  Headphones,
  Sliders,
  Layers,
  ExternalLink,
  Send,
  Globe,
  FileText,
  Zap,
  Star,
  Gauge,
  Mic,
  Volume2,
  Radio,
  Terminal,
  RotateCcw
} from 'lucide-react';
import { BASE_URL } from '../utils/apiClient';
import VoiceOrb from '../components/VoiceOrb';

/* ---------------------------------- Hooks ---------------------------------- */

/** Observe when an element enters the viewport (fires once). */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** Count up to a target number once `active` becomes true. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

/* ------------------------------- UI Helpers -------------------------------- */

/** Scroll-reveal wrapper. */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'span';
}> = ({ children, delay = 0, className = '', as = 'div' }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
};

/** Headline that rises word-by-word on load. */
const AnimatedHeadline: React.FC<{ text: string; highlightFrom?: number; className?: string }> = ({
  text,
  highlightFrom,
  className = ''
}) => {
  const words = text.split(' ');
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`word-rise ${highlightFrom !== undefined && i >= highlightFrom ? 'text-gradient' : ''}`}
          style={{ animationDelay: `${120 + i * 70}ms` }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </h1>
  );
};

/** Animated trust metric with count-up. */
const Stat: React.FC<{
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color?: string;
}> = ({ target, decimals = 0, prefix = '', suffix = '', label, color = 'text-white' }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const value = useCountUp(target, inView);
  return (
    <div ref={ref}>
      <p className={`font-display text-2xl sm:text-3xl font-bold ${color}`}>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </p>
      <p className="text-xs text-[#71829F] mt-1">{label}</p>
    </div>
  );
};

/* ------------------------------ Landing Data ------------------------------- */

const FEATURES = [
  {
    icon: Headphones,
    tint: 'text-indigo-400',
    title: 'Real-Time Voice AI (Pipecat + VAD)',
    body: 'Sub-second real-time voice conversations with Silero voice activity detection, Deepgram STT, and ElevenLabs speech synthesis.'
  },
  {
    icon: Database,
    tint: 'text-purple-400',
    title: 'Smart PDF Vector RAG Indexing',
    body: 'Upload company knowledge, manuals, and FAQs. Our backend chunks and stores vector embeddings in Qdrant for semantic citations.'
  },
  {
    icon: Code,
    tint: 'text-cyan-400',
    title: '1-Click Script Tag Embed',
    body: 'Drop your AI bot onto WordPress, Shopify, Next.js, or HTML with a single script tag. Zero frontend dependencies required.'
  },
  {
    icon: Sparkles,
    tint: 'text-emerald-400',
    title: 'Custom Themes & Floating Orb',
    body: 'Customize launcher styles (Pill, Square, Rounded), brand colors, position (Left/Right), and responsive liquid voice orbs.'
  },
  {
    icon: BarChart3,
    tint: 'text-amber-400',
    title: 'Real-Time Analytics & Citations',
    body: 'Monitor latency, query volume, retrieval hits, and visitor satisfaction scores with live aggregation metrics.'
  },
  {
    icon: ShieldCheck,
    tint: 'text-rose-400',
    title: '24-Hour Memory TTL Security',
    body: 'Visitor conversations and message histories automatically expire after 24 hours via database TTL indexes for full privacy.'
  }
];

const STEPS = [
  {
    icon: FileText,
    title: '1. Ingest Knowledge',
    body: 'Upload PDF guides and documentation. Vectors are extracted and indexed into a private Qdrant collection.'
  },
  {
    icon: Sliders,
    title: '2. Tune Voice & Persona',
    body: 'Choose models (GPT-4o, DeepSeek, Claude), customize system prompts, temperature, and natural ElevenLabs voice personas.'
  },
  {
    icon: Globe,
    title: '3. Embed Everywhere',
    body: 'Copy a single script tag into your website. Visitors interact with a branded, floating AI assistant in under 60 seconds.'
  }
];

const INTEGRATIONS = ['WordPress', 'Shopify', 'Next.js', 'React', 'Webflow', 'Wix', 'Squarespace', 'Laravel', 'Plain HTML'];

const DEMO_SUGGESTIONS = [
  'How do I embed the widget?',
  'What is the voice response latency?',
  'Can I customize the colors?'
];

const DEMO_ANSWERS: Record<string, { answer: string; citation?: string }> = {
  'How do I embed the widget?': {
    answer: 'Super simple! Copy the 1-line script tag and paste it before the </body> tag of your website. A floating branded chat widget with text & voice options appears immediately.',
    citation: 'Documentation / Embed-Guide.pdf (p. 2)'
  },
  'What is the voice response latency?': {
    answer: 'Our Pipecat pipeline streams audio through WebSocket WebRTC with Silero VAD, Deepgram Nova-2, and ElevenLabs Flash — delivering an end-to-end voice latency under 450ms.',
    citation: 'Architecture / Voice-Pipeline-Benchmark.pdf (p. 4)'
  },
  'Can I customize the colors?': {
    answer: 'Yes! You can configure custom brand colors, left/right floating placement, bubble shape (pill, square, rounded), custom avatar icons, and default open behaviors directly in the Builder.',
    citation: 'Settings / Appearance-Tokens.pdf (p. 1)'
  }
};

/* Code Snippets for Embed Banner */
const EMBED_SNIPPETS: Record<string, string> = {
  html: `<script
  src="${BASE_URL}/widget.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  data-api-base="${BASE_URL}"
  defer>
</script>`,
  react: `// In your React / Next.js layout:
useEffect(() => {
  const script = document.createElement('script');
  script.src = "${BASE_URL}/widget.js";
  script.setAttribute('data-chatbot-id', 'YOUR_CHATBOT_ID');
  script.setAttribute('data-api-base', '${BASE_URL}');
  script.defer = true;
  document.body.appendChild(script);
  return () => document.body.removeChild(script);
}, []);`,
  wordpress: `<!-- Paste in WordPress Header/Footer Scripts or functions.php -->
<script
  src="${BASE_URL}/widget.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  data-api-base="${BASE_URL}"
  defer>
</script>`
};

/* --------------------------------- Page ------------------------------------ */

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* Showcase Mode: 'text' or 'voice' */
  const [showcaseMode, setShowcaseMode] = useState<'text' | 'voice'>('voice');

  /* Live demo chat state */
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; citation?: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI assistant trained on your knowledge base. Ask me any question or switch to Voice mode to talk live!',
      citation: 'System / Welcome-Guide.pdf'
    }
  ]);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const streamInterval = useRef<number | null>(null);

  /* Voice showcase simulation state */
  const [voiceOrbState, setVoiceOrbState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('speaking');
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(42);
  const [voiceTranscript, setVoiceTranscript] = useState<string>(
    '“Welcome to yourchatbot! I am streaming live via WebSocket with instant barge-in support.”'
  );
  const [embedTab, setEmbedTab] = useState<'html' | 'react' | 'wordpress'>('html');

  const token = localStorage.getItem('access_token');

  /* Header elevation on scroll */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Simulated audio breathing when speaking in voice mode */
  useEffect(() => {
    if (showcaseMode !== 'voice' || voiceOrbState !== 'speaking') return;
    const interval = setInterval(() => {
      setVoiceAudioLevel(Math.floor(25 + Math.random() * 55));
    }, 120);
    return () => clearInterval(interval);
  }, [showcaseMode, voiceOrbState]);

  /* Keep the demo chat pinned to the newest message */
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [demoMessages, isDemoLoading, streamingText]);

  /* Cleanup any in-flight stream on unmount */
  useEffect(() => () => {
    if (streamInterval.current) window.clearInterval(streamInterval.current);
  }, []);

  const copyEmbedCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const askDemo = useCallback((question: string) => {
    if (!question.trim() || isDemoLoading || streamingText) return;
    setDemoInput('');
    setDemoMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsDemoLoading(true);

    const match = DEMO_ANSWERS[question];
    const fullAnswer = match
      ? match.answer
      : `Great question! yourchatbot instantly searches vector embeddings in Qdrant and returns cited answers for: "${question}".`;
    const citation = match ? match.citation : 'Knowledge-Base / Indexed-Vectors.pdf';

    window.setTimeout(() => {
      setIsDemoLoading(false);
      setStreamingText('');
      setActiveCitation(citation || null);
      let i = 0;
      streamInterval.current = window.setInterval(() => {
        i += Math.max(1, Math.round(fullAnswer.length / 80));
        setStreamingText(fullAnswer.slice(0, i));
        if (i >= fullAnswer.length) {
          if (streamInterval.current) window.clearInterval(streamInterval.current);
          streamInterval.current = null;
          setStreamingText('');
          setDemoMessages((prev) => [...prev, { role: 'assistant', content: fullAnswer, citation }]);
        }
      }, 16);
    }, 600);
  }, [isDemoLoading, streamingText]);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askDemo(demoInput);
  };

  /* Simulate interactive voice turn on click */
  const triggerVoiceSimulation = () => {
    if (voiceOrbState === 'speaking') {
      setVoiceOrbState('listening');
      setVoiceAudioLevel(15);
      setVoiceTranscript('Listening... Speak now or tap to ask about your documents.');
      setTimeout(() => {
        setVoiceOrbState('processing');
        setVoiceTranscript('Searching Qdrant vector index & synthesizing response...');
        setTimeout(() => {
          setVoiceOrbState('speaking');
          setVoiceAudioLevel(65);
          setVoiceTranscript('“Vector search confirmed! Our sub-450ms pipeline handles speech-to-speech with seamless interruption.”');
        }, 1100);
      }, 2000);
    } else {
      setVoiceOrbState('speaking');
      setVoiceAudioLevel(50);
      setVoiceTranscript('“Resuming speech synthesis via ElevenLabs & Deepgram streaming.”');
    }
  };

  /* Cursor-follow glow for feature cards */
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F3F6FF] selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      {/* ============================ BACKGROUND LAYERS ============================ */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Dynamic Aurora glow mesh */}
        <div className="animate-aurora absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-indigo-600/25 via-purple-600/15 to-transparent blur-[130px] rounded-full" />
        <div className="animate-aurora-slow absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/12 blur-[120px] rounded-full" />
        <div className="animate-aurora absolute top-[50%] right-[-10%] w-[650px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full" />
        {/* Cyber grid with radial fade mask */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 40%, transparent 100%)'
          }}
        />
      </div>

      {/* ============================== HEADER ============================== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-xl bg-[#091121]/90 border-b border-[#1C2C4B] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-glow-sm group-hover:shadow-glow-indigo transition-all duration-300">
              <div className="w-full h-full bg-[#080E1B] rounded-[10px] flex items-center justify-center overflow-hidden">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              yourchatbot
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-medium">
                Platform
              </span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A3B3CF]">
            <a href="#showcase" className="hover:text-indigo-400 transition-colors">Live Showcase</a>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#embed" className="hover:text-indigo-400 transition-colors">1-Click Embed</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="focus-ring cursor-pointer btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="focus-ring cursor-pointer text-[#A3B3CF] hover:text-[#F3F6FF] text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="focus-ring cursor-pointer btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  Get Started Free
                  <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =============================== HERO BANNER =============================== */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Column: Copy & Value Proposition */}
          <div className="flex-1 space-y-7 text-center lg:text-left">
            {/* Ambient Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-cyan-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-semibold shadow-glow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0] animate-pulse" aria-hidden="true" />
              <span>Real-Time Voice AI + Smart RAG Platform</span>
              <span className="text-[#10D6A0] font-mono text-[11px] bg-[#10D6A0]/10 px-2 py-0.5 rounded-md border border-[#10D6A0]/20">v2.0</span>
            </div>

            {/* Headline */}
            <AnimatedHeadline
              text="Deploy Intelligent AI Agents & Human Voice Assistants"
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-white"
            />
            <div className="word-rise -mt-4 sm:-mt-5 lg:-mt-6" style={{ animationDelay: '520ms' }}>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08]">
                <span className="text-gradient">Trained on Your Data in Seconds</span>
              </h2>
            </div>

            {/* Subtext */}
            <Reveal delay={200}>
              <p className="text-[#A3B3CF] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Upload PDF guides, sync with private Qdrant vector memory, and embed conversational text &amp; sub-450ms
                voice assistants on any website with a single script tag.
              </p>
            </Reveal>

            {/* Hero Action CTAs */}
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate(token ? '/builder' : '/signup')}
                  className="focus-ring cursor-pointer w-full sm:w-auto btn-primary-gradient px-8 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-glow-indigo group transition-all"
                >
                  <span>Build Your Chatbot Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    setShowcaseMode('voice');
                    const target = document.getElementById('showcase');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="focus-ring cursor-pointer w-full sm:w-auto bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-semibold text-sm px-7 py-4 rounded-xl border border-[#1C2C4B] hover:border-indigo-500/50 shadow-md transition-all flex items-center justify-center gap-2.5"
                >
                  <Headphones className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                  <span>Try Interactive Voice Demo</span>
                </button>
              </div>
            </Reveal>

            {/* Social Proof */}
            <Reveal delay={400}>
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex -space-x-2.5" aria-hidden="true">
                  {['from-indigo-500 to-purple-600', 'from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-cyan-600'].map(
                    (grad, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} border-2 border-[#070B14] flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
                      >
                        {['RP', 'MK', 'SR', 'AL'][i]}
                      </div>
                    )
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-[#71829F]">Trusted by 2,000+ developers &amp; growing teams</p>
                </div>
              </div>
            </Reveal>

            {/* Trust & Performance Metrics */}
            <Reveal delay={500}>
              <div className="pt-6 border-t border-[#1C2C4B] grid grid-cols-3 gap-6 text-center lg:text-left">
                <Stat target={420} suffix="ms" label="Voice Pipeline Latency" color="text-[#22D3EE]" />
                <Stat target={99.4} decimals={1} suffix="%" label="RAG Vector Precision" color="text-[#10D6A0]" />
                <Stat target={1} suffix="-Click" label="Zero-Config Script Embed" color="text-[#C7D2FE]" />
              </div>
            </Reveal>
          </div>

          {/* Right Column: Interactive Dual-Mode Showcase Simulator */}
          <Reveal delay={250} className="w-full max-w-lg">
            <div id="showcase" className="relative scroll-mt-28">
              {/* Floating Telemetry Chips */}
              <div className="float-chip hidden sm:flex absolute -top-5 -right-3 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0D1730]/95 backdrop-blur border border-emerald-500/30 shadow-glow-sm text-[11px] font-semibold text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                Pipecat + Silero VAD Active
              </div>
              <div
                className="float-chip hidden sm:flex absolute top-1/2 -left-6 z-20 items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0D1730]/95 backdrop-blur border border-cyan-500/30 shadow-glow-sm text-[11px] font-semibold text-cyan-300"
                style={{ animationDelay: '1.4s' }}
              >
                <Gauge className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                420ms Avg Latency
              </div>

              {/* Showcase Container */}
              <div className="bg-[#0D1730] rounded-3xl border border-[#1C2C4B] shadow-2xl relative overflow-hidden flex flex-col">
                {/* Top Control Bar with Mode Switcher */}
                <div className="px-5 py-4 bg-[#091121] border-b border-[#1C2C4B] flex items-center justify-between">
                  {/* Mode Buttons */}
                  <div className="flex bg-[#101D39] p-1 rounded-xl border border-[#1C2C4B] text-xs">
                    <button
                      onClick={() => setShowcaseMode('voice')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                        showcaseMode === 'voice'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                          : 'text-[#71829F] hover:text-[#F3F6FF]'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#22D3EE]" />
                      Voice Agent
                    </button>
                    <button
                      onClick={() => setShowcaseMode('text')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                        showcaseMode === 'text'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                          : 'text-[#71829F] hover:text-[#F3F6FF]'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      Text RAG Chat
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10D6A0] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#10D6A0] uppercase font-bold tracking-wider">
                      Live Sandbox
                    </span>
                  </div>
                </div>

                {/* SHOWCASE BODY: VOICE MODE */}
                {showcaseMode === 'voice' ? (
                  <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center relative min-h-[360px] bg-gradient-to-b from-[#0D1730] to-[#080E1B]">
                    {/* Atmospheric orb background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 blur-3xl animate-pulse" />
                    </div>

                    {/* Central Liquid Voice Orb */}
                    <div className="relative z-10 my-4 cursor-pointer transform hover:scale-105 transition-transform" onClick={triggerVoiceSimulation}>
                      <VoiceOrb
                        state={voiceOrbState}
                        audioLevel={voiceAudioLevel}
                        size={140}
                      >
                        <div className="flex items-center justify-center w-full h-full text-white/90">
                          {voiceOrbState === 'speaking' ? (
                            <Volume2 className="w-8 h-8 animate-pulse text-white drop-shadow" />
                          ) : voiceOrbState === 'listening' ? (
                            <Mic className="w-8 h-8 text-white drop-shadow" />
                          ) : (
                            <Radio className="w-8 h-8 text-white drop-shadow" />
                          )}
                        </div>
                      </VoiceOrb>
                    </div>

                    {/* State Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101D39] border border-[#1C2C4B] text-[11px] font-semibold text-[#C7D2FE] mb-3">
                      <span className="capitalize">{voiceOrbState}</span>
                      <span className="w-1 h-1 rounded-full bg-indigo-400" />
                      <span className="text-[#10D6A0]">Barge-in Supported</span>
                    </div>

                    {/* Live Transcript Bubble */}
                    <div className="max-w-md w-full bg-[#101D39]/80 backdrop-blur rounded-2xl p-3.5 border border-[#1C2C4B] text-xs text-[#F3F6FF] leading-relaxed shadow-lg">
                      <p className="italic text-[#C7D2FE]">{voiceTranscript}</p>
                    </div>

                    {/* Voice Controls / Telemetry */}
                    <div className="w-full flex items-center justify-between mt-5 pt-4 border-t border-[#1C2C4B]/60 text-[11px] text-[#71829F]">
                      <button
                        onClick={triggerVoiceSimulation}
                        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Simulate Next Turn
                      </button>
                      <span className="font-mono text-[#A3B3CF]">Latency: &lt; 420ms</span>
                    </div>
                  </div>
                ) : (
                  /* SHOWCASE BODY: TEXT RAG CHAT MODE */
                  <div className="p-5 flex flex-col justify-between min-h-[360px]">
                    {/* Chat Messages */}
                    <div
                      ref={chatScrollRef}
                      className="h-56 overflow-y-auto space-y-3 custom-scrollbar pr-1 mb-3 scroll-smooth"
                      role="log"
                      aria-live="polite"
                    >
                      {demoMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-2xl rounded-tr-sm shadow-glow-sm'
                                : 'bg-[#101D39] text-[#F3F6FF] rounded-2xl rounded-tl-sm border border-[#1C2C4B]'
                            }`}
                          >
                            {msg.content}
                          </div>
                          {msg.citation && (
                            <span className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {msg.citation}
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Streaming assistant bubble */}
                      {streamingText && (
                        <div className="flex flex-col items-start">
                          <div className="max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed bg-[#101D39] text-[#F3F6FF] rounded-2xl rounded-tl-sm border border-[#1C2C4B]">
                            {streamingText}
                            <span className="typing-caret" aria-hidden="true" />
                          </div>
                          {activeCitation && (
                            <span className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 animate-pulse">
                              <FileText className="w-3 h-3" />
                              {activeCitation}
                            </span>
                          )}
                        </div>
                      )}

                      {isDemoLoading && (
                        <div className="flex items-start">
                          <div className="bg-[#101D39] text-[#71829F] px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-[#1C2C4B]">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Suggestion Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {DEMO_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => askDemo(suggestion)}
                          disabled={isDemoLoading || !!streamingText}
                          className="focus-ring cursor-pointer text-[10px] px-2.5 py-1 rounded-full bg-[#101D39] border border-[#1C2C4B] text-[#A3B3CF] hover:text-indigo-300 hover:border-indigo-500/40 disabled:opacity-40 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {/* Input Field */}
                    <form onSubmit={handleDemoSubmit} className="flex gap-2" role="search">
                      <input
                        type="text"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        placeholder="Ask anything about your PDFs..."
                        className="flex-1 bg-[#101D39] border border-[#1C2C4B] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/50 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!demoInput.trim() || isDemoLoading || !!streamingText}
                        className="focus-ring cursor-pointer btn-primary-gradient px-3.5 py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= 1-CLICK SCRIPT TAG EMBED BANNER ======================= */}
      <section id="embed" className="py-14 px-6 max-w-7xl mx-auto border-t border-[#1C2C4B]/60 scroll-mt-24">
        <Reveal>
          <div className="relative rounded-3xl bg-gradient-to-r from-[#091121] via-[#0D1730] to-[#091121] border border-[#1C2C4B] p-6 sm:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Column: Embed Value */}
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Universal Webhook &amp; Script Engine</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Add to Any Website with <span className="text-gradient">One Line of Code</span>
                </h2>
                <p className="text-sm text-[#A3B3CF] leading-relaxed">
                  No complex SDKs or npm build steps required. Paste this single script tag right before your{' '}
                  <code className="text-indigo-300 font-mono text-xs bg-[#101D39] px-1.5 py-0.5 rounded border border-[#1C2C4B]">&lt;/body&gt;</code>{' '}
                  tag to load the floating chat &amp; voice assistant.
                </p>

                {/* Platform tabs */}
                <div className="flex items-center gap-2 pt-2">
                  {(['html', 'react', 'wordpress'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEmbedTab(tab)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        embedTab === tab
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-[#101D39] border-[#1C2C4B] text-[#71829F] hover:text-[#F3F6FF]'
                      }`}
                    >
                      {tab === 'html' ? 'Plain HTML' : tab === 'react' ? 'React / Next.js' : 'WordPress'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Code Box */}
              <div className="w-full lg:w-[480px] bg-[#070B14] rounded-2xl border border-[#1C2C4B] overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-[#080E1B] border-b border-[#1C2C4B] flex items-center justify-between text-xs text-[#71829F]">
                  <span className="font-mono text-[11px] text-[#A3B3CF]">widget-embed.html</span>
                  <button
                    onClick={() => copyEmbedCode(EMBED_SNIPPETS[embedTab])}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-white font-semibold transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#10D6A0]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed bg-[#070B14]">
                  <code>{EMBED_SNIPPETS[embedTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======================= INTEGRATIONS MARQUEE ======================= */}
      <section className="py-10 border-t border-[#1C2C4B]/60" aria-label="Works with your stack">
        <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#71829F] mb-6">
          Works with every CMS, framework &amp; web stack
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track gap-4 pr-4">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
              <div
                key={i}
                aria-hidden={i >= INTEGRATIONS.length}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0D1730] border border-[#1C2C4B] text-sm font-medium text-[#A3B3CF] whitespace-nowrap hover:border-indigo-500/40 transition-colors"
              >
                <Globe className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Engineered for Modern <span className="text-gradient">Voice &amp; Text RAG</span>
          </h2>
          <p className="text-[#A3B3CF] text-base">
            From smart PDF document chunking to low-latency WebSocket speech streaming and custom persona control.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 120}>
              <div
                className="feature-card h-full bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl hover:border-indigo-500/40 transition-all"
                onMouseMove={handleCardMouseMove}
              >
                <div className="w-12 h-12 rounded-xl bg-[#142342] border border-[#243653] flex items-center justify-center">
                  <feature.icon className={`w-6 h-6 ${feature.tint}`} aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-base text-white">{feature.title}</h3>
                <p className="text-[#A3B3CF] text-xs leading-relaxed">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#1C2C4B]/70 scroll-mt-20">
        <Reveal className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            From zero to live assistant in 3 simple steps
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            How <span className="text-gradient">yourchatbot</span> Works
          </h2>
        </Reveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-cyan-500/40" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 150}>
              <div className="relative flex flex-col items-center text-center gap-4 px-4">
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0D1730] border border-[#243653] shadow-glow-card">
                  <step.icon className="w-7 h-7 text-indigo-400" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-[#070B14]">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
                <p className="text-[#A3B3CF] text-sm leading-relaxed max-w-xs">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section id="pricing" className="py-16 px-6 max-w-5xl mx-auto scroll-mt-20">
        <Reveal>
          <div className="gradient-frame">
            <div className="rounded-[1.45rem] bg-gradient-to-br from-[#0D1730] via-[#0B1226] to-[#0D1730] px-8 py-14 text-center relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/25 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  Free tier — no credit card required
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
                  Ready to put an AI voice &amp; text assistant <span className="text-gradient">on your site tonight?</span>
                </h2>
                <p className="text-[#A3B3CF] text-base max-w-xl mx-auto">
                  Create your custom chatbot, upload your PDF knowledge base, and copy one script tag. Your visitors are chatting in under a minute.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => navigate(token ? '/builder' : '/signup')}
                    className="focus-ring cursor-pointer btn-primary-gradient px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 group"
                  >
                    <span>Start Building Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/preview/demo')}
                    className="focus-ring cursor-pointer bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-semibold text-sm px-7 py-3.5 rounded-xl border border-[#1C2C4B] hover:border-indigo-500/40 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    <span>See Dedicated Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-[#1C2C4B] bg-[#080E1B] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#71829F]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="font-display font-bold text-sm text-[#F3F6FF]">yourchatbot</span>
            <span>© 2026 yourchatbot Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <button onClick={() => navigate('/preview/demo')} className="focus-ring cursor-pointer hover:text-white transition-colors">
              Demo Preview
            </button>
            <button onClick={() => navigate('/login')} className="focus-ring cursor-pointer hover:text-white transition-colors">
              Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
