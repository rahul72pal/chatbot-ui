import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const location = useLocation();

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      handleToggleCollapse();
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const getPageTitle = (pathname: string) => {
    if (pathname === '/' || pathname === '/dashboard' || pathname === '/chatbots') return 'Chatbot Workspace';
    if (pathname.startsWith('/builder')) return 'Chatbot Builder';
    if (pathname.startsWith('/documents')) return 'Knowledge Base & RAG Documents';
    if (pathname.startsWith('/api-models')) return 'LLM Configuration';
    if (pathname.startsWith('/analytics')) return 'Usage Analytics & Performance';
    if (pathname.startsWith('/settings')) return 'Workspace Settings';
    if (pathname.startsWith('/conversations')) return 'Conversation Sessions';
    return 'yourchatbot Platform';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070B14] text-[#F3F6FF] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col h-screen bg-[#070B14] overflow-hidden relative transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Header */}
        <Header 
          onMenuToggle={handleMenuToggle} 
          title={getPageTitle(location.pathname)}
          version="v2.5.0"
          showStatus={true}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 custom-scrollbar">
          <div className="max-w-[1520px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
