import React from 'react';
import { Home, GraduationCap, MapPin, User, AlertCircle } from 'lucide-react';
import { sound } from '../services/sound';

export type TabType = 'beranda' | 'belajar' | 'sos' | 'peta' | 'profil' | 'keluarga';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'beranda' as TabType, label: 'Beranda', icon: Home },
    { id: 'belajar' as TabType, label: 'Belajar', icon: GraduationCap },
    { id: 'sos' as TabType, label: 'SOS 110', icon: AlertCircle, isEmergency: true },
    { id: 'peta' as TabType, label: 'Peta', icon: MapPin },
    { id: 'profil' as TabType, label: 'Profil', icon: User },
  ];

  // Calculate active index (fallback to 0 if 'keluarga' or unknown)
  const activeIndex = Math.max(0, navItems.findIndex(item => item.id === activeTab));

  const handleTabClick = (tab: TabType) => {
    sound.playClick();
    onSelectTab(tab);
  };

  return (
    <nav className="relative z-40 w-full glass-bottom-bar border-t border-[#E5EBE8] overflow-visible shrink-0 select-none pb-safe bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,119,192,0.06)]">
      {/* Sliding Top Spotlight Indicator Line */}
      <div 
        className="absolute top-0 h-[2.5px] transition-all duration-300 ease-out pointer-events-none flex items-center justify-center z-30"
        style={{
          left: `${activeIndex * 20}%`,
          width: '20%',
          transform: 'translateY(-1px)',
        }}
      >
        <div className={`w-8 h-[2.5px] rounded-full transition-colors duration-300 ${
          navItems[activeIndex]?.isEmergency 
            ? 'bg-red-600 shadow-[0_1px_8px_rgba(220,38,38,0.6)]' 
            : 'bg-[#0077c0] shadow-[0_1px_8px_rgba(0,119,192,0.6)]'
        }`} />
      </div>

      <div className="w-full px-1 sm:px-4 py-0.5 flex items-center justify-between relative">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          // Spotlight calculation based on distance from active indicator
          const distance = Math.abs(activeIndex - index);
          const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.55);

          if (item.isEmergency) {
            return (
              <div 
                key={item.id}
                className="relative w-1/5 flex flex-col items-center justify-center"
              >
                {/* Spotlight Cone Glow for SOS */}
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-14 h-20 bg-gradient-to-b from-red-500/20 via-red-300/10 to-transparent blur-sm rounded-full pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: spotlightOpacity,
                    transitionDelay: isActive ? '0.05s' : '0s',
                  }}
                />

                <button
                  onClick={() => handleTabClick(item.id)}
                  className="relative -top-3 flex flex-col items-center group focus:outline-none min-w-[48px] z-20 btn-press"
                  aria-label="Darurat SOS 110"
                >
                  <div className={`w-11.5 h-11.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-red-600 text-white scale-105 ring-3 ring-red-100 shadow-[0_3px_14px_rgba(220,38,38,0.5)]' 
                      : 'bg-red-600 text-white hover:bg-red-500 animate-pulse-sos-apple shadow-[0_3px_12px_rgba(220,38,38,0.35)]'
                  }`}>
                    <Icon className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-extrabold tracking-tight mt-0.5 text-rose-600">
                    SOS 110
                  </span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="relative w-1/5 flex flex-col items-center justify-center pt-1 pb-1 rounded-xl min-h-[42px] transition-all duration-200 btn-press group overflow-hidden"
            >
              {/* Spotlight Glow Cone - Tight & Close to Icon */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-14 bg-gradient-to-b from-[#0077c0]/20 via-[#c7eeff]/10 to-transparent blur-sm rounded-full pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: spotlightOpacity,
                  transitionDelay: isActive ? '0.05s' : '0s',
                }}
              />

              <div className="relative flex flex-col items-center z-10">
                <Icon 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive 
                      ? 'stroke-[2.5] text-[#0077c0] scale-105' 
                      : 'stroke-[1.8] text-slate-500 group-hover:text-slate-800'
                  }`} 
                />
              </div>

              <span className={`text-[10px] mt-0.5 tracking-apple-tight z-10 transition-colors duration-200 ${
                isActive 
                  ? 'text-[#0077c0] font-extrabold' 
                  : 'text-slate-500 group-hover:text-slate-900 font-semibold'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
