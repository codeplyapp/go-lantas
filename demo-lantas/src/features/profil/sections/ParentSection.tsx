import React from 'react';
import { Eye, Shield, ChevronRight } from 'lucide-react';
import { UserProfile } from '../../../core/types';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { Card } from '../../../shared/components/Card';
import { FieldRow } from '../../../shared/components/FieldRow';

interface ParentSectionProps {
  user: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const ParentSection: React.FC<ParentSectionProps> = ({
  user,
  onNavigateTab,
}) => {
  if (user.role !== 'orang_tua') {
    return null;
  }

  return (
    <div>
      <SectionHeader
        title="MODE ORANG TUA"
        badge={
          <span className="text-xs font-extrabold text-[#0077c0]">
            Kontrol Wali
          </span>
        }
      />
      <Card noPadding className="divide-y divide-slate-100">
        <FieldRow
          icon={<Eye className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Panel Pemantauan Keluarga"
          subtitle="Pantau rute aman dan status perjalanan anak"
          onClick={() => onNavigateTab?.('keluarga')}
        />
      </Card>
    </div>
  );
};
