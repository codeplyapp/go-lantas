import React from 'react';
import { Sparkles } from 'lucide-react';
import { MASCOT_CONFIG } from '../../core/mascot';
import { sound } from '../../shared/services/sound';

interface FloatingMascotBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingMascotBubble: React.FC<FloatingMascotBubbleProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  const handleClick = () => {
    sound.playClick();
    onClick();
  };

  return (
    <div className="fixed bottom-22 right-4 z-40 animate-float-mascot-smooth">
      <button
        onClick={handleClick}
        className="relative group focus:outline-none min-w-[52px] min-h-[52px] btn-press"
        title="Tanya Si SIGAP (AI Korlantas Banyuwangi)"
        aria-label="Tanya Robot AI Si SIGAP"
      >
        {/* Apple subtle glow halo */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#0066cc] via-indigo-500 to-amber-400 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Mascot Face Bubble */}
        <div className="relative w-14 h-14 rounded-2xl bg-[#060b18] p-1 border-2 border-blue-400/80 apple-product-shadow flex items-center justify-center overflow-hidden transition-all group-hover:border-amber-400">
          <img
            src={MASCOT_CONFIG.avatarUrl}
            alt={MASCOT_CONFIG.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith('.png')) {
                target.src = MASCOT_CONFIG.fallbackAvatarUrl;
              }
            }}
          />
        </div>

        {/* Mini Apple Pill AI Badge */}
        <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#0066cc] text-white font-bold text-[9px] border-2 border-[#060b18] shadow-md flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          <span>AI</span>
        </div>
      </button>
    </div>
  );
};
