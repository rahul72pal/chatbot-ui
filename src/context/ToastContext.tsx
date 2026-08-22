import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Max 5 active toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: 'success', message, title }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast({ type: 'error', message, title: title || 'Error' }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ type: 'info', message, title }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: 'warning', message, title }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, dismissToast, success, error, info, warning }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-500/10',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          titleColor: 'text-emerald-400',
          bar: 'bg-emerald-500',
        };
      case 'error':
        return {
          bg: 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-500/10',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
          titleColor: 'text-rose-400',
          bar: 'bg-rose-500',
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-500/10',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          titleColor: 'text-amber-400',
          bar: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-cyan-500/40 text-slate-100 shadow-cyan-500/10',
          icon: <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />,
          titleColor: 'text-cyan-400',
          bar: 'bg-cyan-500',
        };
    }
  };

  const style = getStyles();

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${style.bg} p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{style.icon}</div>

        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h4 className={`text-xs font-bold ${style.titleColor} mb-0.5 tracking-tight`}>
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-slate-300 leading-relaxed font-sans break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timer Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div
            className={`h-full ${style.bar} animate-shrink`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
