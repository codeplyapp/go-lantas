import React, { useState, useEffect, useRef } from 'react';
import { Shield, Code } from 'lucide-react';
import { Header } from './shared/components/Header';
import { BottomNavBar, TabType } from './shared/components/BottomNavBar';
import { ToastContainer } from './shared/components/ToastContainer';
import { NotificationService } from './shared/services/notification';
import { authService, AuthSession } from './services/auth';
import { UserProfile } from './core/types';

// Flow Screens
import { SplashScreen } from './features/splash/SplashScreen';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { AuthScreen } from './features/auth/AuthScreen';
import { EmailVerificationScreen } from './features/auth/EmailVerificationScreen';
import { ReverifyScreen } from './features/auth/ReverifyScreen';
import { CompleteProfileRouter } from './features/auth/CompleteProfileRouter';
import { AuthGuard } from './features/auth/AuthGuard';

// Feature Views
import { BerandaView } from './features/beranda/BerandaView';
import { BelajarPage } from './features/belajar/BelajarPage';
import { SOSView } from './features/sos/SOSView';
import { PetaView } from './features/peta/PetaView';
import { KeluargaView } from './features/keluarga/KeluargaView';
import { ProfilView } from './features/profil/ProfilView';

// Robot AI Assistant
import { FloatingMascotBubble } from './features/robot/FloatingMascotBubble';
import { RobotChatModal } from './features/robot/RobotChatModal';

type AppFlowState = 'splash' | 'onboarding' | 'auth' | 'email_verification' | 'reverify' | 'complete_profile' | 'app';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppFlowState>('splash');
  const [session, setSession] = useState<AuthSession | null>(() => authService.getCachedSession());
  const sessionRef = useRef<AuthSession | null>(session);
  sessionRef.current = session;

  const [verifyEmail, setVerifyEmail] = useState<string>('');
  const [reverifyEmail, setReverifyEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('beranda');
  const [isRobotChatOpen, setIsRobotChatOpen] = useState<boolean>(false);
  const [robotInitialPrompt, setRobotInitialPrompt] = useState<string | undefined>(undefined);
  const mainScrollRef = useRef<HTMLElement>(null);

  // Scroll to top on active tab change
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // Initialize Notification Engine, Light Theme, & Auth Listener
  useEffect(() => {
    NotificationService.init();

    // Always enforce pure light theme
    localStorage.setItem('sigap_theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');

    // Subscribe to Auth state changes
    const unsubAuth = authService.onAuthChange((authSession) => {
      setSession(authSession);
      sessionRef.current = authSession;

      // If auth session resolved with valid user, automatically route to app if stuck in auth screen
      if (authSession?.user) {
        if (!authSession.profile || !authSession.profile.role) {
          setAppState('complete_profile');
        } else {
          setAppState((prev) => (prev === 'auth' ? 'app' : prev));
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // Handle Splash Screen Completion & Route to Destination
  const handleSplashFinish = () => {
    const onboardingDone = localStorage.getItem('sigap_onboarding_done');
    const activeSession = sessionRef.current || authService.getCachedSession();

    if (!onboardingDone && !activeSession?.user) {
      setAppState('onboarding');
      return;
    }

    if (activeSession?.user) {
      if (!activeSession.profile || !activeSession.profile.role) {
        setAppState('complete_profile');
      } else {
        setAppState('app');
      }
    } else {
      setAppState('auth');
    }
  };

  // Handle Onboarding Completion
  const handleOnboardingFinish = () => {
    const activeSession = sessionRef.current || authService.getCachedSession();

    if (activeSession?.user) {
      if (!activeSession.profile || !activeSession.profile.role) {
        setAppState('complete_profile');
      } else {
        setAppState('app');
      }
    } else {
      setAppState('auth');
    }
  };

  // Handle Successful Sign In / Sign Up
  const handleAuthSuccess = (newSession: AuthSession, isNewProfile?: boolean) => {
    setSession(newSession);
    sessionRef.current = newSession;
    authService.setCachedSession(newSession);

    if (isNewProfile || !newSession.profile || !newSession.profile.role) {
      setAppState('complete_profile');
    } else {
      setAppState('app');
      NotificationService.showInAppToast(
        'Selamat Datang!',
        `Halo ${newSession.profile.nama}, selamat datang di GO Lantas Korlantas POLRI.`,
        'success'
      );
    }
  };

  // Handle Profile Completion (e.g. Google Auth role selection)
  const handleProfileCompleted = (profile: UserProfile) => {
    if (session) {
      setSession({
        ...session,
        profile,
      });
    }
    setAppState('app');
    NotificationService.showInAppToast(
      'Profil Disimpan!',
      `Peran Anda sebagai ${profile.role === 'orang_tua' ? 'Orang Tua' : profile.role} telah aktif.`,
      'success'
    );
  };

  // Handle Sign Out Action
  const handleSignOut = async () => {
    await authService.signOutUser();
    setSession(null);
    setAppState('auth');
    NotificationService.showInAppToast(
      'Berhasil Keluar',
      'Sesi akun Anda telah ditutup dengan aman.',
      'info'
    );
  };

  const handleOpenRobotChat = (prompt?: string) => {
    setRobotInitialPrompt(prompt);
    setIsRobotChatOpen(true);
  };

  // 1. Splash Screen View
  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 2. Onboarding Screen View
  if (appState === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  // 3. Auth Screen View
  if (appState === 'auth') {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onNavigateToEmailVerification={(email) => {
          setVerifyEmail(email);
          setAppState('email_verification');
        }}
        onNavigateToReverify={(email) => {
          setReverifyEmail(email || '');
          setAppState('reverify');
        }}
      />
    );
  }

  // 4. Email Verification Screen View (after Sign Up)
  if (appState === 'email_verification') {
    return (
      <EmailVerificationScreen
        email={verifyEmail}
        onVerified={() => {
          // After verification, re-check auth state — onAuthChange will fire
          setAppState('app');
          NotificationService.showInAppToast(
            'Email Terverifikasi!',
            'Akun Anda telah aktif. Selamat datang di GO Lantas Korlantas POLRI.',
            'success'
          );
        }}
        onBack={() => setAppState('auth')}
      />
    );
  }

  // 5. Reverify Screen View (for unverified accounts)
  if (appState === 'reverify') {
    return (
      <ReverifyScreen
        initialEmail={reverifyEmail}
        onVerificationSent={(email) => {
          setVerifyEmail(email);
          setAppState('email_verification');
        }}
        onBack={() => setAppState('auth')}
      />
    );
  }

  // 6. Complete Profile Router View
  if (appState === 'complete_profile' && session?.user) {
    return (
      <CompleteProfileRouter 
        user={session.user} 
        onCompleted={handleProfileCompleted} 
      />
    );
  }

  // 7. Main Application Navigator (Wrapped in AuthGuard)
  return (
    <AuthGuard session={session} onAuthSuccess={handleAuthSuccess}>
      <div className="fixed inset-0 bg-[#F0F4F8] text-slate-900 flex flex-col items-center justify-center sm:py-6 sm:px-4 selection:bg-[#0077c0] selection:text-white overflow-hidden">
        {/* Mobile-Frame Container */}
        <div className="w-full max-w-2xl h-full sm:h-[880px] sm:max-h-[96vh] sm:rounded-[36px] bg-[#FAFAFA] sm:border sm:border-[#0077c0]/15 shadow-[0_20px_50px_rgba(0,119,192,0.12)] flex flex-col relative overflow-hidden">
          
          {/* Subtle Embossed Watermark */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 pointer-events-none opacity-[0.035] text-[#0077c0] select-none z-0">
            <Shield className="w-full h-full stroke-[1] fill-current" />
          </div>
          <div className="absolute top-28 -left-16 w-64 h-64 pointer-events-none opacity-[0.025] text-[#0077c0] select-none z-0">
            <Code className="w-full h-full stroke-[1.5]" />
          </div>

          {/* Sticky App Header */}
          <Header
            profile={session?.profile}
            onNavigateTab={(tab) => setActiveTab(tab as TabType)}
          />

          {/* Dynamic Scrollable Content Screen */}
          <main ref={mainScrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4.5 sm:px-6 pt-5 pb-6 no-scrollbar">
            <div key={activeTab} className="animate-page-transition space-y-6">
              {activeTab === 'beranda' && (
                <BerandaView
                  profile={session?.profile}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenRobotChat={handleOpenRobotChat}
                />
              )}

              {(activeTab === 'belajar' || (activeTab as string) === 'kuis') && (
                <BelajarPage profile={session?.profile} />
              )}

              {activeTab === 'sos' && <SOSView />}

              {activeTab === 'peta' && <PetaView />}

              {activeTab === 'keluarga' && <KeluargaView />}

              {activeTab === 'profil' && (
                <ProfilView
                  user={session?.profile}
                  onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                  onOpenRobotChat={handleOpenRobotChat}
                  onSignOut={handleSignOut}
                  onProfileUpdated={(partial) => {
                    if (session?.profile) {
                      setSession({
                        ...session,
                        profile: {
                          ...session.profile,
                          ...partial,
                        },
                      });
                    }
                  }}
                />
              )}
            </div>
          </main>

          {/* Global Floating AI Mascot (Si SIGAP) */}
          <FloatingMascotBubble
            isOpen={isRobotChatOpen}
            onClick={() => handleOpenRobotChat()}
          />

          {/* Sticky Bottom Dock */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
          />

          {/* In-App Toast Container */}
          <ToastContainer />

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
    </AuthGuard>
  );
};

export default App;
