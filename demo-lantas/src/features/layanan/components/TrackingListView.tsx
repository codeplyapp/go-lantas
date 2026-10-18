import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  CreditCard,
  Car,
  FileCheck,
  Megaphone,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LayananSubmission, LayananStatus } from '../../../core/types';
import { LAYANAN_CONFIGS } from '../../../data/layanan';
import { layananService } from '../../../services/layanan';
import { sound } from '../../../shared/services/sound';

interface TrackingListViewProps {
  onBack: () => void;
  onSelectSubmission: (id: string) => void;
  onNewSubmission: () => void;
}

export const TrackingListView: React.FC<TrackingListViewProps> = ({
  onBack,
  onSelectSubmission,
  onNewSubmission,
}) => {
  const [submissions, setSubmissions] = useState<LayananSubmission[]>(() =>
    layananService.listSubmissions()
  );
  const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = layananService.subscribeSubmissions((list) => {
      setSubmissions(list);
    });
    return () => unsub();
  }, []);

  const getStatusBadge = (status: LayananStatus) => {
    switch (status) {
      case 'diajukan':
        return { label: 'Diajukan', bg: 'bg-blue-50 text-[#0077C0] border-blue-200' };
      case 'verifikasi':
        return { label: 'Verifikasi Berkas', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'diproses':
        return { label: 'Sedang Diproses', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'selesai':
        return { label: 'Selesai / Terbit', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'diambil':
        return { label: 'Telah Diserahkan', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getServiceIcon = (jenis: string) => {
    switch (jenis) {
      case 'e_sim':
        return <CreditCard className="w-5 h-5 text-[#0077C0]" />;
      case 'stnk':
        return <Car className="w-5 h-5 text-sky-600" />;
      case 'skck':
        return <FileCheck className="w-5 h-5 text-teal-600" />;
      case 'surat_keramaian':
        return <Megaphone className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-orange-600" />;
    }
  };

  const filteredList = submissions.filter((item) => {
    if (filterStatus === 'aktif') {
      if (item.status === 'selesai' || item.status === 'diambil') return false;
    } else if (filterStatus === 'selesai') {
      if (item.status !== 'selesai' && item.status !== 'diambil') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = item.nomor_layanan.toLowerCase().includes(q);
      const matchName = item.nama_pemohon.toLowerCase().includes(q);
      const matchSatpas = item.satpas_tujuan.toLowerCase().includes(q);
      return matchNo || matchName || matchSatpas;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0077C0] transition-colors btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onNewSubmission();
          }}
          className="text-xs font-bold text-[#0077C0] hover:underline flex items-center gap-1 btn-press"
        >
          <span>+ Buat Permohonan Baru</span>
        </button>
      </div>

      {/* Title & Filter Tabs */}
      <div className="space-y-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
            Lacak Status Permohonan
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pantau progres real-time pengurusan E-SIM, STNK, SKCK, dan perizinan Korlantas POLRI.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor layanan (SIM-2026-...) atau nama..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDE6E2] text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0077C0] outline-none shadow-2xs"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {[
            { id: 'semua', label: 'Semua Status' },
            { id: 'aktif', label: 'Sedang Berjalan' },
            { id: 'selesai', label: 'Telah Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setFilterStatus(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all btn-press ${
                filterStatus === tab.id
                  ? 'bg-[#0077C0] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const config = LAYANAN_CONFIGS[item.jenis];
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectSubmission(item.id);
                }}
                className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] hover:border-[#0077C0]/50 shadow-xs transition-all cursor-pointer group btn-press space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getServiceIcon(item.jenis)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {item.nomor_layanan}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                        {config?.nama || item.jenis.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Progres Berkas</span>
                    <span className="text-[#0077C0] font-extrabold">{item.progress_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.progress_percent === 100 ? 'bg-emerald-500' : 'bg-[#0077C0]'
                      }`}
                      style={{ width: `${item.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="line-clamp-1">{item.satpas_tujuan}</span>
                  <div className="flex items-center gap-1 font-bold text-[#0077C0] shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="apple-card bg-white p-8 rounded-[24px] border border-[#DDE6E2] text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Tidak Ada Permohonan Ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Belum ada pengajuan dengan filter ini atau coba gunakan kata kunci pencarian yang berbeda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
