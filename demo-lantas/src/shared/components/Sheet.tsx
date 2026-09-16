import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Sheet Container - Centered, Fully Visible Above Everything */}
      <div
        className={`relative w-full max-w-md bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col z-10 overflow-hidden ${maxHeight} animate-scaleUp text-slate-900 select-text`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-5 pt-4 pb-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="min-w-0 pr-3">
              {title && (
                <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors btn-press shrink-0"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto overscroll-contain no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
