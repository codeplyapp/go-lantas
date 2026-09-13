import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, PhoneCall, MapPin, Copy, Check, 
  AlertTriangle, History, Info, Sparkles 
} from 'lucide-react';
import { MockDB } from '../../core/db';
import { SOSAlert, GeoPoint } from '../../core/types';
import { LocationService } from '../../shared/services/location';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

export const SOSView: React.FC = () => {
  const [holding, setHolding] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(MockDB.getSOSAlerts());
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<SOSAlert | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSosAlerts(MockDB.getSOSAlerts());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  const startHold = () => {
    setHolding(true);
    setProgress(0);
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
  };

  const triggerEmergencySOS = async () => {
    cancelHold();
    setLocating(true);
    sound.playLevelUp();

    // 1. Fetch Real GPS Position
    const location: GeoPoint = await LocationService.getCurrentPosition();
    setLocating(false);

    // 2. Save SOS to Database
    const newAlert = MockDB.createSOSAlert(location, 'Panggilan Darurat Laka dipicu via Tombol SOS SIGAP.');
    setActiveEmergencyAlert(newAlert);

    // 3. Dispatch Toast Alert
    NotificationService.showInAppToast(
      '🚨 Sinyal Darurat 110 Terkirim!',
      `Koordinat GPS [${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}] tercatat di Command Center Polri.`,
      'emergency'
    );
  };

  const handleCopyCoordinates = (location?: GeoPoint) => {
    sound.playClick();
    if (!location) return;
    const text = `DARURAT KORLANTAS SIGAP: Lokasi [${location.latitude}, ${location.longitude}] (${location.alamat_perkiraan || 'Banyuwangi'})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-2xl glass-card border border-rose-500/40 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-heading font-extrabold text-white">
                Layanan Darurat 110 Korlantas
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                SIAGA 24 JAM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Akses cepat bantuan kepolisian & ambulans laka lantas tanpa pulsa.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SOS Big Push Button Container */}
      <div className="p-6 rounded-3xl glass-card border border-rose-500/30 text-center space-y-4 flex flex-col items-center justify-center">
        <div className="space-y-1">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
            {holding ? 'TAHAN JANGAN DILEPAS...' : 'TEKAN & TAHAN 3 DETIK'}
          </span>
          <p className="text-[11px] text-slate-400">
            Sistem anti-salah-pencet untuk menjamin validitas laporan kepolisian.
          </p>
        </div>

        {/* Circular SVG Button with Progress Ring */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="88"
              cy="88"
              r="76"
              stroke="#1e293b"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="88"
              cy="88"
              r="76"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 76}
              strokeDashoffset={2 * Math.PI * 76 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75"
            />
          </svg>

          {/* Actual Touch/Click Button */}
          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            disabled={locating}
            className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all select-none ${
              holding
                ? 'bg-red-700 scale-95 shadow-red-900/80 ring-4 ring-rose-400'
                : 'bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 hover:scale-105 shadow-rose-600/50'
            }`}
          >
            <ShieldAlert className="w-10 h-10 text-white mb-1" />
            <span className="text-xs font-black text-white tracking-wider">
              {holding ? `${Math.ceil((100 - progress) / 33.3)}s` : 'SOS 110'}
            </span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="text-center pt-2">
          {holding ? (
            <p className="text-xs font-extrabold text-amber-400 animate-pulse">
              Sedang memverifikasi sinyal darurat ({Math.round(progress)}%)...
            </p>
          ) : locating ? (
            <p className="text-xs font-bold text-blue-400">
              Mengunci koordinat satelit GPS...
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Sentuh & tahan lingkaran merah untuk memicu panggilan darurat.
            </p>
          )}
        </div>
      </div>

      {/* 3. Emergency Dialog Modal upon Triggered */}
      {activeEmergencyAlert && (
        <div className="p-4.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500/80 shadow-2xl space-y-3 animate-scaleUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                Sinyal Darurat 110 Aktif!
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
              TERKIRIM
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            Koordinat lokasi Anda telah tercatat otomatis di pangkalan data <code className="text-amber-300">sos_alerts</code> Korlantas.
          </p>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold text-white">
                {activeEmergencyAlert.lokasi.alamat_perkiraan || 'Banyuwangi Kota'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              GPS: {activeEmergencyAlert.lokasi.latitude.toFixed(5)}, {activeEmergencyAlert.lokasi.longitude.toFixed(5)} (Akurasi ~{activeEmergencyAlert.lokasi.accuracy || 10}m)
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            {/* Call 110 Dialer */}
            <a
              href="tel:110"
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              Telepon 110
            </a>

            {/* Copy Coordinates */}
            <button
              onClick={() => handleCopyCoordinates(activeEmergencyAlert.lokasi)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin' : 'Salin GPS'}
            </button>
          </div>
        </div>
      )}

      {/* 4. SOS History Log */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400" />
            Riwayat Log Panggilan Darurat (sos_alerts)
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {sosAlerts.length} Laporan
          </span>
        </div>

        <div className="space-y-2">
          {sosAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{alert.nama_pelapor} ({alert.sekolah_kampus})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                  {alert.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{alert.lokasi.alamat_perkiraan || 'Banyuwangi'}</span>
                <span className="text-slate-600">•</span>
                <span>{alert.waktu}</span>
              </div>
              {alert.catatan && (
                <p className="text-[11px] text-slate-400 italic pt-0.5 border-t border-slate-800/60">
                  {alert.catatan}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
