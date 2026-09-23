import React from 'react';

interface DroneAlertIconProps {
  className?: string;
}

/**
 * Custom SVG Icon: Front-Facing DJI-Style Drone adapted from the architectural sketch
 * with emergency exclamation mark (!) on top, wide wingspan, arched landing gear,
 * underbelly gimbal camera, and streamlined aerodynamic chassis.
 */
export const DroneAlertIcon: React.FC<DroneAlertIconProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 1. TANDA SERU (!) DI ATAS DRONE */}
      <line x1="16" y1="2" x2="16" y2="6.2" strokeWidth="2.4" />
      <circle cx="16" cy="8.6" r="1.1" fill="currentColor" stroke="none" />

      {/* 2. BALING-BALING KIRI & KANAN (Tapered Airfoil Blades) */}
      {/* Propeller Kiri */}
      <path
        d="M1 11.6 C3 10.6 8 10.6 10 11.6 C8 12.4 3 12.4 1 11.6 Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0.8"
      />
      {/* Propeller Kanan */}
      <path
        d="M22 11.6 C24 10.6 29 10.6 31 11.6 C29 12.4 24 12.4 22 11.6 Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0.8"
      />

      {/* 3. MOTOR PODS KIRI & KANAN */}
      <rect x="4.4" y="12.5" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="25.2" y="12.5" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.3" />

      {/* 4. LENGAN WINGLET BAWAH MOTOR (Sesuai Sketsa) */}
      <path d="M5.6 14.7 L6.6 17.5" strokeWidth="1.5" />
      <path d="M26.4 14.7 L25.4 17.5" strokeWidth="1.5" />

      {/* 5. LENGAN STRUKTURAL & BODI AERODINAMIS (Front Profile DJI) */}
      {/* Upper Chassis Contour */}
      <path
        d="M5.6 13.5 C10 13.8 12.5 12.2 16 12.2 C19.5 12.2 22 13.8 26.4 13.5"
        strokeWidth="1.7"
      />
      {/* Lower Chassis Contour */}
      <path
        d="M5.6 14.6 C9.5 16.2 12.2 16.5 16 16.5 C19.8 16.5 22.5 16.2 26.4 14.6"
        strokeWidth="1.5"
      />
      {/* Central Dome Hood Seam */}
      <path d="M12.8 13.4 C14 12.8 18 12.8 19.2 13.4" strokeWidth="1.2" />

      {/* 6. GIMBAL CAMERA BOLA 4K (Di Bawah Bodi Sesuai Sketsa) */}
      {/* Mount stem */}
      <path d="M15.2 16.5 V17.6 H16.8 V16.5" strokeWidth="1.2" />
      {/* Camera sphere housing */}
      <circle cx="16" cy="20.2" r="2.2" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
      {/* Camera lens ring */}
      <circle cx="16" cy="20.2" r="1.1" fill="currentColor" stroke="none" />

      {/* 7. SEPASANG KAKI PENDARATAN MELENGKUNG (Arched Landing Gear) */}
      {/* Kaki Kiri */}
      <path
        d="M12.2 16.4 L9.6 22.8 Q9.2 24.2 7.8 24.2"
        strokeWidth="1.6"
      />
      {/* Kaki Kanan */}
      <path
        d="M19.8 16.4 L22.4 22.8 Q22.8 24.2 24.2 24.2"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default DroneAlertIcon;
