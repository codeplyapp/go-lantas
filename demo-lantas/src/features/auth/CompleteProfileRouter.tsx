import React, { useState } from 'react';
import { School, GraduationCap, Users, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import { UserRole, UserProfile } from '../../core/types';
import { sound } from '../../shared/services/sound';

interface CompleteProfileRouterProps {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  onCompleted: (profile: UserProfile) => void;
}

export const CompleteProfileRouter: React.FC<CompleteProfileRouterProps> = ({ 
  user, 
  onCompleted 
}) => {
  const [nama, setNama] = useState<string>(user.displayName || '');
  const [role, setRole] = useState<UserRole>('pelajar');
  const [sekolahKampus, setSekolahKampus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMessage('Mohon lengkapi nama Anda.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    try {
      const profile = await firestoreService.ensureUserProfile(user.uid, {
        email: user.email || '',
        nama: nama.trim(),
        role,
        sekolah_kampus: sekolahKampus.trim(),
        avatar_url: user.photoURL || '/mascot/logo.png',
      });

      sound.playCorrect();
      onCompleted(profile);
    } catch (err: any) {
      sound.playWrong();
      setErrorMessage(err?.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#DDE6E2] shadow-[0_10px_35px_rgba(0,119,192,0.06)] p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 text-[#0077C0] mx-auto flex items-center justify-center shadow-xs">
            <UserCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-heading font-black text-[#0F172A]">
            Lengkapi Profil GO Lantas
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Satu langkah lagi! Tentukan peran Anda untuk pengalaman belajar yang dipersonalisasi.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full px-4 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0077C0] focus:bg-white"
            />
          </div>

          {/* Role Picker (3 Options) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Pilih Peran Akun
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('pelajar');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                  role === 'pelajar'
                    ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                    : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                }`}
              >
                <School className="w-4 h-4" />
                <span className="text-[11px] font-bold">Pelajar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('mahasiswa');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                  role === 'mahasiswa'
                    ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                    : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="text-[11px] font-bold">Mahasiswa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('orang_tua');
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                  role === 'orang_tua'
                    ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                    : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-bold">Orang Tua</span>
              </button>
            </div>
          </div>

          {/* School / Campus Name */}
          {(role === 'pelajar' || role === 'mahasiswa') && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                {role === 'pelajar' ? 'Nama Sekolah (SMP/SMA)' : 'Nama Universitas / Kampus'}
              </label>
              <input
                type="text"
                placeholder={role === 'pelajar' ? 'Contoh: SMAN 2 Taruna Bhayangkara' : 'Contoh: Universitas Airlangga'}
                value={sekolahKampus}
                onChange={(e) => setSekolahKampus(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0077C0] focus:bg-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] disabled:opacity-50 text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md btn-press mt-2"
          >
            {isLoading ? (
              <span>Menyimpan Profil...</span>
            ) : (
              <>
                <span>Mulai Akses Penuh GO Lantas</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
