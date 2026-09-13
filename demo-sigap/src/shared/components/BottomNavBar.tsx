import React from 'react';
import { Home, Gamepad2, MapPin, HeartHandshake, User, AlertCircle } from 'lucide-react';
import { sound } from '../services/sound';

export type TabType = 'beranda' | 'kuis' | 'peta' | 'sos' | 'keluarga' | 'profil';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'beranda' as TabType, label: 'Beranda', icon: Home },
    { id: 'kuis' as TabType, label: 'Kuis SIM', icon: Gamepad2 },
    { id: 'sos' as TabType, label: 'SOS 110', icon: AlertCircle, isEmergency: true },
    { id: 'peta' as TabType, label: 'Peta', icon: MapPin },
    { id: 'keluarga' as TabType, label: 'Keluarga', icon: HeartHandshake },
    { id: 'profil' as TabType, label: 'Profil', icon: User },
  ];

  const handleTabClick = (tab: TabType) => {
    sound.playClick();
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full glass-nav pb-safe border-t border-blue-900/40 shadow-2xl">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isEmergency) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
                aria-label="Darurat SOS 110"
              >
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isActive 
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-110 ring-4 ring-rose-500/40 shadow-rose-600/50' 
                    : 'bg-gradient-to-tr from-red-600 to-rose-700 text-white hover:scale-105 shadow-red-900/40 animate-pulse'
                }`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1 ${
                  isActive ? 'text-rose-400' : 'text-rose-300'
                }`}>
                  SOS 110
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-400 bg-blue-500/10 font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
