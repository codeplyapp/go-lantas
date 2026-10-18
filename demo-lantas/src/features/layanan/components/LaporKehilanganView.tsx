import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Camera,
  MapPin,
  Calendar,
  CheckCircle2,
  Upload,
  X,
  CreditCard,
  Car,
  FileCheck,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { KehilanganKategori, LaporanKehilangan, UserProfile } from '../../../core/types';
import { layananService } from '../../../services/layanan';
import { sound } from '../../../shared/services/sound';

interface LaporKehilanganViewProps {
  profile?: UserProfile | null;
  onBack: () => void;
}

export const LaporKehilanganView: React.FC<LaporKehilanganViewProps> = ({
  profile,
  onBack,
}) => {
  const [kategori, setKategori] = useState<KehilanganKategori>('stnk');
  const [nama, setNama] = useState(profile?.nama || 'Bripda Alif Farhan');
  const [nik, setNik] = useState('3578012309050001');
  const [noHp, setNoHp] = useState('081234567890');
  const [judulBarang, setJudulBarang] = useState('STNK Sepeda Motor Honda Vario 160');
  const [ciriCiri, setCiriCiri] = useState('Nopol B 1234 SGP atas nama Bripda Alif Farhan, tersimpan di dompet cokelat.');
  const [lokasiHilang, setLokasiHilang] = useState('Area Parkir Stasiun Kereta Api Manggarai');
  const [waktuHilang, setWaktuHilang] = useState('Kemarin sore, sekitar pukul 17:30 WIB');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<LaporanKehilangan | null>(null);

  const kategoriList: { id: KehilanganKategori; label: string; desc: string; icon: any }[] = [
    { id: 'stnk', label: 'STNK Motor/Mobil', desc: 'Surat Tanda Nomor Kendaraan', icon: Car },
    { id: 'sim', label: 'SIM A / C / Umum', desc: 'Surat Izin Mengemudi', icon: CreditCard },
    { id: 'bpkb', label: 'BPKB Kendaraan', desc: 'Buku Pemilik Kendaraan Bermotor', icon: FileCheck },
    { id: 'plat_nomor', label: 'Tanda Nomor (TNKB)', desc: 'Plat Nomor Hilang / Lepas', icon: Car },
    { id: 'ktp_dokumen', label: 'KTP / Dokumen Resmi', desc: 'KTP, KK, Ijazah, Paspor', icon: FileText },
    { id: 'barang_berharga', label: 'Barang Berharga Lain', desc: 'Dompet, Gawai, Dokumen', icon: FileText },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulBarang.trim() || !lokasiHilang.trim()) {
      sound.playWrong();
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    setTimeout(() => {
      const report = layananService.createLaporanKehilangan({
        uid: profile?.uid || 'demo_user_001',
        nama_pelapor: nama,
        nik,
        no_hp: noHp,
        kategori,
        judul_barang: judulBarang,
        ciri_ciri: ciriCiri,
        lokasi_hilang: lokasiHilang,
        waktu_hilang: waktuHilang,
        foto_bukti_url: fotoPreview || undefined,
      });

      setIsSubmitting(false);
      sound.playSuccess();
      setCreatedReport(report);
    }, 600);
  };

  // ─── Success Sheet ────────────────────────────────────────────────────────
  if (createdReport) {
    return (
      <div className="space-y-6 animate-fadeInScale">
        <div className="apple-card bg-white p-6 sm:p-8 rounded-[24px] border border-[#DDE6E2] shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Laporan Berhasil Diterima SPKT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading pt-2">
              STPLK Elektronik Diterbitkan
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Surat Tanda Penerimaan Laporan Kehilangan resmi telah terdaftar di database terpadu Korlantas POLRI.
            </p>
          </div>

          {/* LPK Code Card */}
          <div className="bg-slate-50 rounded-2xl border border-dashed border-[#EA580C]/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-500">Nomor Registrasi Laporan</span>
              <span className="text-xs font-bold text-[#EA580C]">Layanan Bebas Biaya</span>
            </div>

            <div className="py-1">
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#EA580C] select-all">
                {createdReport.nomor_lpk}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Gunakan nomor ini sebagai syarat resmi penerbitan ulang STNK/SIM baru di Satpas/Samsat.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <QrCode className="w-4 h-4 text-[#EA580C]" />
              <span>Barcode Tanda Tangan Digital Ka SPKT Sah</span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs text-left space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Barang / Dokumen Hilang</span>
              <span className="font-bold text-slate-800">{createdReport.judul_barang}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Perkiraan Tempat Hilang</span>
              <span className="font-bold text-slate-800">{createdReport.lokasi_hilang}</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md btn-press"
          >
            Selesai & Kembali ke Menu Layanan
          </button>
        </div>
      </div>
    );
  }

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
          <span>Kembali</span>
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          SPKT Presisi Online
        </span>
      </div>

      {/* Intro Card */}
      <div className="apple-card bg-white p-5 sm:p-6 rounded-[22px] border border-[#DDE6E2] shadow-xs flex items-start gap-4">
        <div className="w-13 h-13 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-orange-700">
            Laporan Kehilangan STPLK
          </span>
          <h1 className="text-base sm:text-lg font-black text-slate-900 font-heading">
            Lapor Kehilangan Dokumen / Kendaraan
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Penerbitan Surat Tanda Penerimaan Laporan Kehilangan (STPLK) resmi SPKT Kepolisian untuk pengurusan dokumen pengganti.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Kategori Dokumen */}
        <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Pilih Kategori Dokumen yang Hilang
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {kategoriList.map((item) => {
              const Icon = item.icon;
              const isSelected = kategori === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setKategori(item.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all btn-press ${
                    isSelected
                      ? 'border-[#EA580C] bg-orange-50/60 text-[#EA580C] shadow-xs font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#EA580C]' : 'text-slate-400'}`} />
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Laporan */}
        <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Rincian Kejadian Kehilangan
          </h3>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Nama / Judul Barang yang Hilang
            </label>
            <input
              type="text"
              required
              value={judulBarang}
              onChange={(e) => setJudulBarang(e.target.value)}
              placeholder="Contoh: STNK Sepeda Motor Honda Vario 160"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EA580C] outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Ciri-Ciri Khusus / Nomor Dokumen
            </label>
            <textarea
              rows={2}
              value={ciriCiri}
              onChange={(e) => setCiriCiri(e.target.value)}
              placeholder="Sebutkan nomor plat, warna dompet, nomor identitas atau ciri unik barang..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-[#EA580C] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Perkiraan Tempat / Lokasi Hilang
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={lokasiHilang}
                  onChange={(e) => setLokasiHilang(e.target.value)}
                  placeholder="Contoh: Parkir Stasiun Manggarai"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Waktu Kejadian Hilang
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={waktuHilang}
                  onChange={(e) => setWaktuHilang(e.target.value)}
                  placeholder="Contoh: 17 Oktober 2026, 15:00 WIB"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EA580C] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Unggah Bukti / Foto Pendukung (Opsional FileReader) */}
        <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Foto Bukti Pendukung (Opsional)
          </h3>

          {fotoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-44 bg-slate-100 flex items-center justify-center group">
              <img src={fotoPreview} alt="Bukti" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFotoPreview(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-[#EA580C]/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Unggah Fotokopi / Arsip Bukti</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG atau Dokumen Pendukung (Maks 5MB)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-[#EA580C] hover:bg-[#d44d08] text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
        >
          {isSubmitting ? (
            <span>Menerbitkan Surat...</span>
          ) : (
            <>
              <span>Terbitkan STPLK Elektronik</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
