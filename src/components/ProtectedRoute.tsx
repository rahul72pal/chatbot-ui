import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../api';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  // Fetch saved LLM configs
  const { data: configs, isLoading, error } = useQuery<any>({
    queryKey: ['llmConfigs'],
    queryFn: () => configApi.getLLMConfigs(),
    enabled: !!token,
  });

  const configsList = Array.isArray(configs)
    ? configs
    : (configs as any)?.data && Array.isArray((configs as any).data)
    ? (configs as any).data
    : [];
  const isLLMConfigured = configsList.length > 0 && !!configsList[0].api_key;

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Verifying LLM configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }

  // If LLM is not configured (llm_configured: false), redirect to /llm-setup for both Login & Signup
  if (!isLLMConfigured && location.pathname !== '/llm-setup') {
    return <Navigate to="/llm-setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
