import React from 'react';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionClick,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-2.5 px-1 ${className}`}>
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
        {badge}
      </div>
      {actionText && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="text-xs font-bold text-[#0077c0] hover:text-[#005a91] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
