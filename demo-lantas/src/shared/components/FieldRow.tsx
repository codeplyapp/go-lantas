import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FieldRowProps {
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  icon,
  iconBgColor = 'bg-[#0077c0]/10',
  iconTextColor = 'text-[#0077c0]',
  title,
  subtitle,
  trailing,
  showChevron = true,
  onClick,
  className = '',
  disabled = false,
}) => {
  const isClickable = !!onClick && !disabled;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between py-3.5 px-4 transition-colors ${
        isClickable ? 'cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/60' : ''
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconTextColor}`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {trailing && <div className="shrink-0">{trailing}</div>}
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </div>
    </div>
  );
};
