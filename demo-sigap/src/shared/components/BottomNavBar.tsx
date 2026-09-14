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
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full glass-bottom-bar pb-safe shadow-2xl">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isEmergency) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none min-w-[48px] min-h-[48px]"
                aria-label="Darurat SOS 110"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                  isActive 
                    ? 'bg-red-600 text-white scale-105 ring-4 ring-rose-500/40 shadow-rose-600/50' 
                    : 'bg-red-600 text-white hover:bg-red-500 shadow-red-900/40 animate-pulse-sos-apple'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1 ${
                  isActive ? 'text-rose-400 font-extrabold' : 'text-rose-300 font-semibold'
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
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-[48px] min-h-[48px] transition-all duration-150 btn-press ${
                isActive 
                  ? 'text-blue-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative flex flex-col items-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.3]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-0.5" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-apple-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
