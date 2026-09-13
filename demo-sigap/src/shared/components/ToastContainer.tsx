import React, { useState, useEffect } from 'react';
import { ToastPayload } from '../services/notification';
import { CheckCircle, AlertTriangle, Info, BellRing, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastPayload>;
      if (customEvent.detail) {
        const newToast = customEvent.detail;
        setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep at most 4 toasts

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, newToast.duration || 4500);
      }
    };

    window.addEventListener('sigap_show_toast', handleToastEvent);
    return () => window.removeEventListener('sigap_show_toast', handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500/50 bg-slate-900/95 text-blue-300';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/50 bg-emerald-950/95 text-emerald-300';
          Icon = CheckCircle;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-amber-950/95 text-amber-300';
          Icon = AlertTriangle;
        } else if (toast.type === 'emergency') {
          borderClass = 'border-rose-500/80 bg-rose-950/95 text-rose-200 animate-pulse';
          Icon = BellRing;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transform transition-all duration-300 animate-slideDown ${borderClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold text-white">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
