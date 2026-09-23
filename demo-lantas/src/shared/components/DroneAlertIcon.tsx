import React from 'react';

interface DroneAlertIconProps {
  className?: string;
}

/**
 * Custom Solid SVG Icon: Tactical DFR FPV Drone (100% Identical to 3D Viewport Model)
 * Features:
 * - Crisp solid Emergency Exclamation Mark (!) prominently positioned above the canopy
 * - Aerodynamic helmet dome canopy with intake ventilation seam
 * - Front nose FPV gimbal camera housing with optical sapphire lens
 * - Tactical underbelly searchlight (lampu senter) with downward projection
 * - Symmetrical X-frame carbon arms with dual brushless motor bells
 * - Dual spinning airfoil tri-blade rotor lines
 * - Vertical landing fin legs extending straight down from under the motor pods
 */
export const DroneAlertIcon: React.FC<DroneAlertIconProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ========================================================= */}
      {/* 1. TANDA SERU (!) SOLID & TEGAS DI ATAS DRONE            */}
      {/* ========================================================= */}
      {/* Batang vertikal tanda seru */}
      <rect
        x="14.6"
        y="1.5"
        width="2.8"
        height="5.2"
        rx="1.4"
        fill="currentColor"
      />
      {/* Titik bulat tanda seru */}
      <circle
        cx="16"
        cy="9.0"
        r="1.4"
        fill="currentColor"
      />

      {/* ========================================================= */}
      {/* 2. BALING-BALING KIRI & KANAN (Airfoil Rotors)           */}
      {/* ========================================================= */}
      {/* Rotor Kiri */}
      <path
        d="M1.2 12.8 C3.0 11.6 8.2 11.6 10.0 12.8 C8.2 13.7 3.0 13.7 1.2 12.8 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {/* Rotor Kanan */}
      <path
        d="M22.0 12.8 C23.8 11.6 29.0 11.6 30.8 12.8 C29.0 13.7 23.8 13.7 22.0 12.8 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />

      {/* ========================================================= */}
      {/* 3. MOTOR PODS (Brushless Motor Bells)                     */}
      {/* ========================================================= */}
      <rect
        x="4.2"
        y="13.0"
        width="2.8"
        height="2.4"
        rx="0.7"
        fill="currentColor"
      />
      <rect
        x="25.0"
        y="13.0"
        width="2.8"
        height="2.4"
        rx="0.7"
        fill="currentColor"
      />

      {/* ========================================================= */}
      {/* 4. LENGAN X-FRAME KARBON (Menghubungkan Bodi ke Motor)   */}
      {/* ========================================================= */}
      <path
        d="M5.6 14.2 L12.5 15.0"
        stroke="currentColor"
        strokeWidth="2.0"
        strokeLinecap="round"
      />
      <path
        d="M26.4 14.2 L19.5 15.0"
        stroke="currentColor"
        strokeWidth="2.0"
        strokeLinecap="round"
      />

      {/* ========================================================= */}
      {/* 5. KAKI SIRIP PENDARATAN VERTIKAL (Di Bawah Setiap Motor) */}
      {/* ========================================================= */}
      {/* Kaki Kiri */}
      <path
        d="M5.6 15.4 V22.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="5.6"
        cy="23.2"
        r="1.0"
        fill="currentColor"
      />

      {/* Kaki Kanan */}
      <path
        d="M26.4 15.4 V22.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="26.4"
        cy="23.2"
        r="1.0"
        fill="currentColor"
      />

      {/* ========================================================= */}
      {/* 6. BODI UTAMA KANOPI HELMET DOME (Sesuai Model 3D)        */}
      {/* ========================================================= */}
      <path
        d="M11.6 15.8 C11.6 12.0 13.5 11.0 16 11.0 C18.5 11.0 20.4 12.0 20.4 15.8 C20.4 17.6 18.6 18.5 16 18.5 C13.4 18.5 11.6 17.6 11.6 15.8 Z"
        fill="currentColor"
        fillOpacity="0.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Top Air Intake Vent Seam */}
      <path
        d="M14.2 12.8 H17.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* ========================================================= */}
      {/* 7. KAMERA FPV NOSE GIMBAL & LENSA OPTIK                   */}
      {/* ========================================================= */}
      <rect
        x="13.7"
        y="15.4"
        width="4.6"
        height="3.8"
        rx="1.1"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle
        cx="16"
        cy="17.3"
        r="1.2"
        fill="#DC2626"
      />
      <circle
        cx="16"
        cy="17.3"
        r="0.55"
        fill="white"
      />

      {/* ========================================================= */}
      {/* 8. LAMPU SENTER BAWAH (Underbelly Tactical Searchlight)    */}
      {/* ========================================================= */}
      {/* Dudukan senter */}
      <path
        d="M14.6 19.2 H17.4 L17.0 21.8 H15.0 Z"
        fill="currentColor"
      />
      {/* Lensa pemancar cahaya senter */}
      <circle
        cx="16"
        cy="22.6"
        r="0.9"
        fill="currentColor"
      />
      {/* Berkas cahaya senter ke bawah (Subtle beam cone) */}
      <path
        d="M14.0 24.2 L16 23.2 L18.0 24.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DroneAlertIcon;
