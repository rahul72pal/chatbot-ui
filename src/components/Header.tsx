import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Home as HomeIcon, 
  Plus 
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  version?: string;
  showStatus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="bg-[#091121] border-b border-[#1C2C4B] h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
      {/* Left Area: Mobile Menu Toggle & Global Search */}
      {/* <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-[#71829F] hover:text-[#F3F6FF] rounded-xl hover:bg-[#101D39] transition-colors"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-[340px] hidden sm:block">
          <Search className="w-4 h-4 text-[#71829F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-[#0D1730] border border-[#1C2C4B] rounded-xl pl-10 pr-12 py-2 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-[#142342] border border-[#243653] rounded text-[10px] text-[#A3B3CF] font-mono select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div> */}
      <div></div>

      {/* Right Controls Area matching reference */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Light/Dark Mode Toggle Icon */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-[#71829F] hover:text-[#F3F6FF] bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] rounded-xl transition-colors"
          title="Toggle theme appearance"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          className="p-2 text-[#71829F] hover:text-[#F3F6FF] bg-[#0D1730] hover:bg-[#101D39] border border-[#1C2C4B] rounded-xl transition-colors relative"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FB7185] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#091121]">
            3
          </span>
        </button>

        {/* SaaS Home Button */}
        <button
          onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-2 text-xs text-[#A3B3CF] hover:text-[#F3F6FF] font-medium bg-[#0D1730] hover:bg-[#101D39] px-3.5 py-2 rounded-xl border border-[#1C2C4B] transition-all"
        >
          <HomeIcon className="w-4 h-4 text-[#4F46E5]" />
          <span>SaaS Home</span>
        </button>

        {/* Create Chatbot Button */}
        <button
          onClick={() => navigate('/builder')}
          className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#4338CA] hover:opacity-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Chatbot</span>
        </button>

        {/* User Profile Badge matching reference */}
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 pl-1.5 sm:pl-2.5 cursor-pointer group"
          title="Account profile & settings"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center text-xs font-bold border border-indigo-400/30 group-hover:scale-105 transition-transform flex-shrink-0">
            RP
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-[#F3F6FF] leading-tight group-hover:text-indigo-300 transition-colors">
              Rahul Pal
            </span>
            <span className="text-[10px] text-[#71829F] font-medium leading-tight mt-0.5">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
