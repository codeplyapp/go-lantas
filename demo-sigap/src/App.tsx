import React, { useState, useEffect } from 'react';
import { MockDB } from './core/db';
import { Header } from './shared/components/Header';
import { BottomNavBar, TabType } from './shared/components/BottomNavBar';
import { PersonaSwitcherModal } from './shared/components/PersonaSwitcherModal';
import { DemoGuideModal } from './shared/components/DemoGuideModal';
import { ToastContainer } from './shared/components/ToastContainer';

// Feature Views
import { BerandaView } from './features/beranda/BerandaView';
import { GameKuisView } from './features/game_kuis/GameKuisView';
import { SOSView } from './features/sos/SOSView';
import { PetaView } from './features/peta/PetaView';
import { KeluargaView } from './features/keluarga/KeluargaView';
import { ProfilView } from './features/profil/ProfilView';

// Robot AI Assistant
import { FloatingMascotBubble } from './features/robot/FloatingMascotBubble';
import { RobotChatModal } from './features/robot/RobotChatModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('beranda');
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isRobotChatOpen, setIsRobotChatOpen] = useState<boolean>(false);
  const [robotInitialPrompt, setRobotInitialPrompt] = useState<string | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Initialize Mock Firestore DB on boot
  useEffect(() => {
    MockDB.init();

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenRobotChat = (prompt?: string) => {
    setRobotInitialPrompt(prompt);
    setIsRobotChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col items-center justify-start sm:py-6 selection:bg-[#0066cc] selection:text-white">
      {/* Mobile-Frame Container (Clean Native iOS App Feel on Desktop and Mobile) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[40px] bg-[#060b18] sm:border sm:border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col relative overflow-hidden">
        
        {/* iOS-style Top Status Bar (Desktop/Tablet mockup feel) */}
        <div className="w-full pt-2.5 pb-1 px-6 flex items-center justify-between text-[12px] font-semibold text-slate-300 select-none bg-[#080e1e] border-b border-white/5 shrink-0 z-40">
          <span>{currentTime}</span>
          {/* Subtle Dynamic Island pill */}
          <div className="w-20 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center gap-1.5 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-slate-400 tracking-wider">SIGAP</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Sticky App Header */}
        <Header
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Dynamic Scrollable Content Screen */}
        <main className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-24 no-scrollbar">
          {activeTab === 'beranda' && (
            <BerandaView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenRobotChat={handleOpenRobotChat}
              onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
            />
          )}

          {activeTab === 'kuis' && <GameKuisView />}

          {activeTab === 'sos' && <SOSView />}

          {activeTab === 'peta' && <PetaView />}

          {activeTab === 'keluarga' && <KeluargaView />}

          {activeTab === 'profil' && <ProfilView />}
        </main>

        {/* Global Floating AI Mascot */}
        <FloatingMascotBubble
          isOpen={isRobotChatOpen}
          onClick={() => handleOpenRobotChat()}
        />

        {/* Sticky Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* In-App Toast Container */}
        <ToastContainer />

        {/* Persona Switcher Modal */}
        <PersonaSwitcherModal
          isOpen={isPersonaModalOpen}
          onClose={() => setIsPersonaModalOpen(false)}
        />

        {/* Presentation Demo Guide Modal */}
        <DemoGuideModal
          isOpen={isDemoTourOpen}
          onClose={() => setIsDemoTourOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenRobotChat={() => handleOpenRobotChat()}
        />

        {/* Robot AI Chat Modal */}
        <RobotChatModal
          isOpen={isRobotChatOpen}
          onClose={() => {
            setIsRobotChatOpen(false);
            setRobotInitialPrompt(undefined);
          }}
          initialPrompt={robotInitialPrompt}
        />
      </div>
    </div>
  );
};

export default App;
