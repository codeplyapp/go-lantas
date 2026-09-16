import React from 'react';
import { Loader2 } from 'lucide-react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Btn: React.FC<BtnProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#0077c0] hover:bg-[#00609c] text-white shadow-xs focus:ring-[#0077c0]/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-200',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500/30',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-100',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-100',
  };

  const sizeStyles = {
    sm: 'py-2 px-3 text-xs rounded-full gap-1.5',
    md: 'py-2.5 px-4 text-sm rounded-full gap-2',
    lg: 'py-3.5 px-6 text-base rounded-full gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`font-bold transition-all inline-flex items-center justify-center select-none btn-press focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
