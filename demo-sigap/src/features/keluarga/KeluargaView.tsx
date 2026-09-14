import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, ShieldCheck, KeyRound, CheckCircle2, 
  MapPin, History, Eye, UserX, Copy, Check 
} from 'lucide-react';
import { MockDB } from '../../core/db';
import { FamilyLink, FamilyAccessLog, UserProfile } from '../../core/types';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

export const KeluargaView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MockDB.getCurrentUser());
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>(MockDB.getFamilyLinks());
  const [familyLogs, setFamilyLogs] = useState<FamilyAccessLog[]>(MockDB.getFamilyLogs());
  const [inputPairingCode, setInputPairingCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(MockDB.getCurrentUser());
      setFamilyLinks(MockDB.getFamilyLinks());
      setFamilyLogs(MockDB.getFamilyLogs());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  const isParent = currentUser.role === 'orang_tua';
  const isStudent = currentUser.role === 'pelajar';

  const handlePairingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPairingCode.trim()) return;

    sound.playClick();
    const result = MockDB.requestFamilyPairing(inputPairingCode);
    if (result.success) {
      NotificationService.showInAppToast('Pairing Dikirim', result.message, 'info');
      setInputPairingCode('');
    } else {
      NotificationService.showInAppToast('Gagal Pairing', result.message, 'warning');
    }
  };

  const handleApproveLink = (linkId: string) => {
    sound.playCorrect();
    MockDB.updateFamilyLinkStatus(linkId, 'disetujui');
    NotificationService.showInAppToast(
      'Persetujuan Diberikan',
      'Izin berbagi lokasi aman telah diaktifkan untuk Orang Tua.',
      'success'
    );
  };

  const handleRevokeLink = (linkId: string) => {
    sound.playWrong();
    MockDB.updateFamilyLinkStatus(linkId, 'dicabut');
    NotificationService.showInAppToast(
      'Izin Akses Dicabut',
      'Transmisi lokasi dihentikan seketika sesuai hak privasi pengguna.',
      'warning'
    );
  };

  const handleInspectChildLocation = (link: FamilyLink) => {
    sound.playClick();
    MockDB.recordFamilyAccessLog(
      link.id,
      link.last_location?.alamat_perkiraan || 'Kawasan SMAN 1 Giri, Banyuwangi',
      'Pengecekan keberangkatan sekolah oleh orang tua'
    );
    NotificationService.showInAppToast(
      'Lokasi Anak Terverifikasi',
      `${link.child_nama} berada di ${link.last_location?.alamat_perkiraan || 'Banyuwangi'}. Log akses dicatat transparan.`,
      'success'
    );
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentUser.pairing_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Privacy Banner */}
      <div className="p-4.5 rounded-[18px] apple-card border-emerald-500/30 space-y-2">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <h2 className="text-sm font-heading font-bold text-white tracking-apple-tight">
            Pemantauan Keluarga Berbasis Persetujuan (Consent-First)
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Dirancang selaras dengan <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>. Data lokasi anak tidak dibagikan tanpa persetujuan dua arah dan dapat dicabut sewaktu-waktu.
        </p>
      </div>

      {/* 2. Pelajar Persona: Pairing Code & Consent Management */}
      {isStudent && (
        <div className="space-y-4">
          {/* Pairing Code Generator Box */}
          <div className="p-5 rounded-[20px] apple-card text-center space-y-3">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Kode Pairing Unik Anda
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-heading font-black tracking-widest text-amber-400 bg-black/30 px-5 py-2.5 rounded-[16px] border border-amber-500/30">
                {currentUser.pairing_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-blue-300 hover:text-white border border-white/10 transition-all btn-press"
                title="Salin Kode"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Berikan kode 6-digit ini kepada orang tua Anda untuk menautkan akun.
            </p>
          </div>

          {/* Active Family Links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
              Status Tautan Orang Tua
            </h3>

            {familyLinks.map((link) => (
              <div
                key={link.id}
                className="p-4.5 rounded-[18px] apple-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-apple-tight">{link.parent_nama}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Wali Murid / Orang Tua</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                    link.status === 'disetujui'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : link.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {link.status}
                  </span>
                </div>

                {link.status === 'pending' && (
                  <div className="p-3.5 rounded-[14px] bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-200">
                      Orang tua meminta izin melihat lokasi Anda.
                    </span>
                    <button
                      onClick={() => handleApproveLink(link.id)}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 btn-press"
                    >
                      Setujui
                    </button>
                  </div>
                )}

                {link.status === 'disetujui' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Lokasi aktif dibagikan
                    </span>
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="px-3.5 py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors btn-press"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Cabut Izin Akses
                    </button>
                  </div>
                )}

                {link.status === 'dicabut' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-xs text-rose-400">
                      Izin dicabut. Orang tua tidak dapat melihat lokasi.
                    </span>
                    <button
                      onClick={() => handleApproveLink(link.id)}
                      className="text-xs font-semibold text-blue-400 underline btn-press"
                    >
                      Aktifkan Lagi
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Orang Tua Persona: Input Pairing & Map View */}
      {isParent && (
        <div className="space-y-4">
          <form onSubmit={handlePairingSubmit} className="p-5 rounded-[20px] apple-card space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white tracking-apple-tight">
                Tautkan Akun Anak (Pairing 6-Digit)
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: SGP-8821"
                value={inputPairingCode}
                onChange={(e) => setInputPairingCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-full bg-black/30 border border-white/10 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-[#0066cc]"
              />
              <button
                type="submit"
                className="apple-button-primary text-xs px-5 py-2.5"
              >
                Kirim
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              *Masukkan kode yang ditampilkan di layar smartphone anak Anda.
            </p>
          </form>

          {/* Child Location Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Pemantauan Lokasi Anak
            </h3>

            {familyLinks.map((link) => (
              <div
                key={link.id}
                className="p-4.5 rounded-[18px] apple-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-apple-tight">{link.child_nama}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{link.child_sekolah}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                    link.status === 'disetujui'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {link.status}
                  </span>
                </div>

                {link.status === 'disetujui' && link.last_location ? (
                  <div className="p-3.5 rounded-[14px] bg-black/30 border border-white/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {link.last_location.alamat_perkiraan}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {link.last_location.updated_at}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInspectChildLocation(link)}
                      className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition-all btn-press"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Periksa Lokasi Terkini
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-[14px] bg-black/20 text-center text-xs text-slate-400">
                    {link.status === 'pending'
                      ? 'Menunggu persetujuan dari aplikasi anak.'
                      : 'Izin akses lokasi sedang dicabut oleh anak.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Access Audit Logs Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400" />
            Transparansi Log Akses (Audit Trail)
          </h3>
          <span className="text-[11px] text-slate-400">
            {familyLogs.length} Catatan
          </span>
        </div>

        <div className="space-y-2">
          {familyLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-[18px] apple-card space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{log.accessor_nama}</span>
                <span className="text-[10px] text-slate-400">{log.waktu_akses}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Melihat lokasi: <span className="text-emerald-400 font-semibold">{log.lokasi_dilihat}</span>
              </p>
              <p className="text-[10px] text-slate-500 italic">
                Tujuan: {log.tujuan_akses}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
