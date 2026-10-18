import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FastForward,
  Building2,
  Calendar,
  User,
  QrCode,
  Download,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { LayananSubmission } from '../../../core/types';
import { LAYANAN_CONFIGS } from '../../../data/layanan';
import { layananService } from '../../../services/layanan';
import { sound } from '../../../shared/services/sound';

interface TrackingDetailViewProps {
  submissionId: string;
  onBack: () => void;
}

export const TrackingDetailView: React.FC<TrackingDetailViewProps> = ({
  submissionId,
  onBack,
}) => {
  const [submission, setSubmission] = useState<LayananSubmission | null>(() =>
    layananService.getSubmission(submissionId)
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [advanceMsg, setAdvanceMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = layananService.subscribeSubmissions((list) => {
      const updated = list.find((s) => s.id === submissionId);
      if (updated) setSubmission(updated);
    });
    return () => unsub();
  }, [submissionId]);

  if (!submission) {
    return (
      <div className="apple-card bg-white p-8 rounded-[24px] text-center space-y-4">
        <p className="text-xs text-slate-500">Permohonan tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 btn-press"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const config = LAYANAN_CONFIGS[submission.jenis];

  const handleAdvance = () => {
    setIsAdvancing(true);
    sound.playClick();

    setTimeout(() => {
      const advanced = layananService.advanceStatus(submission.id);
      if (advanced) {
        setSubmission(advanced);
        sound.playSuccess();
        setAdvanceMsg(`Status berhasil dimajukan ke: "${advanced.status.toUpperCase()}"`);
        setTimeout(() => setAdvanceMsg(null), 3000);
      }
      setIsAdvancing(false);
    }, 400);
  };

  const isFinalStage = submission.status === 'diambil';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0077C0] transition-colors btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </button>

        <span className="text-[11px] font-mono font-bold text-slate-400">
          {submission.nomor_layanan}
        </span>
      </div>

      {/* Main Detail Header Card */}
      <div className="apple-card bg-white p-6 rounded-[24px] border border-[#DDE6E2] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              {submission.nomor_layanan}
            </h1>
            <p className="text-xs font-bold text-[#0077C0]">
              {config?.nama || submission.jenis.toUpperCase()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-black text-[#0077C0]">
              {submission.progress_percent}%
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">Tingkat Kemajuan</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              submission.progress_percent === 100 ? 'bg-emerald-500' : 'bg-[#0077C0]'
            }`}
            style={{ width: `${submission.progress_percent}%` }}
          />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Nama Pemohon</span>
            <span className="font-bold text-slate-800">{submission.nama_pemohon}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Lokasi Satpas/Samsat</span>
            <span className="font-bold text-slate-800 line-clamp-1">{submission.satpas_tujuan}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Tanggal Permohonan</span>
            <span className="font-bold text-slate-800">{submission.tanggal_pengajuan}</span>
          </div>
        </div>
      </div>

      {/* Demo Action: Advance Status Button (Khusus Juri & Presentasi) */}
      <div className="apple-card bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-5 rounded-[22px] border border-blue-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0077C0] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Simulasi Alur Presisi (Demo Mode)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Majukan status permohonan ke tahap berikutnya secara instan untuk pengujian juri.
              </p>
            </div>
          </div>
        </div>

        {advanceMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold animate-fadeIn">
            ✓ {advanceMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdvance}
          disabled={isAdvancing || isFinalStage}
          className="w-full py-3 rounded-xl bg-[#0077C0] hover:bg-[#008be0] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 btn-press"
        >
          {isAdvancing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses Status...</span>
            </>
          ) : isFinalStage ? (
            <span>Permohonan Telah Selesai 100% (Tahap Akhir)</span>
          ) : (
            <>
              <FastForward className="w-3.5 h-3.5" />
              <span>Majukan Status ke Tahap Berikutnya</span>
            </>
          )}
        </button>
      </div>

      {/* Vertical Timeline Stepper */}
      <div className="apple-card bg-white p-6 rounded-[24px] border border-[#DDE6E2] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 font-heading">
            Tahapan & Riwayat Proses
          </h2>
          <span className="text-[10px] font-bold text-slate-400">
            5 Tahap Layanan Terpadu
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {submission.timeline.map((step, idx) => {
            const isDone = step.selesai;
            const isCurrent = step.status === submission.status;

            return (
              <div key={idx} className="relative space-y-1">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                      ? 'border-[#0077C0] bg-white ring-4 ring-blue-100 text-[#0077C0]'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0077C0]" />
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h4
                    className={`text-xs font-black tracking-tight ${
                      isCurrent
                        ? 'text-[#0077C0]'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.waktu && (
                    <span className="text-[10px] font-mono text-slate-400 font-medium shrink-0">
                      {step.waktu}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {step.deskripsi}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rincian Spesifik Layanan */}
      {submission.detail_layanan && Object.keys(submission.detail_layanan).length > 0 && (
        <div className="apple-card bg-white p-5 rounded-[22px] border border-[#DDE6E2] shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-heading">
            Rincian Formulir Layanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(submission.detail_layanan).map(([key, val]) => (
              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-slate-800">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
