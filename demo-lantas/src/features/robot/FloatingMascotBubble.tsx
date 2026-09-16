import React, { useState } from 'react';
import { MASCOT_CONFIG } from '../../core/mascot';
import { sound } from '../../shared/services/sound';

interface FloatingMascotBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingMascotBubble: React.FC<FloatingMascotBubbleProps> = ({ onClick, isOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    sound.playClick();
    onClick();
  };

  return (
    <div 
      className={`absolute bottom-[66px] sm:bottom-[72px] right-4 sm:right-6 z-40 transition-all duration-300 ease-out ${
        isOpen 
          ? 'scale-0 opacity-0 pointer-events-none translate-y-6 rotate-12' 
          : 'scale-100 opacity-100 animate-mascot-pop-in'
      }`}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group focus:outline-none min-w-[54px] min-h-[54px] btn-press transition-transform duration-200"
        title="Tanya GO Lantas (Asisten AI Korlantas)"
        aria-label="Tanya Robot AI GO Lantas"
      >
        {/* Soft Animated Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-[#0077c0]/20 blur-md animate-pulse -z-10" />

        {/* Mascot Face Bubble */}
        <div className="relative w-14 h-14 flex items-center justify-center transition-all group-hover:scale-110 drop-shadow-md">
          <img
            src={MASCOT_CONFIG.avatarUrl}
            alt={MASCOT_CONFIG.name}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isHovered ? 'rotate-6 scale-105' : 'animate-float-mascot-smooth'
            }`}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.endsWith('.svg')) {
                target.src = MASCOT_CONFIG.fallbackAvatarUrl;
              }
            }}
          />
        </div>

        {/* Mini Pill AI Badge */}
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0077c0] text-white font-extrabold text-[9px] border border-white shadow-sm flex items-center justify-center gap-1 group-hover:bg-[#008be0] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>AI</span>
        </div>

        {/* Floating Tooltip Pill on Hover */}
        <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none hidden sm:flex items-center gap-1">
          <span>Tanya GO Lantas</span>
          <span className="text-[10px] text-blue-300">✨</span>
        </div>
      </button>
    </div>
  );
};
