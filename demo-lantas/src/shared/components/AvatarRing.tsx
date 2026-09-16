import React from 'react';
import { Pencil } from 'lucide-react';

interface AvatarRingProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onEditClick?: () => void;
  className?: string;
}

export const AvatarRing: React.FC<AvatarRingProps> = ({
  src,
  alt,
  size = 'lg',
  editable = false,
  onEditClick,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-4 h-4',
  };

  const isLogo = !src || src.includes('logo.png') || src.includes('dicebear') || src.includes('mascot1.png');
  const avatarSrc = isLogo ? '/mascot/logo.png' : src;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full p-[3px] bg-gradient-to-tr from-[#0077c0] via-[#38bdf8] to-[#c7eeff] shadow-sm flex items-center justify-center`}
      >
        <img
          src={avatarSrc}
          alt={alt}
          className={`w-full h-full rounded-full bg-white transition-all ${
            isLogo ? 'object-contain p-1.5 sm:p-2' : 'object-cover'
          }`}
          onError={(e) => {
            e.currentTarget.src = '/mascot/logo.png';
          }}
        />
      </div>

      {editable && (
        <button
          type="button"
          onClick={onEditClick}
          className="absolute bottom-0 right-0 p-1.5 bg-[#0077c0] hover:bg-[#00609c] text-white rounded-full shadow-md border-2 border-white transition-transform active:scale-95"
          title="Ubah Foto Profil"
          aria-label="Ubah Foto Profil"
        >
          <Pencil className={iconSizeMap[size]} />
        </button>
      )}
    </div>
  );
};
