import React from 'react';

interface DroneAlertIconProps {
  className?: string;
}

/**
 * Custom SVG Icon: Front-Facing Drone with Emergency Exclamation Mark (!) on top
 */
export const DroneAlertIcon: React.FC<DroneAlertIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 1. Tanda Seru (!) di Atas Drone */}
      <line x1="12" y1="2" x2="12" y2="5.5" strokeWidth="2.5" />
      <circle cx="12" cy="8" r="1.05" fill="currentColor" stroke="none" />

      {/* 2. Baling-Baling Kiri & Kanan (Front Profile) */}
      <line x1="1.5" y1="11" x2="6.5" y2="11" strokeWidth="1.8" />
      <line x1="17.5" y1="11" x2="22.5" y2="11" strokeWidth="1.8" />

      {/* 3. Motor Pods & Lengan Penyangga */}
      <path d="M4 11v2.5l4.5 1.5" />
      <path d="M20 11v2.5l-4.5 1.5" />

      {/* 4. Bodi Utama Drone (Hadap Depan) */}
      <rect x="8" y="13.5" width="8" height="4.5" rx="1.5" />
      <circle cx="12" cy="15.75" r="1.1" fill="currentColor" stroke="none" />

      {/* 5. Kaki Pendaratan (Landing Skids) */}
      <path d="M7 18l-1.5 3.5h3" />
      <path d="M17 18l1.5 3.5h-3" />
    </svg>
  );
};

export default DroneAlertIcon;
