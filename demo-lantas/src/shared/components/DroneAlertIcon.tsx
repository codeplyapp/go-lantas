import React from 'react';

interface DroneAlertIconProps {
  className?: string;
}

/**
 * Custom Solid SVG Icon: DJI FPV Tactical Drone (Identical to 3D Viewport Model)
 * Features:
 * - Clear solid Exclamation Mark (!) on top
 * - Aerodynamic helmet cockpit canopy dome & cooling seam
 * - Front nose FPV camera gimbal with central optical eye & underbelly light
 * - X-frame tubular motor arms with vertical landing fin legs
 * - Airfoil tri-blade propellers with winglet accents
 */
export const DroneAlertIcon: React.FC<DroneAlertIconProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 1. TANDA SERU (!) SOLID & TEGAS DI ATAS DRONE */}
      <path
        d="M14.6 2 H17.4 L16.8 6.8 H15.2 Z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="16" cy="9.2" r="1.3" fill="currentColor" stroke="none" />

      {/* 2. BALING-BALING KIRI & KANAN (Airfoil Rotors) */}
      <path
        d="M1.5 13.2 C3.2 12.2 7.8 12.2 9.5 13.2 C7.8 14.0 3.2 14.0 1.5 13.2 Z"
        fill="currentColor"
        fillOpacity="0.85"
        strokeWidth="0.8"
      />
      <path
        d="M22.5 13.2 C24.2 12.2 28.8 12.2 30.5 13.2 C28.8 14.0 24.2 14.0 22.5 13.2 Z"
        fill="currentColor"
        fillOpacity="0.85"
        strokeWidth="0.8"
      />

      {/* 3. MOTOR PODS KIRI & KANAN */}
      <rect x="4.2" y="13.6" width="2.6" height="2.4" rx="0.6" fill="currentColor" fillOpacity="0.4" />
      <rect x="25.2" y="13.6" width="2.6" height="2.4" rx="0.6" fill="currentColor" fillOpacity="0.4" />

      {/* 4. KAKI SIRIP PENDARATAN VERTIKAL (Vertical Landing Fin Legs dari Model 3D) */}
      <path d="M5.5 16 V22.8" strokeWidth="1.8" />
      <circle cx="5.5" cy="23.2" r="0.9" fill="currentColor" stroke="none" />

      <path d="M26.5 16 V22.8" strokeWidth="1.8" />
      <circle cx="26.5" cy="23.2" r="0.9" fill="currentColor" stroke="none" />

      {/* 5. LENGAN X-FRAME KARBON */}
      <path d="M5.5 14.8 L12.5 15.2" strokeWidth="1.8" />
      <path d="M26.5 14.8 L19.5 15.2" strokeWidth="1.8" />

      {/* 6. BODI UTAMA KANOPI HELMET DOME (Sesuai 3D FPV Model) */}
      <path
        d="M11.8 15.4 C11.8 12.5 13.6 11.5 16 11.5 C18.4 11.5 20.2 12.5 20.2 15.4 C20.2 17.0 18.5 17.8 16 17.8 C13.5 17.8 11.8 17.0 11.8 15.4 Z"
        fill="currentColor"
        fillOpacity="0.3"
        strokeWidth="1.5"
      />
      {/* Top Air Intake Vent Seam */}
      <path d="M14.2 13.2 H17.8" strokeWidth="1.2" />

      {/* 7. KAMERA FPV NOSE GIMBAL & LENSA SENTRAL */}
      <rect x="14" y="15.6" width="4" height="3.4" rx="0.9" fill="currentColor" fillOpacity="0.5" strokeWidth="1.2" />
      <circle cx="16" cy="17.3" r="1.15" fill="currentColor" stroke="none" />

      {/* 8. LAMPU SENTER BAWAH (Underbelly Tactical Searchlight) */}
      <path d="M14.8 19.2 H17.2 L16.8 21.2 H15.2 Z" fill="currentColor" strokeWidth="0.8" />
      <circle cx="16" cy="22.2" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
};

export default DroneAlertIcon;
