import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Sliders, 
  BarChart2, 
  Settings, 
  MessageSquare,
  LogOut,
  X,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chatbots', label: 'Chatbots', icon: Bot },
    { to: '/conversations', label: 'Conversations', icon: MessageSquare },
    { to: '/documents', label: 'Knowledge Base', icon: FileText },
    { to: '/api-models', label: 'LLM Configuration', icon: Sliders },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    onClose();
    navigate('/login');
  };

  const isLinkActive = (to: string) => {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (to === '/chatbots') {
      return location.pathname === '/chatbots' || location.pathname.startsWith('/builder');
    }
    return location.pathname.startsWith(to);
  };

  const renderSidebarContent = (collapsed: boolean) => {
    if (collapsed) {
      return (
        <>
          {/* Collapsed Brand Header */}
          <div className="h-20 flex items-center justify-center border-b border-[#1C2C4B] flex-shrink-0 bg-[#080E1B]">
            <div 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-glow-sm hover:shadow-glow-indigo transition-all cursor-pointer relative group"
              title="yourchatbot Platform"
            >
              <div className="w-full h-full bg-[#080E1B] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#101D39] text-[#F3F6FF] text-xs font-semibold rounded-lg shadow-xl border border-[#1C2C4B] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                yourchatbot
              </div>
            </div>
          </div>

          {/* Collapsed Main Navigation Icons with Tooltips */}
          <div className="flex-grow px-2 py-6 flex flex-col gap-2 bg-[#080E1B] overflow-visible select-none">
            <div className="w-6 h-[1px] bg-[#1C2C4B] mx-auto mb-1" />

            {links.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  title={link.label}
                  className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 relative group border ${
                    active
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-indigo-400/30 shadow-[0_4px_16px_rgba(79,70,229,0.35)]'
                      : 'text-[#A3B3CF] border-transparent hover:text-[#F3F6FF] hover:bg-[#101D39] hover:border-[#1C2C4B]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-[#71829F] group-hover:text-indigo-400'}`} />

                  {/* Tooltip on Hover */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#101D39] text-[#F3F6FF] text-xs font-medium rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-[#1C2C4B] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 z-50 flex items-center gap-2">
                    <span>{link.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0]" />}
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Collapsed Footer (Qdrant, Settings, Logout) */}
          <div className="p-3 border-t border-[#1C2C4B] flex flex-col items-center gap-2 flex-shrink-0 bg-[#080E1B]">
            {/* Qdrant DB Status */}
            <div 
              className="w-11 h-11 rounded-xl bg-[#101D39] border border-[#1C2C4B] flex items-center justify-center relative group cursor-default"
              title="Qdrant DB: Active"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#10D6A0] shadow-[0_0_8px_rgba(16,214,160,0.6)] animate-pulse" />
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#101D39] text-[#F3F6FF] text-xs font-medium rounded-lg shadow-xl border border-[#1C2C4B] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 z-50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10D6A0]" />
                <span>Qdrant DB: Active</span>
              </div>
            </div>

            {/* Settings */}
            <NavLink 
              to="/settings" 
              onClick={onClose}
              title="Settings"
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 relative group border ${
                location.pathname.startsWith('/settings')
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-indigo-400/30'
                  : 'text-[#A3B3CF] border-transparent hover:text-[#F3F6FF] hover:bg-[#101D39]'
              }`}
            >
              <Settings className="w-5 h-5 text-[#71829F] group-hover:text-indigo-400 transition-colors" />
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#101D39] text-[#F3F6FF] text-xs font-medium rounded-lg shadow-xl border border-[#1C2C4B] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 z-50">
                Settings
              </div>
            </NavLink>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              title="Logout"
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#A3B3CF] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors border border-transparent relative group"
            >
              <LogOut className="w-5 h-5 text-[#71829F] group-hover:text-[#FB7185] transition-colors" />
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#101D39] text-[#FB7185] text-xs font-medium rounded-lg shadow-xl border border-[#1C2C4B] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 z-50">
                Logout
              </div>
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#1C2C4B] flex-shrink-0 bg-[#080E1B]">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-glow-sm group-hover:shadow-glow-indigo transition-all">
              <div className="w-full h-full bg-[#080E1B] rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-base font-bold text-[#F3F6FF] leading-tight tracking-tight flex items-center gap-1.5">
                yourchatbot
              </h1>
              <p className="text-[10px] text-[#71829F] font-medium tracking-wide">AI Architect Platform</p>
            </div>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-3.5 py-6 flex flex-col gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#080E1B]">
          <div className="mb-2 px-3">
            <span className="text-[11px] font-bold text-[#71829F] uppercase tracking-wider">
              Main Workspace
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-medium border ${
                  active
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-indigo-400/30 shadow-[0_4px_16px_rgba(79,70,229,0.35)] font-semibold'
                    : 'text-[#A3B3CF] border-transparent hover:text-[#F3F6FF] hover:bg-[#101D39] hover:border-[#1C2C4B]'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-white' : 'text-[#71829F] group-hover:text-indigo-400'}`} />
                <span className="tracking-wide">{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* System Status & Footer Actions */}
        <div className="p-4 border-t border-[#1C2C4B] flex flex-col gap-2 flex-shrink-0 bg-[#080E1B]">
          {/* Qdrant DB Status Pill */}
          <div className="px-3.5 py-2.5 bg-[#101D39] rounded-xl border border-[#1C2C4B] flex items-center justify-between text-xs">
            <span className="text-[#A3B3CF] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0] shadow-[0_0_8px_rgba(16,214,160,0.6)] animate-pulse" />
              Qdrant DB
            </span>
            <span className="text-[#10D6A0] font-semibold text-[11px]">Active</span>
          </div>

          {/* Settings */}
          <NavLink 
            to="/settings" 
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-medium border ${
              location.pathname.startsWith('/settings')
                ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white border-indigo-400/30 font-semibold'
                : 'text-[#A3B3CF] border-transparent hover:text-[#F3F6FF] hover:bg-[#101D39]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#71829F] group-hover:text-indigo-400 transition-colors" />
            <span>Settings</span>
          </NavLink>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#A3B3CF] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors text-[13px] font-medium group text-left w-full border border-transparent"
          >
            <LogOut className="w-4 h-4 text-[#71829F] group-hover:text-[#FB7185] transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside 
        className={`bg-[#080E1B] border-r border-[#1C2C4B] h-screen fixed left-0 top-0 hidden lg:flex flex-col flex-shrink-0 z-30 shadow-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed)}

        {/* Middle Arrow Button to Open/Close Sidebar */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center absolute left-full -translate-x-1/2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full z-40 transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-[#1C2C4B] bg-[#0D1730] hover:bg-[#142342] hover:border-[#4F46E5] text-[#A3B3CF] hover:text-white hover:scale-110 hover:shadow-[0_0_14px_rgba(79,70,229,0.4)] cursor-pointer group"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#A3B3CF] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#A3B3CF] group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          )}
        </button>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-[#080E1B] z-50 flex flex-col h-full border-r border-[#1C2C4B] transition-transform duration-300 transform lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-4 p-1.5 hover:bg-[#101D39] rounded-lg text-[#71829F] hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {renderSidebarContent(false)}
      </div>
    </>
  );
};

export default Sidebar;
