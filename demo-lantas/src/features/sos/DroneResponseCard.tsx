import React, { Suspense, useState, useEffect } from 'react';
import { 
  Radio, 
  Crosshair, 
  Wifi, 
  BatteryCharging, 
  Gauge, 
  Video, 
  Navigation,
  ShieldCheck,
  Zap,
  Eye
} from 'lucide-react';
import { DroneStatus, GeoPoint } from '../../core/types';

// Lazy load Drone3D to ensure Three.js chunk (~600KB) is only downloaded when SOS is accessed
const Drone3D = React.lazy(() => import('./components/Drone3D'));

// Shimmer skeleton pulse fallback while Three.js initializes
const DroneSkeleton: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/70 animate-pulse rounded-2xl p-4 text-center">
    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-2">
      <Radio className="w-8 h-8 text-[#0077C0] animate-bounce" />
    </div>
    <span className="text-xs font-bold text-slate-600">
      Menginisialisasi Simulasi 3D DFR...
    </span>
    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
      WebGL • WebGL2 Engine
    </span>
  </div>
);

export interface DroneResponseCardProps {
  droneStatus: DroneStatus;
  targetLocation?: GeoPoint | null;
}

export const DroneResponseCard: React.FC<DroneResponseCardProps> = ({ 
  droneStatus,
  targetLocation 
}) => {
  // Live flight telemetry simulation
  const [etaSeconds, setEtaSeconds] = useState<number>(48);
  const [distanceMeters, setDistanceMeters] = useState<number>(680);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (droneStatus === 'flying') {
      setEtaSeconds(48);
      setDistanceMeters(680);
      interval = setInterval(() => {
        setEtaSeconds((prev) => Math.max(prev - 2, 3));
        setDistanceMeters((prev) => Math.max(prev - 30, 25));
      }, 1000);
    } else if (droneStatus === 'on_scene') {
      setEtaSeconds(0);
      setDistanceMeters(0);
    } else {
      setEtaSeconds(48);
      setDistanceMeters(680);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [droneStatus]);

  // Compute status badge labels and styling (Minimal & Elegant live indicator)
  const getStatusBadge = () => {
    switch (droneStatus) {
      case 'arming':
        return {
          label: 'MEMARKIR & LUNCUR',
          textColor: 'text-amber-600',
          dotBg: 'bg-amber-500',
        };
      case 'flying':
        return {
          label: 'MENUJU LOKASI',
          textColor: 'text-rose-600',
          dotBg: 'bg-rose-600',
        };
      case 'on_scene':
        return {
          label: 'PATROLI TKP',
          textColor: 'text-emerald-600',
          dotBg: 'bg-emerald-600',
        };
      case 'standby':
      default:
        return {
          label: 'SIAP SIAGA (STANDBY)',
          textColor: 'text-[#0077C0]',
          dotBg: 'bg-[#0077C0]',
        };
    }
  };

  const badge = getStatusBadge();

  // Dynamic Altitude & Speed display
  const getAltitude = () => {
    switch (droneStatus) {
      case 'arming': return '↑ 2.5 m (Lepas Landas)';
      case 'flying': return '↑ 38 m (Jalur Cepat)';
      case 'on_scene': return '◉ 22 m (Hover TKP)';
      case 'standby': default: return '0 m (Pad Polsek)';
    }
  };

  const getSpeed = () => {
    switch (droneStatus) {
      case 'arming': return '12 km/h';
      case 'flying': return '68 km/h';
      case 'on_scene': return '3 km/h (Loiter)';
      case 'standby': default: return '0 km/h';
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white border border-[#E5EBE8] shadow-xs space-y-4 relative overflow-hidden">
      {/* Background ambient accent radar glow when in emergency states */}
      {droneStatus === 'flying' && (
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
      )}
      {droneStatus === 'on_scene' && (
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header: Clean, Spacious, No nested card pill boxes */}
      <div className="space-y-1 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#0077C0] shrink-0" />
            <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
              Unit Drone SIKAP-01
            </h3>
          </div>

          {/* Minimal Live Status Indicator */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dotBg}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dotBg}`} />
            </span>
            <span className={`text-[11px] sm:text-xs font-extrabold tracking-wide uppercase ${badge.textColor}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium pl-7">
          DFR Korlantas Polri • Respon Pertama Sebelum Petugas Tiba
        </p>
      </div>

      {/* 2-Column Responsive Layout: Left 3D Canvas / Right Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* LEFT: 3D WebGL Canvas Viewport */}
        <div className="md:col-span-5 relative w-full h-48 sm:h-52 rounded-2xl bg-gradient-to-b from-slate-900/[0.02] via-slate-900/[0.04] to-[#0077C0]/[0.06] border border-slate-200/80 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Tactical HUD Overlay Markers */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-slate-600 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200/70 select-none z-10 shadow-2xs">
            <Crosshair className="w-3 h-3 text-[#0077C0]" />
            <span>SIKAP-DFR // LIVE 3D</span>
          </div>

          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/85 backdrop-blur-xs text-slate-700 border border-slate-200/70 select-none z-10 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            60 FPS
          </div>

          {/* Suspense 3D Drone Instance */}
          <Suspense fallback={<DroneSkeleton />}>
            <Drone3D status={droneStatus} />
          </Suspense>

          {/* Bottom HUD bar */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 select-none z-10 shadow-2xs">
            <span className="truncate font-semibold text-slate-800">
              {droneStatus === 'flying'
                ? `ETA: ${etaSeconds}s • Jarak: ${distanceMeters}m`
                : droneStatus === 'on_scene'
                ? 'OVERWATCH TKP AKTIF'
                : 'PANGKALAN: ATAP POLSEK KOTA'}
            </span>
            <span className="font-extrabold text-[#0077C0] text-[9px] bg-[#0077C0]/10 px-1.5 py-0.5 rounded shrink-0 ml-1.5">
              AUTONOMI DFR
            </span>
          </div>
        </div>

        {/* RIGHT: Telemetry & Mission Brief (No nested cards!) */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Mission Briefing with Accent Left Border - No nested card box */}
          <div className="border-l-2 border-[#0077C0] pl-3 py-1 text-xs text-slate-600 leading-relaxed">
            {droneStatus === 'standby' && (
              <p>
                <strong className="font-bold text-slate-900">Moda Siaga:</strong> Drone DFR berpusat di atap Polsek terdekat, siap meluncur secara otonom dalam 5 detik saat tombol SOS ditekan.
              </p>
            )}
            {droneStatus === 'arming' && (
              <p className="text-amber-900">
                <strong className="font-bold text-amber-950">Persiapan Lepas Landas:</strong> Motor RPM dipercepat, koordinat GPS laporan dikunci ke autopilot navigasi drone.
              </p>
            )}
            {droneStatus === 'flying' && (
              <p className="text-rose-900">
                <strong className="font-bold text-rose-950">Meluncur Menuju TKP:</strong> Drone terbang 68 km/h menuju titik laporan {targetLocation ? `[${targetLocation.latitude.toFixed(4)}, ${targetLocation.longitude.toFixed(4)}]` : 'Banyuwangi Kota'}. Tiba dalam ±{etaSeconds} detik.
              </p>
            )}
            {droneStatus === 'on_scene' && (
              <p className="text-emerald-900">
                <strong className="font-bold text-emerald-950">Drone Tiba di TKP:</strong> Melakukan asesmen udara visual 360°, mendeteksi keparahan laka, dan menyiarkan feed langsung ke mobil patroli terdekat.
              </p>
            )}
          </div>

          {/* Divided Telemetry List - Clean & Seamless, No Nested Cards */}
          <div className="divide-y divide-slate-100 text-xs pt-1">
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Gauge className="w-3.5 h-3.5 text-[#0077C0]" />
                <span>Ketinggian</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{getAltitude()}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Navigation className="w-3.5 h-3.5 text-[#0077C0]" />
                <span>Kecepatan</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{getSpeed()}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Video className="w-3.5 h-3.5 text-[#0077C0]" />
                <span>Sensor Optik</span>
              </div>
              <span className="font-mono font-bold text-slate-900">4K UHD + FLIR</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sinyal & Daya</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                <span className="text-emerald-700">RTK 99%</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center text-slate-800">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
                  98%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneResponseCard;
