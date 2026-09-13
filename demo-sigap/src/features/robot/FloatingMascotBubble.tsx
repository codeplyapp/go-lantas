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
    <div className="fixed bottom-20 right-4 z-40 animate-float-mascot">
      <button
        onClick={handleClick}
        className="relative group focus:outline-none"
        title="Tanya Si SIGAP (AI Korlantas)"
      >
        {/* Glow Halo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-tilt" />

        {/* Mascot Face Bubble */}
        <div className="relative w-14 h-14 rounded-2xl bg-slate-950 p-1 border-2 border-cyan-400/80 shadow-2xl flex items-center justify-center overflow-hidden transform group-hover:scale-110 group-active:scale-95 transition-all">
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

        {/* Mini Pulsing AI Badge */}
        <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] border-2 border-slate-950 shadow-md flex items-center gap-0.5 animate-pulse">
          <Sparkles className="w-2.5 h-2.5" />
          <span>AI</span>
        </div>
      </button>
    </div>
  );
};
