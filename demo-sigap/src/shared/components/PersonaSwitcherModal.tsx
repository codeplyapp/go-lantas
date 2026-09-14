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
      <div className="w-full max-w-sm bg-[#0c1322]/95 backdrop-blur-2xl rounded-[28px] p-5 border border-white/10 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors btn-press"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="text-center mb-5">
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 uppercase tracking-wider">
            Demo Persona Switcher
          </span>
          <h2 className="text-base font-heading font-bold text-white mt-2 tracking-apple-tight">
            Pilih Peran Pengguna
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Uji fitur dari perspektif Pelajar, Mahasiswa, atau Pemantauan Orang Tua.
          </p>
        </div>

        {/* Persona Option Cards */}
        <div className="space-y-2.5">
          {personas.map((item) => {
            const Icon = item.icon;
            const isSelected = currentRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`p-3.5 rounded-[18px] border transition-all cursor-pointer flex items-start gap-3 relative btn-press ${
                  isSelected 
                    ? 'ring-2 ring-[#0066cc] bg-[#151f38] border-blue-400/80 shadow-lg' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`p-2.5 rounded-2xl border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white tracking-apple-tight">{item.name}</h3>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute top-3.5 right-3.5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-amber-300 mt-0.5">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.subtitle}</p>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-400">
            *Semua data disimpan di browser (localStorage) tanpa akun/login.
          </p>
        </div>
      </div>
    </div>
  );
};
