import React from 'react';
import { UserProfile } from '../../core/types';
import { ProfileCard } from './sections/ProfileCard';
import { PairingCard } from './sections/PairingCard';
import { RewardSection } from './sections/RewardSection';
import { ParentSection } from './sections/ParentSection';
import { SettingsSection } from './sections/SettingsSection';
import { InfoSection } from './sections/InfoSection';
import { LogoutCard } from './sections/LogoutCard';

interface ProfilPageProps {
  user?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
  onOpenRobotChat?: (prompt?: string) => void;
  onSignOut?: () => void;
  onProfileUpdated?: (partial: Partial<UserProfile>) => void;
}

export const ProfilPage: React.FC<ProfilPageProps> = ({
  user,
  onNavigateTab,
  onSignOut,
  onProfileUpdated,
}) => {
  const safeUser: UserProfile = user || {
    uid: 'guest',
    nama: 'Pengguna GO Lantas',
    role: 'pelajar',
    sekolah_kampus: '',
    poin_total: 0,
    streak_hari: 0,
    kuis_selesai: 0,
    jawaban_benar: 0,
    total_jawaban: 0,
    pairing_code: 'SGP-8821',
    created_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-5 pb-8 animate-fadeIn">
      {/* 1. Identity & Stat Tiles (Card 1) */}
      <ProfileCard user={safeUser} onUpdated={onProfileUpdated} />

      {/* 2. Family Pairing Code Card (Card 2) */}
      <PairingCard user={safeUser} />

      {/* 3. Poin & Penghargaan (Section 3) */}
      <RewardSection user={safeUser} />

      {/* 4. Mode Orang Tua (Section 4 - Conditional) */}
      <ParentSection user={safeUser} onNavigateTab={onNavigateTab} />

      {/* 5. Pengaturan (Section 5) */}
      <SettingsSection />

      {/* 6. Edukasi & Informasi (Section 6) */}
      <InfoSection />

      {/* 7. Logout (Card 7) */}
      <LogoutCard 
        onSignOut={onSignOut}
      />
    </div>
  );
};
