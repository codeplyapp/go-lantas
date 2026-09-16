// Theme and UI Constants for SIGAP (Korlantas POLRI Aesthetic)
// Unified 4-Color Palette: Black (#000000), Bright Teal Blue (#0077c0), Pale Sky (#c7eeff), Bright Snow (#fafafa)

export const THEME = {
  colors: {
    black: '#000000',           // Deep base text
    brightTealBlue: '#0077c0',  // Primary Brand & Interactive
    paleSky: '#c7eeff',         // Secondary Highlight & Soft Tint
    brightSnow: '#fafafa',      // Clean Light Surface

    primaryDark: '#000000',     // Deep crisp ink
    navySurface: '#ffffff',     // White Card surface
    navyBorder: '#e2e8f0',      // Border stroke
    policeBlue: '#0077c0',      // Korlantas Bright Teal Blue
    policeLightBlue: '#0077c0', // Primary Accent
    goldBadge: '#f59e0b',       // Korlantas Gold Insignia
    goldLight: '#fde68a',       // Gold highlight
    sosRed: '#dc2626',          // Emergency Red
    sosDarkRed: '#991b1b',      // Deep SOS Red
    safeGreen: '#16a34a',       // Safe Green / Success
  },
  roles: {
    pelajar: {
      label: 'Pelajar SMA/SMK',
      badgeColor: 'bg-[#0077c0]/15 text-[#0077c0] border-[#0077c0]/30 font-bold',
      tag: 'Generasi Pelopor Keselamatan',
    },
    mahasiswa: {
      label: 'Mahasiswa / Pemuda',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      tag: 'Penggerak Tertib Lalu Lintas',
    },
    orang_tua: {
      label: 'Orang Tua / Wali',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      tag: 'Pengawas Keselamatan Keluarga',
    },
  },
  trafficStatus: {
    lancar: { label: 'Lancar', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', hex: '#16a34a' },
    ramai_lancar: { label: 'Ramai Lancar', color: 'text-[#0077c0] bg-[#0077c0]/10 border-[#0077c0]/30', hex: '#0077c0' },
    padat_merayap: { label: 'Padat Merayap', color: 'text-amber-800 bg-amber-50 border-amber-300', hex: '#d97706' },
    macet_total: { label: 'Macet Total', color: 'text-rose-700 bg-rose-50 border-rose-300', hex: '#dc2626' },
  },
  rankBadges: [
    { minPoints: 0, title: 'Kadet Tertib', icon: '🔰', color: 'text-slate-600' },
    { minPoints: 100, title: 'Warga Sadar Lalu Lintas', icon: '⭐', color: 'text-[#0077c0]' },
    { minPoints: 300, title: 'Duta Pelopor Keselamatan', icon: '🛡️', color: 'text-amber-700' },
    { minPoints: 600, title: 'Komandan Generasi Go Lantas', icon: '👑', color: 'text-yellow-700' },
  ]
};
