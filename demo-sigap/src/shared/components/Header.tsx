import React, { useState, useEffect } from 'react';
import { Shield, Flame, Award, Users, BookOpen } from 'lucide-react';
import { MockDB } from '../../core/db';
import { UserProfile, UserRole } from '../../core/types';
import { THEME } from '../../core/tema';

interface HeaderProps {
  onOpenPersonaModal: () => void;
  onOpenDemoTour: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPersonaModal, onOpenDemoTour, onNavigateTab }) => {
  const [user, setUser] = useState<UserProfile>(MockDB.getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => {
      setUser(MockDB.getCurrentUser());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  const roleStyle = THEME.roles[user.role as UserRole] || THEME.roles.pelajar;

  return (
    <header className="sticky top-0 z-30 w-full glass-nav-frosted px-3.5 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Logo & App Brand */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group btn-press"
          onClick={() => onNavigateTab('beranda')}
        >
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
              <Shield className="w-4.5 h-4.5 text-amber-400 fill-amber-400/20" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base tracking-apple-tight text-white">
                SIGAP
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                KORLANTAS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              LKTI Polri 2026
            </p>
          </div>
        </div>

        {/* Right Action Badges: Streak, Points & Persona Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Streak Counter Pill */}
          <div 
            title="Streak Kuis Harian"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span>{user.streak_hari}d</span>
          </div>

          {/* Points Counter Pill */}
          <div 
            title="Total Poin Keselamatan"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.poin_total}p</span>
          </div>

          {/* Persona Switcher Capsule */}
          <button
            onClick={onOpenPersonaModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-sm transition-all active:scale-95 ${roleStyle.badgeColor}`}
            title="Ganti Persona (Pelajar / Orang Tua / Mahasiswa)"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="capitalize max-w-[65px] truncate">{user.role.replace('_', ' ')}</span>
          </button>

          {/* Demo Script Tour Shortcut */}
          <button
            onClick={onOpenDemoTour}
            className="p-1.5 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
            title="Panduan Skrip Presentasi Juri LKTI"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
