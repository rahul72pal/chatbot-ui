import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === '/' || pathname === '/chatbots') return 'Chatbot Workspace';
    if (pathname.startsWith('/builder')) return 'Chatbot Builder';
    if (pathname.startsWith('/documents')) return 'Knowledge Base & RAG Documents';
    if (pathname.startsWith('/api-models')) return 'LLM Configuration';
    if (pathname.startsWith('/analytics')) return 'Usage Analytics & Performance';
    if (pathname.startsWith('/settings')) return 'Workspace Settings';
    if (pathname.startsWith('/admin')) return 'Admin Console & Logs';
    return 'yourchatbot Platform';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen bg-[#090D16] overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-3xl pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

        {/* Header */}
        <Header 
          onMenuToggle={() => setIsSidebarOpen(true)} 
          title={getPageTitle(location.pathname)}
          version="v2.5.0"
          showStatus={true}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
