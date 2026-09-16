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
        let borderClass = 'border-[#0077c0]/30 bg-white text-slate-800 shadow-[0_8px_24px_rgba(0,119,192,0.15)]';
        let iconColor = 'text-[#0077c0]';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-300 bg-white text-slate-800 shadow-[0_8px_24px_rgba(16,185,129,0.15)]';
          iconColor = 'text-emerald-600';
          Icon = CheckCircle;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-300 bg-white text-slate-800 shadow-[0_8px_24px_rgba(245,158,11,0.15)]';
          iconColor = 'text-amber-600';
          Icon = AlertTriangle;
        } else if (toast.type === 'emergency') {
          borderClass = 'border-rose-300 bg-rose-50 text-rose-950 shadow-[0_8px_24px_rgba(225,29,72,0.2)] animate-pulse';
          iconColor = 'text-rose-600';
          Icon = BellRing;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border flex items-start gap-3 transform transition-all duration-300 animate-slideDown ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold text-[#0F172A]">{toast.title}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
