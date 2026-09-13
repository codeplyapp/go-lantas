import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Gamepad2, MapPin, Sparkles, Flame, 
  ChevronRight, AlertTriangle, ArrowUpRight, BellRing, HeartHandshake, Compass
} from 'lucide-react';
import { MockDB } from '../../core/db';
import { UserProfile, UserRole } from '../../core/types';
import { TabType } from '../../shared/components/BottomNavBar';
import { sound } from '../../shared/services/sound';
import { BANYUWANGI_HOTSPOTS, BANYUWANGI_INCIDENTS } from '../../data/banyuwangi_traffic';
import { SIMULATED_ACCIDENT_REPORTS } from '../../data/accidents';
import { NotificationService } from '../../shared/services/notification';
import { MASCOT_CONFIG } from '../../core/mascot';

interface BerandaViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenRobotChat: (initialPrompt?: string) => void;
  onOpenPersonaModal: () => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({ 
  onNavigateTab, 
  onOpenRobotChat,
  onOpenPersonaModal 
}) => {
  const [user, setUser] = useState<UserProfile>(MockDB.getCurrentUser());

  useEffect(() => {
    const handleUpdate = () => {
      setUser(MockDB.getCurrentUser());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  const latestAccident = SIMULATED_ACCIDENT_REPORTS[0];
  const primaryHotspot = BANYUWANGI_HOTSPOTS[0];

  const handleTestNotification = () => {
    sound.playClick();
    NotificationService.sendNotification(
      '🎒 Pengingat Berangkat Sekolah Aman',
      'Pastikan tali helm berbunyi "KLIK"! Periksa kelengkapan STNK & SIM Anda sebelum menyalakan motor.'
    );
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Hero Persona Card */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-4.5 border border-blue-500/30">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-0.5 shadow-md">
                <img 
                  src={user.avatar_url} 
                  alt={user.nama} 
                  className="w-full h-full rounded-[14px] bg-slate-900 object-cover" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-heading font-extrabold text-white">
                    {user.nama}
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {user.sekolah_kampus}
                </p>
                {user.kelas_jurusan && (
                  <p className="text-[10px] text-slate-400">
                    {user.kelas_jurusan}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenPersonaModal}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/50 hover:bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-all flex items-center gap-1"
            >
              Ganti
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="text-xs font-extrabold">{user.streak_hari} Hari</span>
              </div>
              <p className="text-[10px] text-slate-400">Streak Kuis</p>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-extrabold">{user.poin_total} Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Total Poin</p>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-xs font-extrabold">
                  {user.total_jawaban > 0 ? Math.round((user.jawaban_benar / user.total_jawaban) * 100) : 100}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Akurasi SIM</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action Quick Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Play Quiz CTA */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('kuis');
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900/40 via-blue-950/50 to-slate-900 border border-blue-500/30 hover:border-blue-400 cursor-pointer group transition-all duration-300 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              +20 Poin
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
              Kuis SIM Harian
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tantangan rambu & etika berkendara
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-blue-400">
            <span>Mulai Kuis</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* SOS Emergency Button Direct Link */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('sos');
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/50 via-red-950/30 to-slate-900 border border-rose-500/40 hover:border-rose-400 cursor-pointer group transition-all duration-300 shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
              110 POLRI
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
              Darurat SOS 110
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tahan 3 detik & kirim GPS instan
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-rose-400">
            <span>Buka SOS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. AI Mascot Assistant Card */}
      <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div 
            onClick={() => onOpenRobotChat()}
            className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-0.5 shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1">
              <img 
                src={MASCOT_CONFIG.avatarUrl} 
                alt={MASCOT_CONFIG.name} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">
                {MASCOT_CONFIG.name}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Korlantas
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Tanya rute Banyuwangi bebas macet, pasal hukum lalu lintas, atau info kecelakaan.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
          <button
            onClick={() => onOpenRobotChat('Bagaimana kondisi macet di Jalan Gajah Mada Banyuwangi saat ini?')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 transition-colors"
          >
            🚦 Macet di Gajah Mada?
          </button>
          <button
            onClick={() => onOpenRobotChat('Rekomendasikan rute aman ke sekolah bagi pelajar Banyuwangi')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-500/30 text-blue-300 hover:bg-blue-950 transition-colors"
          >
            🛵 Rute aman ke sekolah?
          </button>
          <button
            onClick={() => onOpenRobotChat('Jelaskan tugas pokok Korlantas Polri dan peran Polantas bagi pelajar')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-950 transition-colors"
          >
            👮 Apa itu Korlantas Polri?
          </button>
        </div>
      </div>

      {/* 4. Traffic & Incident Live Snapshot (Banyuwangi) */}
      <div className="p-4 rounded-2xl glass-card border border-blue-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Pantauan Lalu Lintas Banyuwangi
              </h3>
              <p className="text-[10px] text-slate-400">
                Pusat Kota & Jalur Utama Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onNavigateTab('peta');
            }}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
          >
            Peta Lengkap
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hotspot Card */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">{primaryHotspot.nama_jalan}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {primaryHotspot.level_kemacetan.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {primaryHotspot.penyebab}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 pt-1">
            <Compass className="w-3 h-3" />
            Saran: {primaryHotspot.saran_rute}
          </p>
        </div>

        {/* Recent Simulated Accident Insight for Education */}
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulasi Evaluasi Laka Lantas</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">
              {latestAccident.waktu_kejadian}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            {latestAccident.lokasi}: {latestAccident.kronologi_singkat}
          </p>
          <p className="text-[11px] text-amber-300/90 font-medium pt-0.5">
            💡 <strong>Pencegahan</strong>: {latestAccident.edukasi_pencegahan}
          </p>
        </div>
      </div>

      {/* 5. Quick Notification Tester */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-blue-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Notifikasi Pengingat Kontekstual</h4>
            <p className="text-[10px] text-slate-400">Simulasikan pengingat helm & jam berangkat</p>
          </div>
        </div>
        <button
          onClick={handleTestNotification}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow transition-all shrink-0 active:scale-95"
        >
          Tes Notif
        </button>
      </div>
    </div>
  );
};
