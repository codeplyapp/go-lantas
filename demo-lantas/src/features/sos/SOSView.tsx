import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, PhoneCall, MapPin, Copy, Check, 
  AlertTriangle, History, Info, Compass, Shield, Clock, BellRing
} from 'lucide-react';
import { SOSAlert, GeoPoint, DroneStatus } from '../../core/types';
import { LocationService } from '../../shared/services/location';
import { firestoreService } from '../../services/firestore';
import { authService } from '../../services/auth';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';
import { DroneResponseCard } from './DroneResponseCard';

export const SOSView: React.FC = () => {
  const [holding, setHolding] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<SOSAlert | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [droneStatus, setDroneStatus] = useState<DroneStatus>('standby');

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const droneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (droneTimerRef.current) clearTimeout(droneTimerRef.current);
    };
  }, []);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
    setDroneStatus('arming');
    sound.playSOSPulse();

    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= duration) {
        triggerEmergencySOS();
      }
    }, 50);
  };

  const cancelHold = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setHolding(false);
    setProgress(0);
    setDroneStatus((prev) => (prev === 'arming' ? 'standby' : prev));
  };

  // NOTE: Firebase Spark limitation: Sinyal darurat disiarkan via Firestore onSnapshot
  // dan diterima seketika oleh perangkat keluarga/petugas yang sedang aktif/membuka aplikasi.
  const triggerEmergencySOS = async () => {
    cancelHold();
    setLocating(true);
    sound.playLevelUp();

    setDroneStatus('flying');
    if (droneTimerRef.current) clearTimeout(droneTimerRef.current);
    droneTimerRef.current = setTimeout(() => {
      setDroneStatus('on_scene');
    }, 7500);

    const location: GeoPoint = await LocationService.getCurrentPosition();
    setLocating(false);

    const currentUser = authService.getCurrentUser();
    const newAlert: SOSAlert = {
      id: `sos_${Date.now()}`,
      uid: currentUser?.uid || 'user',
      nama_pelapor: currentUser?.displayName || 'Pengguna GO Lantas',
      peran: 'pelajar',
      sekolah_kampus: 'Banyuwangi',
      waktu: new Date().toISOString(),
      status: 'terkirim',
      lokasi: location,
      catatan: 'Panggilan Darurat Laka dipicu via Tombol SOS GO Lantas.',
    };

    // Save to Firestore
    firestoreService.saveSOSAlert(newAlert);

    setSosAlerts(prev => [newAlert, ...prev]);
    setActiveEmergencyAlert(newAlert);

    NotificationService.showInAppToast(
      '🚨 Sinyal Darurat 110 Terkirim!',
      `Koordinat GPS [${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}] tercatat di Command Center Polri.`,
      'emergency'
    );
  };

  const handleCopyCoordinates = (location?: GeoPoint) => {
    sound.playClick();
    if (!location) return;
    const altText = location.altitude ? ` | Alt: ${location.altitude} mdpl` : '';
    const text = `DARURAT KORLANTAS GO LANTAS: Lokasi [${location.latitude}, ${location.longitude}] (${location.alamat_perkiraan || 'Banyuwangi'})${altText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-4 animate-fadeIn">
      {/* 1. Header Card */}
      <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white border-rose-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                Layanan Darurat 110 Korlantas
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                SIAGA 24 JAM
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
              Akses cepat bantuan kepolisian & evakuasi medis laka lantas bebas pulsa.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 3D Drone as First Responder (DFR) Telemetry Card */}
      <DroneResponseCard 
        droneStatus={droneStatus} 
        targetLocation={activeEmergencyAlert?.lokasi} 
      />

      {/* Spark Real-Time Disclaimer */}
      <div className="p-3.5 sm:p-4 rounded-[14px] bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong className="font-extrabold text-amber-950">Catatan Notifikasi Real-Time:</strong> Sinyal darurat disiarkan secara langsung dan instan. Anggota keluarga perlu membuka aplikasi untuk menerima pembaruan status dan koordinat GPS darurat secara instan.
        </p>
      </div>

      {/* 3. 2-Grid Action Hub: Countdown Radar on Left & Telemetry/Instructions on Right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Circular SOS Countdown Container */}
        <div className="p-6 rounded-[16px] apple-card bg-white border-rose-200 text-center space-y-3.5 flex flex-col items-center justify-center shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest">
              {holding ? 'TAHAN JANGAN DILEPAS...' : 'TEKAN & TAHAN 3 DETIK'}
            </span>
            <p className="text-xs text-slate-600 max-w-xs font-medium">
              Sistem anti-salah-pencet untuk memastikan validitas laporan.
            </p>
          </div>

          {/* Circular SVG Button */}
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#dc2626"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-75"
              />
            </svg>

            <button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              disabled={locating}
              className={`absolute w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all select-none btn-press ${
                holding
                  ? 'bg-red-700 scale-95 ring-4 ring-rose-400'
                  : 'bg-red-600 hover:bg-red-500 hover:scale-105 shadow-rose-600/40'
              }`}
            >
              <ShieldAlert className="w-8 h-8 text-white mb-0.5" />
              <span className="text-xs font-extrabold text-white tracking-wider">
                {holding ? `${Math.ceil((100 - progress) / 33.3)}s` : 'SOS 110'}
              </span>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="text-center pt-0.5">
            {holding ? (
              <p className="text-xs font-bold text-amber-800 animate-pulse">
                Memverifikasi sinyal darurat ({Math.round(progress)}%)...
              </p>
            ) : locating ? (
              <p className="text-xs font-bold text-[#0077C0]">
                Mengunci koordinat satelit GPS...
              </p>
            ) : (
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5 font-semibold">
                <Info className="w-4 h-4 text-slate-500" />
                Sentuh & tahan lingkaran merah
              </p>
            )}
          </div>
        </div>

        {/* Right: Telemetry & Quick Action Details */}
        <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white border-[#0077C0]/20 flex flex-col justify-between space-y-3.5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#0F172A]">
              <Compass className="w-4.5 h-4.5 text-[#0077C0]" />
              <h3 className="text-sm font-extrabold tracking-apple-tight">
                Telemetri GPS & Saluran Cepat
              </h3>
            </div>

            {/* Divided Inset List for Telemetry - No Nested Cards */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Titik Referensi</span>
                <span className="font-extrabold text-slate-900">Banyuwangi Kota</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Koordinat GPS</span>
                <span className="font-mono font-bold text-emerald-800">-8.2215°, 114.3646°</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Elevasi</span>
                <span className="font-mono font-bold text-[#0077C0]">±16 mdpl</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
              <Shield className="w-4 h-4 text-[#0077c0] mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                <strong className="text-slate-900">Prosedur Darurat:</strong> Tetap tenang, amankan diri di bahu jalan, dan sebutkan patokan lokasi terdekat kepada petugas 110.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href="tel:110"
              className="flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all btn-press"
            >
              <PhoneCall className="w-4 h-4" />
              Telepon 110
            </a>

            <button
              onClick={() => handleCopyCoordinates(activeEmergencyAlert?.lokasi || { latitude: -8.2215, longitude: 114.3646, altitude: 16, alamat_perkiraan: 'Taman Blambangan, Banyuwangi' })}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-2 transition-all btn-press"
            >
              {copied ? <Check className="w-4 h-4 text-[#0077c0]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin' : 'Salin GPS'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Emergency Dialog Triggered Card (When active) */}
      {activeEmergencyAlert && (
        <div className="p-5 sm:p-6 rounded-[16px] bg-rose-50 border border-rose-300 shadow-lg space-y-3.5 animate-scaleUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-800">
              <AlertTriangle className="w-5.5 h-5.5 text-rose-600 animate-bounce" />
              <h3 className="text-sm sm:text-base font-extrabold text-rose-950 tracking-apple-tight">
                Sinyal Darurat 110 Aktif!
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              TERKIRIM
            </span>
          </div>

          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
            Koordinat lokasi Anda telah tercatat otomatis di pangkalan data Command Center Korlantas Polri.
          </p>

          <div className="pt-3 border-t border-rose-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-2 text-rose-950">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-extrabold">
                {activeEmergencyAlert.lokasi.alamat_perkiraan || 'Banyuwangi Kota'}
              </span>
            </div>
            <p className="text-xs text-rose-800 font-mono font-medium pl-6">
              GPS: {activeEmergencyAlert.lokasi.latitude.toFixed(4)}° LS, {activeEmergencyAlert.lokasi.longitude.toFixed(4)}° BT
              {activeEmergencyAlert.lokasi.altitude ? ` • Alt: ±${activeEmergencyAlert.lokasi.altitude} mdpl` : ''} (Akurasi ~{activeEmergencyAlert.lokasi.accuracy || 5}m)
            </p>
          </div>
        </div>
      )}

      {/* 4. SOS History Log in 2-Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="gowapit-section-label flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#0077C0]" />
            Riwayat Log Panggilan Darurat
          </span>
          <span className="text-[11px] text-slate-600 font-bold">
            {sosAlerts.length} Laporan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sosAlerts.map((alert) => {
            const isDelivered = alert.status === 'terkirim';
            const isHandled = alert.status === 'ditangani' || alert.status === 'selesai';

            return (
              <div
                key={alert.id}
                className="p-4 rounded-[18px] apple-card bg-white border border-[#E5EBE8] space-y-3 shadow-xs hover:border-[#0077c0]/40 transition-all flex flex-col justify-between"
              >
                {/* Header: Nama Pelapor + Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] tracking-tight leading-snug">
                      {alert.nama_pelapor}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {alert.sekolah_kampus}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border shrink-0 capitalize ${
                    isHandled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDelivered
                      ? 'bg-blue-50 text-[#0077C0] border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isHandled ? 'bg-emerald-500' : isDelivered ? 'bg-[#0077C0]' : 'bg-amber-500'
                    }`} />
                    {alert.status}
                  </span>
                </div>

                {/* Body: Detail Lokasi & Waktu */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#0077c0] shrink-0 mt-0.5" />
                    <span className="text-[11.5px] font-semibold leading-snug">
                      {alert.lokasi.alamat_perkiraan || 'Area Sekitar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{alert.waktu}</span>
                  </div>
                </div>

                {/* Catatan Tindak Lanjut */}
                {alert.catatan && (
                  <p className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium leading-relaxed">
                    {alert.catatan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

