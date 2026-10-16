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
  Copy, 
  Check, 
  Headphones, 
  Sliders,
  Layers,
  ExternalLink
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
    <div className="min-h-screen bg-[#070B14] text-[#F3F6FF] selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1500px] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-3xl pointer-events-none -z-10" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#091121]/90 border-b border-[#1C2C4B]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-glow-sm group-hover:shadow-glow-indigo transition-all duration-300">
              <div className="w-full h-full bg-[#080E1B] rounded-[10px] flex items-center justify-center overflow-hidden">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                yourchatbot <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-medium">Platform</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A3B3CF]">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#script-embed" className="hover:text-indigo-400 transition-colors">Script Tag Embed</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#A3B3CF] hover:text-[#F3F6FF] text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  Get Started Free
                  <Sparkles className="w-4 h-4 text-[#22D3EE]" />
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
              <Sparkles className="w-4 h-4 text-[#22D3EE] animate-pulse" />
              <span>Next-Gen Autonomous AI Chatbot Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              Build Custom AI Chatbots Trained on Your Data <span className="text-gradient">in Seconds</span>
            </h1>

            {/* Subtext */}
            <p className="text-[#A3B3CF] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Upload PDF knowledge bases, customize personas, and embed intelligent floating chat widgets on any website with a simple script tag. Powered by vector RAG search & custom LLMs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate(token ? '/builder' : '/signup')}
                className="w-full sm:w-auto btn-primary-gradient px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 group"
              >
                <span>Create Your Chatbot Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/preview/demo')}
                className="w-full sm:w-auto bg-[#101D39] hover:bg-[#142342] text-[#F3F6FF] font-semibold text-sm px-7 py-3.5 rounded-xl border border-[#1C2C4B] transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-indigo-400" />
                <span>Live Dedicated Preview</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-[#1C2C4B] grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <p className="font-display text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-[#71829F] mt-0.5">Vector RAG Accuracy</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#22D3EE]">&lt; 1 sec</p>
                <p className="text-xs text-[#71829F] mt-0.5">Response Latency</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-[#A855F7]">24-Hour</p>
                <p className="text-xs text-[#71829F] mt-0.5">TTL Auto-Memory Purge</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Chat Widget Showcase Card */}
          <div className="w-full max-w-md">
            <div className="bg-[#0D1730] rounded-2xl p-6 border border-[#1C2C4B] shadow-2xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#1C2C4B] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#F3F6FF]">Live Interactive Demo</h3>
                    <p className="text-xs text-[#10D6A0] flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#10D6A0] animate-pulse inline-block" />
                      Qdrant DB Connected
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#101D39] text-[#C7D2FE] px-2.5 py-1 rounded-lg border border-[#1C2C4B]">
                  gpt-4o-mini
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
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-2xl rounded-tr-xs shadow-glow-sm'
                          : 'bg-[#101D39] text-[#F3F6FF] rounded-2xl rounded-tl-xs border border-[#1C2C4B]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isDemoLoading && (
                  <div className="flex items-start">
                    <div className="bg-[#101D39] text-[#71829F] px-4 py-3 rounded-2xl text-xs flex items-center gap-2 border border-[#1C2C4B]">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleDemoSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Ask the demo chatbot..."
                  className="flex-1 bg-[#101D39] border border-[#1C2C4B] rounded-xl px-4 py-2.5 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="submit"
                  disabled={!demoInput.trim()}
                  className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Send
                </button>
              </form>

              {/* Embed Code Snippet */}
              <div className="bg-[#080E1B] border border-[#1C2C4B] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#A3B3CF]">Embed Anywhere:</span>
                  <button
                    onClick={copyScriptCode}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#10D6A0]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-[#71829F] overflow-x-auto whitespace-pre p-2 bg-[#070B14] rounded-lg border border-[#1C2C4B]/60">
                  {sampleEmbedScript}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#1C2C4B]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Everything You Need to Build & Deploy <span className="text-gradient">AI Assistants</span>
          </h2>
          <p className="text-[#A3B3CF] text-base">
            From PDF document indexing to real-time vector search and 1-click script tag embeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-indigo-400 border border-[#243653] flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">1-Click Script Tag Embed</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Embed your chatbot on WordPress, Webflow, React, Next.js, or plain HTML websites. Paste one script tag and go live instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-[#A855F7] border border-[#243653] flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Smart PDF RAG Indexing</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Upload PDF manuals, policy guides, and FAQs. Our backend automatically chunks text and indexes vector embeddings into Qdrant DB.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-[#22D3EE] border border-[#243653] flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Manual LLM Model Strings</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Full control over LLM string model names (e.g. gpt-4o, deepseek-chat, claude-3.5) with custom temperature and max tokens.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-[#10D6A0] border border-[#243653] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Custom Branding & Themes</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Customize theme colors, launcher positions (Left/Right), bubble shapes (Pill, Square, Rounded), and support avatars.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-[#FBBF24] border border-[#243653] flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Real-Time Usage Analytics</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Track total conversations, visitor message counts, latency metrics, and document counts with live MongoDB aggregation.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#0D1730] border border-[#1C2C4B] p-7 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#142342] text-[#FB7185] border border-[#243653] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-white">24-Hour Memory TTL Security</h3>
            <p className="text-[#A3B3CF] text-xs leading-relaxed">
              Visitor conversations & messages automatically expire after 24 hours via MongoDB TTL indexes for maximum privacy.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1C2C4B] bg-[#080E1B] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#71829F]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm text-[#F3F6FF]">yourchatbot</span>
            <span>© 2026 yourchatbot Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <button onClick={() => navigate('/preview/demo')} className="hover:text-white transition-colors">Demo Preview</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
