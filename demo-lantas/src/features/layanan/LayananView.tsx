import React, { useState, useEffect } from 'react';
import {
  Shield,
  CreditCard,
  Car,
  FileCheck,
  FileText,
  Search,
  Camera,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
  QrCode,
  Users,
} from 'lucide-react';
import { LayananJenis, UserProfile, LayananSubmission } from '../../core/types';
import { LAYANAN_CONFIGS } from '../../data/layanan';
import { layananService } from '../../services/layanan';
import { sound } from '../../shared/services/sound';

import { ServiceForm } from './components/ServiceForm';
import { CekTilangView } from './components/CekTilangView';
import { LaporKehilanganView } from './components/LaporKehilanganView';
import { TrackingListView } from './components/TrackingListView';
import { TrackingDetailView } from './components/TrackingDetailView';

export type LayananSubView =
  | 'hub'
  | 'form'
  | 'cek_tilang'
  | 'lapor'
  | 'tracking'
  | 'tracking_detail';

interface LayananViewProps {
  profile?: UserProfile | null;
  initialSubView?: LayananSubView;
  onNavigateTab?: (tab: any) => void;
}

export const LayananView: React.FC<LayananViewProps> = ({
  profile,
  initialSubView = 'hub',
  onNavigateTab,
}) => {
  const [subView, setSubView] = useState<LayananSubView>(initialSubView);
  const [selectedJenis, setSelectedJenis] = useState<LayananJenis>('e_sim');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [activeSubmissions, setActiveSubmissions] = useState<LayananSubmission[]>(() =>
    layananService.listSubmissions()
  );

  useEffect(() => {
    const unsub = layananService.subscribeSubmissions((list) => {
      setActiveSubmissions(list);
    });
    return () => unsub();
  }, []);

  const pendingCount = activeSubmissions.filter(
    (s) => s.status !== 'selesai' && s.status !== 'diambil'
  ).length;

  const handleOpenForm = (jenis: LayananJenis) => {
    sound.playClick();
    setSelectedJenis(jenis);
    setSubView('form');
  };

  const handleOpenTrackingDetail = (id: string) => {
    sound.playClick();
    setSelectedSubmissionId(id);
    setSubView('tracking_detail');
  };

  // ─── Sub-route Renderers ──────────────────────────────────────────────────
  if (subView === 'form') {
    return (
      <ServiceForm
        jenis={selectedJenis}
        profile={profile}
        onBack={() => setSubView('hub')}
        onViewTrackingDetail={(id) => handleOpenTrackingDetail(id)}
      />
    );
  }

  if (subView === 'cek_tilang') {
    return <CekTilangView onBack={() => setSubView('hub')} />;
  }

  if (subView === 'lapor') {
    return (
      <LaporKehilanganView
        profile={profile}
        onBack={() => setSubView('hub')}
      />
    );
  }

  if (subView === 'tracking') {
    return (
      <TrackingListView
        onBack={() => setSubView('hub')}
        onSelectSubmission={(id) => handleOpenTrackingDetail(id)}
        onNewSubmission={() => handleOpenForm('e_sim')}
      />
    );
  }

  if (subView === 'tracking_detail') {
    return (
      <TrackingDetailView
        submissionId={selectedSubmissionId}
        onBack={() => setSubView('tracking')}
      />
    );
  }

  // ─── Main Hub View ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner Hub */}
      <div className="bg-gradient-to-br from-[#0077C0] via-[#008BE0] to-[#00609C] text-white p-6 rounded-[28px] shadow-[0_12px_30px_rgba(0,119,192,0.22)] relative overflow-hidden">
        {/* Background Emblem Watermark */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 pointer-events-none opacity-10 text-white select-none">
          <Shield className="w-full h-full stroke-[1] fill-current" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-extrabold tracking-wide text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            <span>Pelayanan Terpadu Korlantas POLRI</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
              Layanan Presisi Digital
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed max-w-md font-medium">
              Pengurusan SIM digital, pengesahan STNK, SKCK online, pelaporan kehilangan, dan cek tilang ETLE dalam satu genggaman.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Semua Loket Satpas Buka</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Layanan 24/7 Digital</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Tracking Quick Action Card (Bila ada pengajuan berjalan) */}
      <div
        onClick={() => {
          sound.playClick();
          setSubView('tracking');
        }}
        className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-[#0077C0]/50 shadow-xs cursor-pointer group transition-all btn-press"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-[#0077C0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  Status Pengajuan Berjalan
                </span>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    {pendingCount} Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeSubmissions.length > 0
                  ? `Terakhir: ${activeSubmissions[0].nomor_layanan} (${activeSubmissions[0].status.toUpperCase()})`
                  : 'Belum ada pengajuan aktif. Ketuk untuk melihat riwayat.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-bold text-xs text-[#0077C0] group-hover:translate-x-1 transition-transform">
            <span>Lacak</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Primary 4 Services Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-heading">
            Layanan Dokumen & Perizinan
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Resmi & Terverifikasi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* E-SIM Presisi */}
          <div
            onClick={() => handleOpenForm('e_sim')}
            className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-[#0077C0]/60 shadow-xs cursor-pointer group transition-all btn-press space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0077C0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#0077C0] bg-blue-50 px-2 py-0.5 rounded-md">
                ± 3 Hari Kerja
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0077C0] transition-colors font-heading">
                E-SIM Presisi Online
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Permohonan SIM baru atau perpanjangan golongan A, C, dan Umum dengan uji kesehatan terintegrasi.
              </p>
            </div>
            <div className="flex items-center text-[11px] font-bold text-[#0077C0] pt-1">
              <span>Mulai Pengajuan E-SIM</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* STNK Presisi */}
          <div
            onClick={() => handleOpenForm('stnk')}
            className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-sky-500/60 shadow-xs cursor-pointer group transition-all btn-press space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                ± 2 Hari Kerja
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors font-heading">
                Perpanjangan STNK & Pajak
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Pengesahan STNK tahunan dan pelunasan PKB / SWDKLLJ online tanpa perlu antre di Samsat.
              </p>
            </div>
            <div className="flex items-center text-[11px] font-bold text-sky-600 pt-1">
              <span>Proses Pajak Kendaraan</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* SKCK Presisi */}
          <div
            onClick={() => handleOpenForm('skck')}
            className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-teal-500/60 shadow-xs cursor-pointer group transition-all btn-press space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                ± 1 Hari Kerja
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 group-hover:text-teal-600 transition-colors font-heading">
                SKCK Online Presisi
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Penerbitan Surat Keterangan Catatan Kepolisian resmi terverifikasi database Bareskrim POLRI.
              </p>
            </div>
            <div className="flex items-center text-[11px] font-bold text-teal-600 pt-1">
              <span>Daftar SKCK Online</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lapor Kehilangan STPLK */}
          <div
            onClick={() => {
              sound.playClick();
              setSubView('lapor');
            }}
            className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-orange-500/60 shadow-xs cursor-pointer group transition-all btn-press space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                Bebas Biaya (Gratis)
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors font-heading">
                Lapor Kehilangan (STPLK)
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Penerbitan surat tanda penerimaan laporan kehilangan resmi SPKT untuk pengurusan STNK/SIM baru.
              </p>
            </div>
            <div className="flex items-center text-[11px] font-bold text-orange-600 pt-1">
              <span>Buat Laporan Kehilangan</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cek Tilang Elektronik (ETLE) Showcase Card */}
      <div
        onClick={() => {
          sound.playClick();
          setSubView('cek_tilang');
        }}
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-[24px] border border-slate-700/60 shadow-md cursor-pointer group transition-all btn-press relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  ETLE Nasional
                </span>
                <span className="text-[11px] text-slate-400">Database Real-Time</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-heading">
                Cek Bukti Pelanggaran Tilang Elektronik
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-md">
                Ketik nomor polisi kendaraan Anda untuk memeriksa status pelanggaran, rekaman CCTV, dan kode pembayaran BRIVA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0077C0] text-white text-xs font-bold shrink-0 shadow-xs group-hover:bg-[#008be0] transition-colors self-start sm:self-auto">
            <span>Periksa Plat Sekarang</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
