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

  // Initialize Mock Firestore DB on boot
  useEffect(() => {
    MockDB.init();
  }, []);

  const handleOpenRobotChat = (prompt?: string) => {
    setRobotInitialPrompt(prompt);
    setIsRobotChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-6 selection:bg-blue-600 selection:text-white">
      {/* Mobile-Frame Container (Clean Native App Feel on Desktop and Mobile) */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[36px] bg-slate-950 sm:border sm:border-blue-900/40 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Sticky App Header */}
        <Header
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Dynamic Scrollable Content Screen */}
        <main className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-20 no-scrollbar">
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
