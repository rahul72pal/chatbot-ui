import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Home as HomeIcon } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  version?: string;
  showStatus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  title = "AI Chatbot Workspace", 
  version = "v2.5.0",
  showStatus = true
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800/80 h-16 flex-shrink-0 flex items-center justify-between px-6 z-20 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
          {title}
          {version && (
            <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium tracking-wide">
              {version}
            </span>
          )}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Home Page Link */}
        <button
          onClick={() => navigate('/home')}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700/80 transition-all"
        >
          <HomeIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>SaaS Home</span>
        </button>

        {/* Create Chatbot Action */}
        <button
          onClick={() => navigate('/builder')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-glow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chatbot</span>
        </button>

        {showStatus && (
          <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300 font-medium">
              System Active
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
