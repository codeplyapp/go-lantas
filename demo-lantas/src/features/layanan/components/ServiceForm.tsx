import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  CreditCard,
  Car,
  FileCheck,
  Megaphone,
  Building2,
  ShieldCheck,
  QrCode,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { LayananJenis, LayananSubmission, UserProfile } from '../../../core/types';
import { LAYANAN_CONFIGS, DUMMY_SATPAS_LIST } from '../../../data/layanan';
import { layananService } from '../../../services/layanan';
import { sound } from '../../../shared/services/sound';

interface ServiceFormProps {
  jenis: LayananJenis;
  profile?: UserProfile | null;
  onBack: () => void;
  onViewTrackingDetail: (submissionId: string) => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  jenis,
  profile,
  onBack,
  onViewTrackingDetail,
}) => {
  const config = LAYANAN_CONFIGS[jenis];

  const [nama, setNama] = useState(profile?.nama || '');
  const [nik, setNik] = useState('3578012309050001');
  const [noHp, setNoHp] = useState('081234567890');
  const [email, setEmail] = useState('demo@golantas.id');
  const [satpas, setSatpas] = useState(DUMMY_SATPAS_LIST[0]);

  // Checklist of requirements
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Dynamic service specific inputs
  const [simType, setSimType] = useState<'A' | 'C' | 'A_UMUM'>('C');
  const [simCategory, setSimCategory] = useState<'baru' | 'perpanjangan'>('perpanjangan');
  const [stnkNopol, setStnkNopol] = useState('B 1234 SGP');
  const [stnkMerk, setStnkMerk] = useState('Honda Vario 160');
  const [skckKeperluan, setSkckKeperluan] = useState('Persyaratan Melamar Pekerjaan BUMN / Kedinasan');
  const [acaraNama, setAcaraNama] = useState('Turnamen Olahraga Sekolah');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmission, setSuccessSubmission] = useState<LayananSubmission | null>(null);

  const toggleCheck = (idx: number) => {
    sound.playClick();
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allRequirementsChecked =
    config?.syaratDokumen.every((_: string, idx: number) => checkedItems[idx]) ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nik.trim() || !noHp.trim()) {
      sound.playWrong();
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const detail_layanan: Record<string, any> = {};
    if (jenis === 'e_sim') {
      detail_layanan.golongan_sim = `SIM ${simType}`;
      detail_layanan.jenis_permohonan = simCategory === 'baru' ? 'Permohonan Baru' : 'Perpanjangan';
      detail_layanan.kesehatan = 'Hasil E-Rikkes Terverifikasi';
      detail_layanan.psikologi = 'Hasil E-PPSI Terverifikasi';
    } else if (jenis === 'stnk') {
      detail_layanan.nopol = stnkNopol;
      detail_layanan.merk = stnkMerk;
      detail_layanan.tahun = '2023';
      detail_layanan.tipe = 'Pengesahan STNK & Pajak Tahunan';
    } else if (jenis === 'skck') {
      detail_layanan.keperluan = skckKeperluan;
      detail_layanan.status_sidik_jari = 'Sudah Rekam Inafis';
    } else if (jenis === 'surat_keramaian') {
      detail_layanan.nama_acara = acaraNama;
      detail_layanan.estimasi_peserta = '250 Orang';
    }

    setTimeout(() => {
      const created = layananService.createSubmission({
        jenis,
        uid: profile?.uid || 'demo_user_001',
        nama_pemohon: nama,
        nik,
        no_hp: noHp,
        email,
        satpas_tujuan: satpas,
        detail_layanan,
      });

      setIsSubmitting(false);
      sound.playSuccess();
      setSuccessSubmission(created);
    }, 700);
  };

  const getIcon = () => {
    switch (jenis) {
      case 'e_sim':
        return <CreditCard className="w-6 h-6 text-[#0077C0]" />;
      case 'stnk':
        return <Car className="w-6 h-6 text-sky-600" />;
      case 'skck':
        return <FileCheck className="w-6 h-6 text-teal-600" />;
      case 'surat_keramaian':
        return <Megaphone className="w-6 h-6 text-purple-600" />;
      default:
        return <FileText className="w-6 h-6 text-[#0077C0]" />;
    }
  };

  // ─── Success Modal Sheet ──────────────────────────────────────────────────
  if (successSubmission) {
    return (
      <div className="space-y-6 animate-fadeInScale">
        <div className="apple-card bg-white p-6 sm:p-8 rounded-[24px] border border-[#DDE6E2] shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pengajuan Berhasil Diterbitkan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading pt-2">
              Permohonan Terdaftar
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Berkas digital Anda telah masuk ke sistem antrean pelayanan terpadu Korlantas POLRI.
            </p>
          </div>

          {/* Registration Code Ticket Box */}
          <div className="bg-slate-50 rounded-2xl border border-dashed border-[#0077C0]/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold text-slate-500">Nomor Registrasi Layanan</span>
              <span className="text-xs font-extrabold text-[#0077C0]">
                {config?.singkatan}
              </span>
            </div>

            <div className="py-1">
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#0077C0] select-all">
                {successSubmission.nomor_layanan}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Simpan nomor ini untuk melakukan pengecekan berkala pada menu Lacak Status.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <QrCode className="w-4 h-4 text-[#0077C0]" />
              <span>Barcode Digital Terenkripsi Terlampir</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Pemohon</span>
              <span className="font-bold text-slate-800">{successSubmission.nama_pemohon}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Satpas / Samsat</span>
              <span className="font-bold text-slate-800 line-clamp-1">
                {successSubmission.satpas_tujuan}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Estimasi Waktu</span>
              <span className="font-bold text-slate-800">
                ± {successSubmission.estimasi_hari} Hari Kerja
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Status Awal</span>
              <span className="font-bold text-blue-600">Diajukan (Tahap 1)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onViewTrackingDetail(successSubmission.id)}
              className="w-full py-3.5 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 btn-press"
            >
              <span>Lacak Status Permohonan</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all btn-press"
            >
              Kembali ke Menu Layanan
            </button>
          </div>
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
          Formulir Digital Presisi
        </span>
      </div>

      {/* Service Intro Banner */}
      <div className="apple-card bg-white p-5 sm:p-6 rounded-[22px] border border-[#DDE6E2] shadow-xs flex items-start gap-4">
        <div className={`w-13 h-13 rounded-2xl ${config?.bgBadge} flex items-center justify-center shrink-0`}>
          {getIcon()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${config?.bgBadge} ${config?.textBadge}`}>
              {config?.singkatan}
            </span>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>± {config?.estimasiHari} Hari</span>
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 font-heading">
            {config?.nama}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {config?.deskripsi}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service-Specific Configuration */}
        {jenis === 'e_sim' && (
          <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Pilihan Golongan & Jenis SIM
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'C', label: 'SIM C', desc: 'R2 s/d 250cc' },
                { type: 'A', label: 'SIM A', desc: 'Mobil Pribadi' },
                { type: 'A_UMUM', label: 'SIM A Umum', desc: 'Angkutan Umum' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSimType(item.type as any);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all btn-press ${
                    simType === item.type
                      ? 'border-[#0077C0] bg-blue-50/60 text-[#0077C0] font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSimCategory('perpanjangan');
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all btn-press ${
                  simCategory === 'perpanjangan'
                    ? 'border-[#0077C0] bg-blue-50 text-[#0077C0]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                🔄 Perpanjangan SIM
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSimCategory('baru');
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all btn-press ${
                  simCategory === 'baru'
                    ? 'border-[#0077C0] bg-blue-50 text-[#0077C0]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Permohonan Baru
              </button>
            </div>
          </div>
        )}

        {jenis === 'stnk' && (
          <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Data Kendaraan Bermotor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor Polisi (Plat)</label>
                <input
                  type="text"
                  required
                  value={stnkNopol}
                  onChange={(e) => setStnkNopol(e.target.value.toUpperCase())}
                  placeholder="Contoh: B 1234 SGP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 uppercase focus:bg-white focus:border-[#0077C0] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Merk & Tipe Kendaraan</label>
                <input
                  type="text"
                  required
                  value={stnkMerk}
                  onChange={(e) => setStnkMerk(e.target.value)}
                  placeholder="Contoh: Honda Vario 160"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0077C0] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {jenis === 'skck' && (
          <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Keperluan Penerbitan SKCK
            </h3>
            <input
              type="text"
              required
              value={skckKeperluan}
              onChange={(e) => setSkckKeperluan(e.target.value)}
              placeholder="Contoh: Melamar Pekerjaan / Seleksi Kedinasan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0077C0] outline-none"
            />
          </div>
        )}

        {jenis === 'surat_keramaian' && (
          <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Nama Kegiatan / Acara
            </h3>
            <input
              type="text"
              required
              value={acaraNama}
              onChange={(e) => setAcaraNama(e.target.value)}
              placeholder="Contoh: Turnamen Olahraga Pelajar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0077C0] outline-none"
            />
          </div>
        )}

        {/* Data Pemohon */}
        <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Identitas Pemohon
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0077C0] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">NIK (16 Digit)</label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:border-[#0077C0] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0077C0] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Alamat Email Notifikasi</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0077C0] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Lokasi Satpas / Samsat Tujuan</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={satpas}
                onChange={(e) => setSatpas(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#0077C0] outline-none appearance-none"
              >
                {DUMMY_SATPAS_LIST.map((loc: string) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Persyaratan Dokumen Checklist */}
        <div className="apple-card bg-white p-5 rounded-[20px] border border-[#DDE6E2] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Konfirmasi Persyaratan Dokumen
            </h3>
            <span className="text-[10px] font-bold text-[#0077C0] bg-blue-50 px-2 py-0.5 rounded-md">
              Centang Kelengkapan Anda
            </span>
          </div>

          <div className="space-y-2">
            {config?.syaratDokumen.map((syarat: string, idx: number) => {
              const isChecked = !!checkedItems[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-medium leading-relaxed">{syarat}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 font-medium pt-1">
            * Seluruh dokumen pendukung asli akan diverifikasi fisik saat pengambilan dokumen di loket resmi Satpas.
          </p>
        </div>

        {/* Submit CTA */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !allRequirementsChecked}
            className="w-full py-4 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
          >
            {isSubmitting ? (
              <span>Mengirimkan Berkas...</span>
            ) : (
              <>
                <span>Kirim Permohonan Online</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>

          {!allRequirementsChecked && (
            <p className="text-center text-[11px] text-amber-600 font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Harap centang semua daftar kelengkapan dokumen di atas.</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
