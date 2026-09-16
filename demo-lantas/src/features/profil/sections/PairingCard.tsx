import React, { useState } from 'react';
import { Copy, Check, Users, QrCode, ArrowRight } from 'lucide-react';
import { UserProfile, FamilyLink } from '../../../core/types';
import { Card } from '../../../shared/components/Card';
import { Sheet } from '../../../shared/components/Sheet';
import { Btn } from '../../../shared/components/Btn';
import { NotificationService } from '../../../shared/services/notification';
import { sound } from '../../../shared/services/sound';

interface PairingCardProps {
  user: UserProfile;
}

export const PairingCard: React.FC<PairingCardProps> = ({ user }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [familyLinks] = useState<FamilyLink[]>([]);

  const pairingCode = user.pairing_code || 'SGP-8821';

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingCode);
    setIsCopied(true);
    sound.playClick();
    NotificationService.showInAppToast(
      'Kode Disalin',
      `Kode pairing keluarga ${pairingCode} berhasil disalin ke papan klip.`,
      'success'
    );
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    sound.playClick();
    NotificationService.showInAppToast(
      'Fitur Segera Hadir',
      'Hubungan keluarga berbasis Firestore akan tersedia di Fase B. Kode pairing Anda sudah disiapkan.',
      'info'
    );
    setInputCode('');
  };

  const activeLinks = familyLinks.filter(
    (l) => l.child_uid === user.uid || l.parent_uid === user.uid
  );

  return (
    <>
      <Card className="space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0077c0]/10 text-[#0077c0] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            KODE PAIRING KELUARGA
          </span>
        </div>

        {/* Big Letter-Spaced Code Display (Flat, no card-in-card) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Kode Unik Perangkat</p>
            <p className="text-xl sm:text-2xl font-mono font-extrabold text-[#0077c0] tracking-widest mt-0.5">
              {pairingCode}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
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

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500 max-w-[280px]">
            Bagikan kode ini untuk menghubungkan pemantauan lokasi aman keluarga.
          </p>

          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="text-xs font-bold text-[#0077c0] hover:text-[#005a91] inline-flex items-center gap-1 transition-colors shrink-0"
          >
            <span>Kelola Relasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* Family Pairing Modal Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Relasi Keluarga & Pairing"
        subtitle="Hubungkan akun pelajar dan orang tua untuk perlindungan rute presisi"
      >
        <div className="space-y-5">
          {/* Active Family Members */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Tautan Keluarga Aktif ({activeLinks.length})
            </h4>

            {activeLinks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-xl">
                Belum ada anggota keluarga yang terhubung.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50">
                {activeLinks.map((link) => (
                  <div key={link.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {user.role === 'orang_tua' ? link.child_nama : link.parent_nama}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {user.role === 'orang_tua' ? link.child_sekolah : 'Orang Tua / Wali'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          link.status === 'disetujui'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <span className="text-[11px] font-bold capitalize text-slate-600">
                        {link.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connect Another Code */}
          <form onSubmit={handlePairSubmit} className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hubungkan Kode Keluarga Lain
            </h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: SGP-8821"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077c0]/20 uppercase"
                />
              </div>
              <Btn type="submit" variant="primary" size="md">
                Hubungkan
              </Btn>
            </div>
            <p className="text-[11px] text-slate-400">
              Setiap penautan rute dilindungi UU PDP dengan persetujuan ganda (*dual consent*).
            </p>
          </form>
        </div>
      </Sheet>
    </>
  );
};
