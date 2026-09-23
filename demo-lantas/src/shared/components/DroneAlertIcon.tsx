import React from 'react';

interface DroneAlertIconProps {
  className?: string;
}

/**
 * Custom SVG Icon: Front-Facing Drone (Sketch-Adapted) with a Bold Emergency Warning Symbol (⚠️ / !)
 * Designed specifically for high-contrast clarity on emergency buttons and navbars.
 */
export const DroneAlertIcon: React.FC<DroneAlertIconProps> = ({ className = 'w-8 h-8' }) => {
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
      {/* 1. SIMBOL DARURAT UTAMA (Segitiga Hazard + Tanda Seru Tebal / Warning Alert Symbol) */}
      <g>
        {/* Segitiga Peringatan Darurat (Emergency Hazard Triangle) */}
        <path
          d="M16 1.2 L22.8 10.4 H9.2 Z"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.22"
        />
        {/* Batang Tanda Seru Tebal & Tegas */}
        <line
          x1="16"
          y1="3.8"
          x2="16"
          y2="7.2"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Titik Tanda Seru Solid */}
        <circle cx="16" cy="9.1" r="1.1" fill="currentColor" stroke="none" />
      </g>

      {/* 2. BALING-BALING KIRI & KANAN (Tapered Airfoil Blades Melengkung Mengikuti Tombol) */}
      {/* Propeller Kiri */}
      <path
        d="M1 12 C3 11 8 11 10 12 C8 12.8 3 12.8 1 12 Z"
        fill="currentColor"
        fillOpacity="0.95"
        strokeWidth="0.8"
      />
      {/* Propeller Kanan */}
      <path
        d="M22 12 C24 11 29 11 31 12 C29 12.8 24 12.8 22 12 Z"
        fill="currentColor"
        fillOpacity="0.95"
        strokeWidth="0.8"
      />

      {/* 3. MOTOR PODS KIRI & KANAN */}
      <rect x="4.4" y="12.8" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.4" />
      <rect x="25.2" y="12.8" width="2.4" height="2.2" rx="0.5" fill="currentColor" fillOpacity="0.4" />

      {/* 4. LENGAN WINGLET BAWAH MOTOR */}
      <path d="M5.6 15 L6.6 17.8" strokeWidth="1.5" />
      <path d="M26.4 15 L25.4 17.8" strokeWidth="1.5" />

      {/* 5. STRUKTUR BODI AERODINAMIS DRONE (Sesuai Sketsa) */}
      {/* Upper Contour */}
      <path
        d="M5.6 13.8 C10 14.1 12.5 12.5 16 12.5 C19.5 12.5 22 14.1 26.4 13.8"
        strokeWidth="1.7"
      />
      {/* Lower Contour */}
      <path
        d="M5.6 14.9 C9.5 16.5 12.2 16.8 16 16.8 C19.8 16.8 22.5 16.5 26.4 14.9"
        strokeWidth="1.5"
      />
      {/* Garis Kubah Tengah */}
      <path d="M12.8 13.7 C14 13.1 18 13.1 19.2 13.7" strokeWidth="1.2" />

      {/* 6. GIMBAL CAMERA BOLA 4K */}
      {/* Mount stem */}
      <path d="M15.2 16.8 V17.8 H16.8 V16.8" strokeWidth="1.2" />
      {/* Camera sphere housing */}
      <circle cx="16" cy="20.4" r="2.2" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />
      {/* Camera optical lens core */}
      <circle cx="16" cy="20.4" r="1.1" fill="currentColor" stroke="none" />

      {/* 7. SEPASANG KAKI PENDARATAN MELENGKUNG (Arched Landing Gear) */}
      {/* Kaki Kiri */}
      <path
        d="M12.2 16.7 L9.6 23.2 Q9.2 24.6 7.8 24.6"
        strokeWidth="1.6"
      />
      {/* Kaki Kanan */}
      <path
        d="M19.8 16.7 L22.4 23.2 Q22.8 24.6 24.2 24.6"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default DroneAlertIcon;
