import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Sliders, 
  BarChart2, 
  Settings, 
  MessageSquare,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chatbots', label: 'Chatbots', icon: Bot },
    { to: '/conversations', label: 'Conversations', icon: MessageSquare },
    { to: '/documents', label: 'Knowledge Base', icon: FileText },
    { to: '/api-models', label: 'LLM Configuration', icon: Sliders },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-xs border ${
      isActive
        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border-indigo-500/40 shadow-glow-sm font-semibold'
        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/60 hover:border-slate-700/50'
    }`;

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="p-3 flex flex-col gap-1 border-b border-slate-800/80 flex-shrink-0">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-white leading-none tracking-tight flex items-center gap-1">
              yourchatbot
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 leading-none">AI Architect Platform</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-grow overflow-y-auto p-4 py-6 flex flex-col gap-1.5 custom-scrollbar">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main Workspace</span>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="tracking-wide">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System Status & Footer */}
      <div className="p-4 border-t border-slate-800/80 flex flex-col gap-2 flex-shrink-0">
        <div className="px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Qdrant DB
          </span>
          <span className="text-emerald-400 font-semibold font-mono">Active</span>
        </div>

        <NavLink to="/settings" className={linkClass} onClick={onClose}>
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span>Settings</span>
        </NavLink>

        <NavLink 
          to="/login" 
          onClick={() => {
            localStorage.removeItem('access_token');
            onClose();
          }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium group mt-1"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span>Logout</span>
        </NavLink>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/80 h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col flex-shrink-0 z-30 shadow-2xl">
        {sidebarContent}
      </nav>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-[#0B0F19] z-50 flex flex-col h-full border-r border-slate-800 transition-transform duration-300 transform lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
