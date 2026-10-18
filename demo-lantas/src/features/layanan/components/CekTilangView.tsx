import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';
import { TilangEtleRecord } from '../../../core/types';
import { layananService } from '../../../services/layanan';
import { sound } from '../../../shared/services/sound';

interface CekTilangViewProps {
  onBack: () => void;
}

export const CekTilangView: React.FC<CekTilangViewProps> = ({ onBack }) => {
  const [nopol, setNopol] = useState('B 1234 SGP');
  const [hasSearched, setHasSearched] = useState(true);
  const [results, setResults] = useState<TilangEtleRecord[]>(() => {
    return layananService.cekTilang('B 1234 SGP').records;
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [paidIds, setPaidIds] = useState<Record<string, boolean>>({});

  const samplePlates = [
    { plat: 'B 1234 SGP', label: 'B 1234 SGP (Marka Jalan)' },
    { plat: 'D 4567 LNT', label: 'D 4567 LNT (Helm SNI)' },
    { plat: 'L 9876 POL', label: 'L 9876 POL (Main Ponsel)' },
    { plat: 'B 3110 KOR', label: 'B 3110 KOR (Kecepatan)' },
    { plat: 'B 8888 KOR', label: 'B 8888 KOR (Plat Tertib / Nihil)' },
  ];

  const handleSearch = (plateQuery?: string) => {
    const query = (plateQuery || nopol).trim().toUpperCase();
    if (!query) return;

    sound.playClick();
    const res = layananService.cekTilang(query);
    setResults(res.records);
    setHasSearched(true);
  };

  const handleCopyBriva = (code: string) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSimulatePayment = (id: string) => {
    sound.playSuccess();
    setPaidIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div>
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0077C0] transition-colors btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Layanan</span>
        </button>
      </div>

      {/* Search Bar Card */}
      <div className="apple-card bg-white p-5 sm:p-6 rounded-[22px] border border-[#DDE6E2] shadow-xs space-y-4">
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg font-black text-slate-900 font-heading">
            Pengecekan Tilang Elektronik (ETLE)
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Periksa catatan pelanggaran lalu lintas kamera CCTV statis, gantry jalan tol, dan ETLE mobile terintegrasi Korlantas POLRI.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={nopol}
              onChange={(e) => setNopol(e.target.value.toUpperCase())}
              placeholder="Masukkan Plat Nomor (Contoh: B 1234 SGP)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 uppercase focus:bg-white focus:border-[#0077C0] outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#0077C0] hover:bg-[#008be0] text-white text-xs sm:text-sm font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 btn-press shrink-0"
          >
            <span>Cek Tilang</span>
          </button>
        </form>

        {/* Quick Sample Plates */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contoh Plat Nomor Simulasi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePlates.map((item) => (
              <button
                key={item.plat}
                type="button"
                onClick={() => {
                  setNopol(item.plat);
                  handleSearch(item.plat);
                }}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all btn-press ${
                  nopol === item.plat
                    ? 'border-[#0077C0] bg-blue-50 text-[#0077C0]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          {results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Ditemukan {results.length} Catatan Pelanggaran ETLE</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">{nopol}</span>
              </div>

              {results.map((rec) => {
                const isPaid = rec.status_pembayaran === 'terverifikasi_lunas' || paidIds[rec.id];

                return (
                  <div
                    key={rec.id}
                    className="apple-card bg-white rounded-[22px] border border-[#DDE6E2] shadow-xs overflow-hidden"
                  >
                    {/* Top Status Bar */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block">
                          NO. REFERENSI ETLE
                        </span>
                        <span className="text-xs font-mono font-black text-slate-800">
                          {rec.nomor_referensi}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        {isPaid ? '✓ Terverifikasi Lunas' : 'Menunggu Konfirmasi / Bayar'}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Vehicle & Violation Title */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold text-[#0077C0] bg-blue-50 px-2 py-0.5 rounded-md">
                          {rec.pasal_pelanggaran}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading pt-1">
                          {rec.deskripsi_pelanggaran}
                        </h3>
                        <p className="text-xs font-bold text-slate-500">
                          {rec.jenis_kendaraan} • Plat: {rec.plat_nomor}
                        </p>
                      </div>

                      {/* Location & Time info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Lokasi Kamera ETLE</span>
                            <span className="font-semibold text-slate-800 leading-tight block">
                              {rec.lokasi_kamera}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Waktu Kejadian</span>
                            <span className="font-semibold text-slate-800 leading-tight block">
                              {rec.waktu_pelanggaran}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fine Amount & BRIVA Payment Box */}
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium">Nominal Titipan Denda</span>
                          <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                            Rp {rec.nominal_denda.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {!isPaid && (
                          <div className="pt-2 border-t border-slate-700 space-y-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                              Kode Virtual Account Pembayaran (BRIVA)
                            </span>
                            <div className="flex items-center justify-between bg-black/40 rounded-xl px-3 py-2 border border-slate-700">
                              <span className="font-mono text-sm sm:text-base font-black tracking-widest text-sky-300">
                                {rec.kode_briva}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyBriva(rec.kode_briva)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 btn-press"
                              >
                                {copiedCode === rec.kode_briva ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-end">
                          {!isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleSimulatePayment(rec.id)}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 btn-press"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Simulasi Pelunasan Denda (Demo)</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                              <Check className="w-4 h-4" />
                              <span>Denda Tilang Telah Lunas Divalidasi Bank</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean / Safe State */
            <div className="apple-card bg-white p-8 rounded-[24px] border border-[#DDE6E2] text-center space-y-4 shadow-xs animate-fadeInScale">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  STATUS NIHIL PELANGGARAN
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading pt-1">
                  Kendaraan Tertib Lalu Lintas
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Tidak ditemukan rekaman bukti pelanggaran kamera ETLE aktif untuk plat nomor{' '}
                  <span className="font-mono font-bold text-slate-800">{nopol}</span>. Terima kasih telah mematuhi aturan berlalu lintas!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
