import React from 'react';
import { Search, Database, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  status?: string | null;
  activeTool?: string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ status, activeTool }) => {
  if (!status) return null;

  const renderIcon = () => {
    if (activeTool === 'web_search' || status.toLowerCase().includes('web')) {
      return <Search className="w-3.5 h-3.5 animate-spin text-indigo-600" />;
    }
    if (activeTool === 'document_search' || status.toLowerCase().includes('knowledge')) {
      return <Database className="w-3.5 h-3.5 animate-spin text-indigo-600" />;
    }
    return <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-600" />;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[12px] font-medium w-fit animate-pulse mb-1">
      {renderIcon()}
      <span>{status}</span>
    </div>
  );
};

export default TypingIndicator;
