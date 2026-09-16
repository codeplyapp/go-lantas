import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={`apple-card bg-white rounded-[20px] overflow-hidden ${
        noPadding ? '' : 'p-4 sm:p-5'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
