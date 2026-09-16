import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { UserProfile } from '../../../core/types';
import { AvatarRing } from '../../../shared/components/AvatarRing';
import { Card } from '../../../shared/components/Card';
import { StatTiles } from '../components/StatTiles';
import { EditProfileSheet } from '../components/EditProfileSheet';

interface ProfileCardProps {
  user: UserProfile;
  onUpdated?: (partial: Partial<UserProfile>) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onUpdated }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const roleLabel =
    user.role === 'pelajar'
      ? 'Pelajar SMA/SMK'
      : user.role === 'mahasiswa'
      ? 'Mahasiswa'
      : 'Orang Tua / Wali';

  return (
    <>
      <Card className="text-center relative space-y-4">
        {/* Avatar Ring with Edit Pencil */}
        <div className="pt-2 flex justify-center">
          <AvatarRing
            src={user.avatar_url}
            alt={user.nama}
            size="xl"
            editable
            onEditClick={() => setIsEditOpen(true)}
          />
        </div>

        {/* Name & Subtitles */}
        <div>
          <div className="inline-flex items-center justify-center gap-1.5 group cursor-pointer" onClick={() => setIsEditOpen(true)}>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-apple-tight group-hover:text-[#0077c0] transition-colors">
              {user.nama}
            </h2>
            <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0077c0] transition-colors" />
          </div>

          <p className="text-xs text-[#0077c0] font-bold mt-0.5">
            {user.sekolah_kampus || 'Pelopor Keselamatan'} • <span className="text-slate-600 font-semibold">{roleLabel}</span>
          </p>
        </div>

        {/* Integrated Stat Tiles Strip */}
        <StatTiles user={user} />
      </Card>

      {/* Edit Profile Bottom Sheet */}
      <EditProfileSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onUpdated={onUpdated}
      />
    </>
  );
};
