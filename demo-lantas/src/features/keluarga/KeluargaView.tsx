import React, { useState } from 'react';
import { 
  HeartHandshake, ShieldCheck, KeyRound, 
  MapPin, History, Copy, Check, Users 
} from 'lucide-react';
import { FamilyLink, FamilyAccessLog, UserProfile } from '../../core/types';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

interface KeluargaViewProps {
  profile?: UserProfile | null;
}

export const KeluargaView: React.FC<KeluargaViewProps> = ({ profile }) => {
  const [familyLinks] = useState<FamilyLink[]>([]);
  const [familyLogs] = useState<FamilyAccessLog[]>([]);
  const [inputPairingCode, setInputPairingCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const isParent = profile?.role === 'orang_tua';
  const isStudent = profile?.role === 'pelajar' || profile?.role === 'mahasiswa';

  const handlePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPairingCode.trim()) return;
    sound.playClick();
    NotificationService.showInAppToast(
      'Fitur Segera Hadir',
      'Koneksi keluarga real-time akan hadir di Fase B dengan persetujuan UU PDP.',
      'info'
    );
    setInputPairingCode('');
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(profile?.pairing_code || 'SGP-8821');
    setCopiedCode(true);
    NotificationService.showInAppToast(
      'Kode Disalin',
      `Kode pairing ${profile?.pairing_code || 'SGP-8821'} disalin ke clipboard.`,
      'success'
    );
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 pb-4 animate-fadeIn">
      {/* 1. Privacy Banner & Spark Real-Time Notice */}
      <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-[#0077c0]/10 border-[#0077c0]/30 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-3 text-[#0077c0]">
          <ShieldCheck className="w-5.5 h-5.5 shrink-0" />
          <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
            Pemantauan Keluarga Berbasis Persetujuan (Consent-First)
          </h2>
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-semibold">
          Dirancang selaras dengan <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>. Data lokasi anak tidak dibagikan tanpa persetujuan dua arah dan dapat dicabut sewaktu-waktu.
        </p>
        <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5 border-t border-[#0077c0]/20 font-medium">
          💡 <strong>Catatan Notifikasi:</strong> Pembaruan status & pemantauan keluarga disinkronkan secara real-time saat aplikasi sedang dibuka oleh anggota keluarga (Firebase Spark real-time sync).
        </p>
      </div>

      {/* 2. Pelajar Persona: Pairing Code & Family Links */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pairing Code Generator Box */}
          <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white text-center space-y-3.5 flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-extrabold text-[#0077C0] uppercase tracking-wider">
              Kode Pairing Unik Anda
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-heading font-black tracking-widest text-[#0077c0] bg-[#0077c0]/10 px-4.5 py-2.5 rounded-[12px] border border-[#0077c0]/30 shadow-xs">
                {profile?.pairing_code || 'SGP-8821'}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-[#0077C0] border border-slate-200 transition-all btn-press shadow-xs"
                title="Salin Kode"
              >
                {copiedCode ? <Check className="w-4.5 h-4.5 text-[#0077c0]" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-medium">
              Berikan kode ini kepada orang tua Anda untuk menautkan akun dengan aman.
            </p>
          </div>

          {/* Active Family Links - empty state */}
          <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white space-y-3.5 flex flex-col justify-between shadow-xs">
            <h3 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#0077C0]" />
              Status Tautan Orang Tua
            </h3>
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-xs text-center text-slate-400 font-medium leading-relaxed">
                Belum ada orang tua yang terhubung.<br />
                <span className="text-[#0077c0] font-bold">Bagikan kode pairing</span> Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Orang Tua Persona: 2-Grid Pairing Form & Monitored Location */}
      {isParent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Form Pairing */}
          <form onSubmit={handlePairingSubmit} className="p-5 sm:p-6 rounded-[16px] apple-card bg-white space-y-3.5 flex flex-col justify-between shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-[#0077C0]" />
                <h3 className="text-sm font-extrabold text-[#0F172A] tracking-apple-tight">
                  Tautkan Akun Anak (Pairing 6-Digit)
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Masukkan kode 6 digit yang tertera di smartphone anak untuk meminta izin pantauan lokasi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: SGP-8821"
                  value={inputPairingCode}
                  onChange={(e) => setInputPairingCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-300 text-xs font-extrabold uppercase tracking-wider text-slate-900 focus:outline-none focus:border-[#0077C0] shadow-xs"
                />
                <button
                  type="submit"
                  className="apple-button-primary text-xs px-5 py-2.5 font-bold min-h-[42px]"
                >
                  Kirim
                </button>
              </div>
            </div>
          </form>

          {/* Child Location Cards */}
          <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white space-y-3.5 flex flex-col justify-between shadow-xs">
            <h3 className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0077c0]" />
              Pemantauan Lokasi Anak
            </h3>

            {familyLinks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-6 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada anak yang ditautkan.<br />
                  Gunakan formulir pairing di samping untuk menghubungkan akun anak.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {familyLinks.map((link) => (
                  <div key={link.id} className="py-3.5 space-y-2 first:pt-1 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#0F172A] tracking-apple-tight">{link.child_nama}</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{link.child_sekolah}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 capitalize">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {link.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Transparansi Log Akses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="gowapit-section-label flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#0077C0]" />
            Transparansi Log Akses (Audit Trail UU PDP)
          </span>
          <span className="text-[11px] text-slate-600 font-bold">
            {familyLogs.length} Catatan
          </span>
        </div>

        {familyLogs.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-[16px] border border-[#E5EBE8] text-xs text-slate-400 font-medium shadow-xs">
            Belum ada catatan log akses lokasi. Seluruh riwayat akses lokasi keluarga akan tercatat di sini secara transparan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familyLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-[16px] apple-card bg-white border-[#E5EBE8] space-y-1.5 text-xs flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{log.accessor_nama}</span>
                  <span className="text-[10px] text-slate-600 font-medium">{log.waktu_akses}</span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium">
                  Melihat lokasi: <span className="text-emerald-800 font-bold">{log.lokasi_dilihat}</span>
                </p>
                <p className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-100 font-medium">
                  Tujuan: {log.tujuan_akses}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeluargaView;
