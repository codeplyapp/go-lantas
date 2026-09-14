import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Gamepad2, MapPin, Sparkles, Flame, 
  ChevronRight, AlertTriangle, ArrowUpRight, BellRing, Compass
} from 'lucide-react';
import { MockDB } from '../../core/db';
import { UserProfile } from '../../core/types';
import { TabType } from '../../shared/components/BottomNavBar';
import { sound } from '../../shared/services/sound';
import { BANYUWANGI_HOTSPOTS } from '../../data/banyuwangi_traffic';
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
      <div className="relative overflow-hidden apple-card p-5">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0066cc] to-indigo-600 p-0.5 shadow-md">
                <img 
                  src={user.avatar_url} 
                  alt={user.nama} 
                  className="w-full h-full rounded-[14px] bg-[#060b18] object-cover" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-heading font-bold text-white tracking-apple-tight">
                    {user.nama}
                  </h1>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/25 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {user.sekolah_kampus}
                </p>
                {user.kelas_jurusan && (
                  <p className="text-[11px] text-slate-400">
                    {user.kelas_jurusan}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenPersonaModal}
              className="text-xs font-semibold text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all btn-press flex items-center gap-1"
            >
              Ganti
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="text-xs font-bold">{user.streak_hari} Hari</span>
              </div>
              <p className="text-[10px] text-slate-400">Streak Kuis</p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{user.poin_total} Poin</span>
              </div>
              <p className="text-[10px] text-slate-400">Total Poin</p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">
                  {user.total_jawaban > 0 ? Math.round((user.jawaban_benar / user.total_jawaban) * 100) : 100}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Akurasi SIM</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Play Quiz Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('kuis');
          }}
          className="p-4.5 rounded-[18px] apple-card cursor-pointer group transition-all duration-200 btn-press flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
              +20 Poin
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors tracking-apple-tight">
              Kuis SIM Harian
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Tantangan rambu & etika berkendara
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
            <span>Mulai Belajar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* SOS Emergency Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('sos');
          }}
          className="p-4.5 rounded-[18px] apple-card border-rose-500/30 hover:border-rose-400 cursor-pointer group transition-all duration-200 btn-press flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
              110 POLRI
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors tracking-apple-tight">
              Darurat SOS 110
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Tahan 3 detik & kirim GPS instan
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-rose-400">
            <span>Buka SOS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. AI Mascot Assistant Showcase */}
      <div className="p-4.5 rounded-[18px] apple-card border-blue-500/30 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div 
            onClick={() => onOpenRobotChat()}
            className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0066cc] to-indigo-700 p-0.5 shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform btn-press"
          >
            <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center p-0.5 overflow-hidden">
              <img 
                src={MASCOT_CONFIG.avatarUrl} 
                alt={MASCOT_CONFIG.name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.png')) {
                    target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                  }
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-apple-tight">
                {MASCOT_CONFIG.name}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                AI Korlantas
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Tanya rute Banyuwangi bebas macet, pasal hukum lalu lintas, atau info kecelakaan.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
          <button
            onClick={() => onOpenRobotChat('Bagaimana kondisi macet di Jalan Gajah Mada Banyuwangi saat ini?')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-blue-500/25 text-blue-300 hover:bg-white/10 btn-press transition-colors"
          >
            🚦 Macet di Gajah Mada?
          </button>
          <button
            onClick={() => onOpenRobotChat('Rekomendasikan rute aman ke sekolah bagi pelajar Banyuwangi')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-indigo-500/25 text-indigo-300 hover:bg-white/10 btn-press transition-colors"
          >
            🛵 Rute aman ke sekolah?
          </button>
          <button
            onClick={() => onOpenRobotChat('Jelaskan tugas pokok Korlantas Polri dan peran Polantas bagi pelajar')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-amber-500/25 text-amber-300 hover:bg-white/10 btn-press transition-colors"
          >
            👮 Apa itu Korlantas Polri?
          </button>
        </div>
      </div>

      {/* 4. Traffic & Incident Live Snapshot */}
      <div className="p-4.5 rounded-[18px] apple-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-blue-500/15 text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-apple-tight">
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
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 btn-press"
          >
            Peta Lengkap
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hotspot Card */}
        <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">{primaryHotspot.nama_jalan}</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
              {primaryHotspot.level_kemacetan.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {primaryHotspot.penyebab}
          </p>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 pt-1">
            <Compass className="w-3.5 h-3.5" />
            Saran: {primaryHotspot.saran_rute}
          </p>
        </div>

        {/* Recent Simulated Accident Insight */}
        <div className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/25 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulasi Evaluasi Laka Lantas</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {latestAccident.waktu_kejadian}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {latestAccident.lokasi}: {latestAccident.kronologi_singkat}
          </p>
          <p className="text-xs text-amber-300/90 font-medium pt-0.5">
            💡 <strong>Pencegahan</strong>: {latestAccident.edukasi_pencegahan}
          </p>
        </div>
      </div>

      {/* 5. Notification Tester Pill */}
      <div className="p-4 rounded-[18px] apple-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-apple-tight">Notifikasi Disiplin</h4>
            <p className="text-[11px] text-slate-400">Pengingat helm & jadwal berangkat</p>
          </div>
        </div>
        <button
          onClick={handleTestNotification}
          className="apple-button-primary text-xs px-4 py-1.5 shrink-0"
        >
          Tes Notif
        </button>
      </div>
    </div>
  );
};
