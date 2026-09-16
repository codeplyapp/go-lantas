import React, { useState, useRef, useEffect } from 'react';
import { User, School, Camera, ShieldCheck } from 'lucide-react';
import { Sheet } from '../../../shared/components/Sheet';
import { AvatarRing } from '../../../shared/components/AvatarRing';
import { Btn } from '../../../shared/components/Btn';
import { UserProfile } from '../../../core/types';
import { firestoreService } from '../../../services/firestore';
import { NotificationService } from '../../../shared/services/notification';
import { sound } from '../../../shared/services/sound';

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdated?: (partial: Partial<UserProfile>) => void;
}

export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}) => {
  const [nama, setNama] = useState(user.nama);
  const [sekolah, setSekolah] = useState(user.sekolah_kampus);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar_url);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNama(user.nama);
      setSekolah(user.sekolah_kampus);
      setAvatarPreview(user.avatar_url);
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        NotificationService.showInAppToast(
          'Ukuran Terlalu Besar',
          'Silakan pilih foto profil dengan ukuran di bawah 2MB.',
          'warning'
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      NotificationService.showInAppToast(
        'Nama Wajib Diisi',
        'Silakan masukkan nama lengkap pengguna.',
        'warning'
      );
      return;
    }

    setIsLoading(true);
    try {
      const partial: Partial<UserProfile> = {
        nama: nama.trim(),
        sekolah_kampus: sekolah.trim(),
        avatar_url: avatarPreview,
      };
      await firestoreService.updateUserProfile(user.uid, partial);
      onUpdated?.(partial);

      sound.playCorrect();
      NotificationService.showInAppToast(
        'Profil Diperbarui',
        'Data identitas dan foto profil Anda berhasil disimpan.',
        'success'
      );
      onClose();
    } catch {
      NotificationService.showInAppToast(
        'Gagal Menyimpan',
        'Terjadi kesalahan saat menyimpan profil. Coba lagi.',
        'warning'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel =
    user.role === 'pelajar'
      ? 'Pelajar SMA/SMK'
      : user.role === 'mahasiswa'
      ? 'Mahasiswa'
      : 'Orang Tua / Wali';

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil"
      subtitle="Perbarui identitas dan foto profil akun GO Lantas Anda"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center justify-center pt-1 pb-2">
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <AvatarRing
              src={avatarPreview}
              alt={nama || 'User'}
              size="xl"
              editable
              onEditClick={() => fileInputRef.current?.click()}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2.5 text-xs font-bold text-[#0077c0] hover:text-[#005a91] inline-flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Pilih Foto Baru</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077c0]/20 focus:border-[#0077c0] transition-all"
                required
              />
            </div>
          </div>

          {/* Sekolah / Kampus / Instansi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Asal Sekolah / Kampus / Instansi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <School className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={sekolah}
                onChange={(e) => setSekolah(e.target.value)}
                placeholder="Contoh: SMAN 2 Taruna Bhayangkara"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077c0]/20 focus:border-[#0077c0] transition-all"
              />
            </div>
          </div>

          {/* Role Indicator (Read Only) */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Peran Akun
            </label>
            <div className="py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0077c0]" />
                <span className="text-xs font-bold text-slate-800">{roleLabel}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0077c0]" />
                Verified Go Lantas
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          <Btn
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Btn>
          <Btn
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            Simpan Perubahan
          </Btn>
        </div>
      </form>
    </Sheet>
  );
};
