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

  // Compute status badge labels and styling
  const getStatusBadge = () => {
    switch (droneStatus) {
      case 'arming':
        return {
          label: 'MEMARKIR & LUNCUR',
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          dot: 'bg-amber-500 animate-ping',
          icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'flying':
        return {
          label: 'MENUJU LOKASI (EN ROUTE)',
          bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          dot: 'bg-rose-600 animate-pulse',
          icon: <Navigation className="w-3.5 h-3.5 text-rose-600 animate-spin" />,
        };
      case 'on_scene':
        return {
          label: 'DI TKP (PATROLI UDARA)',
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          dot: 'bg-emerald-600 animate-pulse',
          icon: <Eye className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'standby':
      default:
        return {
          label: 'SIAP SIAGA (STANDBY)',
          bg: 'bg-[#0077C0]/10 text-[#0077C0] border-[#0077C0]/30',
          dot: 'bg-[#0077C0] animate-pulse',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0077C0]" />,
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

      {/* Header Row: Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0077C0]/10 text-[#0077C0] border border-[#0077C0]/20 shrink-0">
            <Radio className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                Unit Drone SIKAP-01
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                DFR KORLANTAS
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 font-medium">
              Respon Pertama sebelum petugas tiba di lokasi.
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border shadow-2xs ${badge.bg}`}>
            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left 3D Canvas / Right Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* LEFT: 3D WebGL Canvas Viewport */}
        <div className="md:col-span-5 relative w-full h-48 sm:h-52 rounded-2xl bg-gradient-to-b from-slate-900/[0.02] via-slate-900/[0.04] to-[#0077C0]/[0.06] border border-slate-200/80 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Tactical HUD Overlay Markers */}
          <div className="absolute top-2 left-2.5 flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-slate-500 select-none z-10">
            <Crosshair className="w-3 h-3 text-[#0077C0]" />
            <span>SIKAP-DFR // LIVE 3D</span>
          </div>

          <div className="absolute top-2 right-2.5 flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-xs text-slate-700 border border-slate-200 select-none z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            60 FPS
          </div>

          {/* Suspense 3D Drone Instance */}
          <Suspense fallback={<DroneSkeleton />}>
            <Drone3D status={droneStatus} />
          </Suspense>

          {/* Bottom HUD bar */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-600 bg-white/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/60 select-none z-10">
            <span className="truncate font-semibold text-slate-700">
              {droneStatus === 'flying'
                ? `ETA: ${etaSeconds}s • Jarak: ${distanceMeters}m`
                : droneStatus === 'on_scene'
                ? 'OVERWATCH TKP AKTIF'
                : 'PANGKALAN: ATAP POLSEK KOTA'}
            </span>
            <span className="font-bold text-[#0077C0] shrink-0 ml-1">
              AUTONOMI DFR
            </span>
          </div>
        </div>

        {/* RIGHT: Telemetry & Mission Brief */}
        <div className="md:col-span-7 space-y-3">
          {/* Context Mission Banner */}
          <div className={`p-3 rounded-xl text-xs font-medium border leading-relaxed transition-all ${
            droneStatus === 'flying'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : droneStatus === 'on_scene'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : droneStatus === 'arming'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {droneStatus === 'standby' && (
              <p>
                <strong className="font-extrabold text-slate-900">Moda Standby:</strong> Drone DFR berpusat di atap Command Center terdekat, siap meluncur secara otonom dalam 5 detik saat tombol SOS ditekan.
              </p>
            )}
            {droneStatus === 'arming' && (
              <p className="animate-pulse">
                <strong className="font-extrabold text-amber-950">Persiapan Peluncuran:</strong> Motor RPM dipercepat, koordinat GPS laporan dikunci ke sistem navigasi LiDAR drone.
              </p>
            )}
            {droneStatus === 'flying' && (
              <p>
                <strong className="font-extrabold text-rose-950">Meluncur Menuju TKP:</strong> Drone sedang terbang dengan kecepatan 68 km/h menuju koordinat target {targetLocation ? `[${targetLocation.latitude.toFixed(4)}, ${targetLocation.longitude.toFixed(4)}]` : 'Banyuwangi Kota'}. Tiba dalam ±{etaSeconds} detik.
              </p>
            )}
            {droneStatus === 'on_scene' && (
              <p>
                <strong className="font-extrabold text-emerald-950">Drone Tiba di Atas TKP:</strong> Melakukan asesmen udara visual 360°, mendeteksi keparahan laka, dan menyiarkan feed langsung ke mobil patroli terdekat.
              </p>
            )}
          </div>

          {/* 4 Telemetry Inset Chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Alt */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Gauge className="w-3.5 h-3.5 text-[#0077C0]" />
                <span className="font-medium">Ketinggian</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {getAltitude()}
              </span>
            </div>

            {/* Speed */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Navigation className="w-3.5 h-3.5 text-[#0077C0]" />
                <span className="font-medium">Kecepatan</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {getSpeed()}
              </span>
            </div>

            {/* Sensor & Camera */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Video className="w-3.5 h-3.5 text-[#0077C0]" />
                <span className="font-medium">Kamera</span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-[11px]">
                4K UHD + FLIR
              </span>
            </div>

            {/* Link & Battery */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">RTK / Bat</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-[11px]">
                <span className="text-emerald-700">99%</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center text-slate-800">
                  <BatteryCharging className="w-3 h-3 text-emerald-600 mr-0.5" />
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
