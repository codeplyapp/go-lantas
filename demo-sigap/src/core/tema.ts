// Theme and UI Constants for SIGAP (Korlantas POLRI Aesthetic)

export const THEME = {
  colors: {
    primaryDark: '#060B18',     // Deep space navy
    navySurface: '#0F172A',     // Card surface
    navyBorder: '#1E293B',      // Border stroke
    policeBlue: '#2563EB',      // Korlantas Blue
    policeLightBlue: '#38BDF8', // Cyan glow
    goldBadge: '#F59E0B',       // Korlantas Gold Insignia
    goldLight: '#FDE68A',       // Gold highlight
    sosRed: '#EF4444',          // Emergency Red
    sosDarkRed: '#991B1B',      // Deep SOS Red
    safeGreen: '#10B981',       // Safe Green / Success
  },
  roles: {
    pelajar: {
      label: 'Pelajar SMA/SMK',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      tag: 'Generasi Pelopor Keselamatan',
    },
    mahasiswa: {
      label: 'Mahasiswa / Pemuda',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      tag: 'Penggerak Tertib Lalu Lintas',
    },
    orang_tua: {
      label: 'Orang Tua / Wali',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      tag: 'Pengawas Keselamatan Keluarga',
    },
  },
  trafficStatus: {
    lancar: { label: 'Lancar', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', hex: '#10b981' },
    ramai_lancar: { label: 'Ramai Lancar', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', hex: '#3b82f6' },
    padat_merayap: { label: 'Padat Merayap', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', hex: '#f59e0b' },
    macet_total: { label: 'Macet Total', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', hex: '#ef4444' },
  },
  rankBadges: [
    { minPoints: 0, title: 'Kadet Tertib', icon: '🔰', color: 'text-slate-400' },
    { minPoints: 100, title: 'Warga Sadar Lalu Lintas', icon: '⭐', color: 'text-blue-400' },
    { minPoints: 300, title: 'Duta Pelopor Keselamatan', icon: '🛡️', color: 'text-amber-400' },
    { minPoints: 600, title: 'Komandan Generasi SIGAP', icon: '👑', color: 'text-yellow-300' },
  ]
};
