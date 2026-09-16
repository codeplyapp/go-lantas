import React from 'react';

interface HeaderProps {
  onNavigateTab: (tab: string) => void;
  profile?: {
    nama?: string | null;
    avatar_url?: string | null;
    role?: string | null;
    sekolah_kampus?: string | null;
    kelas_jurusan?: string | null;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateTab, profile }) => {
  const nama = profile?.nama || 'Pengguna GO Lantas';
  const role = profile?.role?.replace('_', ' ') || '';
  const sekolah = profile?.sekolah_kampus || '';
  const kelas = profile?.kelas_jurusan || '';
  const avatarUrl = profile?.avatar_url && !profile.avatar_url.includes('bottts') && !profile.avatar_url.includes('mascot1.png')
    ? profile.avatar_url
    : '/mascot/logo.png';
  const isLogoAvatar = !profile?.avatar_url || profile.avatar_url.includes('logo.png') || profile.avatar_url.includes('bottts') || profile.avatar_url.includes('mascot1.png');

  return (
    <header className="shrink-0 z-30 w-full glass-nav-frosted px-3.5 sm:px-6 py-2.5 transition-all select-none border-b border-[#E5EBE8] bg-white/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,119,192,0.04)]">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        {/* User Identity Info */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group btn-press min-w-0"
          onClick={() => onNavigateTab('profil')}
          title="Buka Profil"
        >
          <div className="relative w-11 h-11 rounded-[14px] bg-gradient-to-tr from-[#0077c0] to-[#c7eeff] p-0.5 shadow-xs shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
            <img 
              src={avatarUrl} 
              alt={nama} 
              className={`w-full h-full rounded-[12px] bg-white transition-all ${isLogoAvatar ? 'object-contain p-1' : 'object-cover'}`}
              onError={(e) => {
                e.currentTarget.src = '/mascot/logo.png';
              }} 
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-heading font-extrabold text-[#0F172A] tracking-apple-tight truncate group-hover:text-[#0077c0] transition-colors">
                {nama}
              </h2>
              {role && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 capitalize">
                  • {role}
                </span>
              )}
            </div>
            {sekolah && (
              <p className="text-[11px] sm:text-xs text-[#0077c0] font-bold truncate mt-0.5">
                {sekolah}
              </p>
            )}
            {kelas && (
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                {kelas}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
