import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Code, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Headphones,
  Sliders
} from 'lucide-react';
import { BASE_URL } from '../utils/apiClient';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I am your AI assistant trained on your knowledge base. Ask me anything!' }
  ]);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  const sampleEmbedScript = `<script 
  src="${BASE_URL}/widget.js" 
  data-chatbot-id="YOUR_CHATBOT_ID" 
  defer>
</script>`;

  const copyScriptCode = () => {
    navigator.clipboard.writeText(sampleEmbedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    const userText = demoInput;
    setDemoInput('');
    setDemoMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsDemoLoading(true);

    setTimeout(() => {
      setDemoMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Thanks for testing! "yourchatbot" instantly searches your vector DB and answers: "${userText}". You can embed this widget on any website using a single script tag!` 
        }
      ]);
      setIsDemoLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1500px] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090D16]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                yourchatbot <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-medium">SaaS</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#script-embed" className="hover:text-indigo-400 transition-colors">Script Tag Embed</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            {token ? (
              <button
                onClick={() => navigate('/chatbots')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-glow-sm hover:shadow-glow-md flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-glow-sm hover:shadow-glow-md flex items-center gap-2"
                >
                  Get Started Free
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Column: Headlines & CTAs */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Next-Gen Autonomous AI Chatbot SaaS Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              Build Custom AI Chatbots Trained on Your Data <span className="text-gradient">in Seconds</span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Upload PDF knowledge bases, customize personas, and embed intelligent floating chat widgets on any website with a simple script tag. Powered by vector RAG search & custom LLMs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate(token ? '/builder' : '/signup')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-300 shadow-glow-md hover:shadow-glow-lg flex items-center justify-center gap-3 group"
              >
                <span>Create Your Chatbot Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/preview/demo')}
                className="w-full sm:w-auto glass-card hover:bg-slate-800/60 text-slate-200 font-semibold text-base px-7 py-4 rounded-xl border border-slate-700/80 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-indigo-400" />
                <span>Live Dedicated Preview</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <p className="font-display text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Vector RAG Accuracy</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-cyan-400">&lt; 1 sec</p>
                <p className="text-xs text-slate-400 mt-0.5">Response Latency</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-purple-400">24-Hour</p>
                <p className="text-xs text-slate-400 mt-0.5">TTL Auto-Memory Purge</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Chat Widget Showcase Card */}
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Live Interactive Demo</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Qdrant DB Connected
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  gpt-3.5-turbo
                </span>
              </div>

              {/* Chat Message Window */}
              <div className="h-72 overflow-y-auto space-y-3 custom-scrollbar pr-1 mb-4">
                {demoMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-xs shadow-glow-sm'
                          : 'bg-slate-800/90 text-slate-200 rounded-2xl rounded-tl-xs border border-slate-700/60'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isDemoLoading && (
                  <div className="flex items-start">
                    <div className="bg-slate-800/90 text-slate-400 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 border border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleDemoSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Ask the demo chatbot..."
                  className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!demoInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-glow-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Everything You Need to Build & Deploy <span className="text-gradient">AI Assistants</span>
          </h2>
          <p className="text-slate-400 text-base">
            From PDF document indexing to real-time vector search and 1-click script tag embeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">1-Click Script Tag Embed</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Embed your chatbot on WordPress, Webflow, React, Next.js, or plain HTML websites. Paste one script tag and go live instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Smart PDF RAG Indexing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload PDF manuals, policy guides, and FAQs. Our backend automatically chunks text and indexes vector embeddings into Qdrant DB.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Manual LLM Model Strings</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full control over LLM string model names (e.g. gpt-4o, deepseek-chat, claude-3.5) with custom temperature and max tokens.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Custom Branding & Themes</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Customize theme colors, launcher positions (Left/Right), bubble shapes (Pill, Square, Rounded), and support avatars.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Real-Time Usage Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track total conversations, visitor message counts, latency metrics, and document counts with live MongoDB aggregation.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">24-Hour Memory TTL Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visitor conversations & messages automatically expire after 24 hours via MongoDB TTL indexes for maximum privacy.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Go Live in <span className="text-gradient-cyan">3 Simple Steps</span>
          </h2>
          <p className="text-slate-400 text-base">
            Build, train, and embed your custom AI assistant in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-display font-bold flex items-center justify-center text-lg shadow-glow-sm">
              1
            </div>
            <h3 className="font-display font-bold text-lg text-white">Create Chatbot Persona</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Set chatbot name, system prompts, theme colors, position, and welcome tooltips in the Builder.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-display font-bold flex items-center justify-center text-lg shadow-glow-sm">
              2
            </div>
            <h3 className="font-display font-bold text-lg text-white">Upload Knowledge PDF</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload PDF documents. Our system automatically chunks and indexes vectors into Qdrant DB.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 rounded-2xl flex flex-col gap-4 relative">
            <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-display font-bold flex items-center justify-center text-lg shadow-glow-sm">
              3
            </div>
            <h3 className="font-display font-bold text-lg text-white">Paste Script & Launch</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Copy your unique script tag and embed it before the closing body tag on any website.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SCRIPT EMBED SNIPPET SECTION */}
      <section id="script-embed" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-indigo-500/30 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Embed on Any Platform <span className="text-gradient">With One Line of Code</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Our script handles floating launcher buttons, open/close animations, responsive message windows, and API communication autonomously.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> WordPress</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webflow</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> React / Next.js</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> HTML5</span>
            </div>
          </div>

          <div className="w-full max-w-lg bg-[#0B0F19] rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-200 relative group">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 text-[11px] ml-2">embed-snippet.html</span>
              </div>
              <button
                onClick={copyScriptCode}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-sans font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="text-slate-300 overflow-x-auto custom-scrollbar leading-relaxed">
              <code>{sampleEmbedScript}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Simple, Transparent <span className="text-gradient">SaaS Pricing</span>
          </h2>
          <p className="text-slate-400 text-base">
            Choose the plan that fits your business needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Free Starter</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">Perfect for personal testing and developer sandbox.</p>
              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Custom Chatbot</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 5 PDF Documents</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Click Script Embed</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Qdrant RAG Search</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="glass-card p-8 rounded-2xl border-2 border-indigo-500/80 shadow-glow-md flex flex-col justify-between gap-8 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-glow-sm">
              Most Popular
            </span>
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Pro Builder</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">$29</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">For growing businesses and professional customer support.</p>
              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Chatbots</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited PDF Documents</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom LLM String Models</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Analytics Dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-glow-sm"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">Custom</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">Dedicated vector database clusters & SLA guarantees.</p>
              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Qdrant Collection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom SLA & Uptime</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> On-Premise Vector Deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Account Manager</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#060911] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm text-white">yourchatbot</span>
            <span>© 2026 yourchatbot Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={() => navigate('/preview/demo')} className="hover:text-white transition-colors">Demo Preview</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
