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
      {/* 1. TANDA SERU (!) BESAR & SANGAT TEGAS DI ATAS DRONE */}
      {/* Batang Tanda Seru Tebal & Kokoh */}
      <path
        d="M14.2 1.2 H17.8 L17.0 7.2 H15.0 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.0"
        strokeLinejoin="round"
      />
      {/* Titik Tanda Seru Bulat Solid */}
      <circle cx="16" cy="10.0" r="1.7" fill="currentColor" stroke="none" />

      {/* 2. BALING-BALING KIRI & KANAN (Tapered Airfoil Blades) */}
      {/* Propeller Kiri */}
      <path
        d="M1 13.0 C3 12.0 8 12.0 10 13.0 C8 13.8 3 13.8 1 13.0 Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0.8"
      />
      {/* Propeller Kanan */}
      <path
        d="M22 13.0 C24 12.0 29 12.0 31 13.0 C29 13.8 24 13.8 22 13.0 Z"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="0.8"
      />

      {/* 3. MOTOR PODS KIRI & KANAN */}
      <rect x="4.4" y="13.8" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="25.2" y="13.8" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.3" />

      {/* 4. LENGAN WINGLET BAWAH MOTOR (Sesuai Sketsa) */}
      <path d="M5.6 16.0 L6.6 18.8" strokeWidth="1.5" />
      <path d="M26.4 16.0 L25.4 18.8" strokeWidth="1.5" />

      {/* 5. LENGAN STRUKTURAL & BODI AERODINAMIS (Front Profile DJI) */}
      {/* Upper Chassis Contour */}
      <path
        d="M5.6 14.8 C10 15.1 12.5 13.6 16 13.6 C19.5 13.6 22 15.1 26.4 14.8"
        strokeWidth="1.7"
      />
      {/* Lower Chassis Contour */}
      <path
        d="M5.6 15.9 C9.5 17.5 12.2 17.8 16 17.8 C19.8 17.8 22.5 17.5 26.4 15.9"
        strokeWidth="1.5"
      />
      {/* Central Dome Hood Seam */}
      <path d="M12.8 14.7 C14 14.1 18 14.1 19.2 14.7" strokeWidth="1.2" />

      {/* 6. GIMBAL CAMERA BOLA 4K (Di Bawah Bodi Sesuai Sketsa) */}
      {/* Mount stem */}
      <path d="M15.2 17.8 V18.9 H16.8 V17.8" strokeWidth="1.2" />
      {/* Camera sphere housing */}
      <circle cx="16" cy="21.5" r="2.2" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
      {/* Camera lens ring */}
      <circle cx="16" cy="21.5" r="1.1" fill="currentColor" stroke="none" />

      {/* 7. SEPASANG KAKI PENDARATAN MELENGKUNG (Arched Landing Gear) */}
      {/* Kaki Kiri */}
      <path
        d="M12.2 17.7 L9.6 24.1 Q9.2 25.5 7.8 25.5"
        strokeWidth="1.6"
      />
      {/* Kaki Kanan */}
      <path
        d="M19.8 17.7 L22.4 24.1 Q22.8 25.5 24.2 25.5"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default DroneAlertIcon;
