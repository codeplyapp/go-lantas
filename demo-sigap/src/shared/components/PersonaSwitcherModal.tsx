import React from 'react';
import { X, CheckCircle2, GraduationCap, School, ShieldCheck } from 'lucide-react';
import { MockDB } from '../../core/db';
import { UserRole } from '../../core/types';
import { sound } from '../services/sound';
import { NotificationService } from '../services/notification';

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonaSwitcherModal: React.FC<PersonaSwitcherModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentRole = MockDB.getActiveRole();
  const allUsers = MockDB.getAllUsers();

  const personas = [
    {
      role: 'pelajar' as UserRole,
      title: 'Pelajar (Remaja 16 Th)',
      name: allUsers.pelajar.nama,
      subtitle: allUsers.pelajar.sekolah_kampus,
      desc: 'Mencoba kuis SIM harian, naikkan streak & leaderboard, pantau izin lokasi anak.',
      icon: School,
      color: 'border-blue-500/40 bg-blue-950/40 text-blue-400',
      activeBadge: 'bg-blue-600 text-white',
    },
    {
      role: 'mahasiswa' as UserRole,
      title: 'Mahasiswa (Pemuda 20 Th)',
      name: allUsers.mahasiswa.nama,
      subtitle: allUsers.mahasiswa.sekolah_kampus,
      desc: 'Mobilitas tinggi antar kampus, cek kondisi kemacetan Banyuwangi, rute aman.',
      icon: GraduationCap,
      color: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-400',
      activeBadge: 'bg-indigo-600 text-white',
    },
    {
      role: 'orang_tua' as UserRole,
      title: 'Orang Tua / Wali Murid',
      name: allUsers.orang_tua.nama,
      subtitle: allUsers.orang_tua.kelas_jurusan,
      desc: 'Memasukkan kode pairing anak (SGP-8821), pantau rute anak dengan persetujuan dua arah.',
      icon: ShieldCheck,
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-400',
      activeBadge: 'bg-amber-600 text-white',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    sound.playClick();
    MockDB.setActiveRole(role);
    const user = allUsers[role];
    NotificationService.showInAppToast(
      'Persona Beralih',
      `Sekarang login sebagai ${user.nama} (${role.replace('_', ' ')})`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-card rounded-2xl p-5 border border-blue-500/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
            Demo Persona Switcher
          </span>
          <h2 className="text-lg font-heading font-extrabold text-white mt-2">
            Pilih Peran Pengguna
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ganti sudut pandang untuk menguji fitur Pelajar, Mahasiswa, atau Pemantauan Orang Tua.
          </p>
        </div>

        {/* Persona Option Cards */}
        <div className="space-y-3">
          {personas.map((item) => {
            const Icon = item.icon;
            const isSelected = currentRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-950/60 border-blue-400' 
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/70'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute top-3.5 right-3.5" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-amber-300/90">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.subtitle}</p>
                  <p className="text-[11px] text-slate-300/80 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            *Semua data disimpan di browser (localStorage) tanpa memerlukan login/akun.
          </p>
        </div>
      </div>
    </div>
  );
};
