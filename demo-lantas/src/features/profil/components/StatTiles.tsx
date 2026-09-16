import React from 'react';
import { UserProfile } from '../../../core/types';

interface StatTilesProps {
  user: UserProfile;
}

export const StatTiles: React.FC<StatTilesProps> = ({ user }) => {
  const akurasi =
    user.total_jawaban > 0
      ? Math.round((user.jawaban_benar / user.total_jawaban) * 100)
      : 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
      <div className="p-2 text-left sm:text-center">
        <span className="text-[11px] text-slate-400 font-bold block">Total Poin</span>
        <p className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
          {user.poin_total} <span className="text-xs font-bold text-slate-400">Pts</span>
        </p>
      </div>

      <div className="p-2 text-left sm:text-center sm:border-l sm:border-slate-100">
        <span className="text-[11px] text-slate-400 font-bold block">Streak Harian</span>
        <p className="text-base sm:text-lg font-extrabold text-[#0077c0] mt-0.5 tracking-tight">
          {user.streak_hari} <span className="text-xs font-bold text-[#0077c0]/70">Hari</span>
        </p>
      </div>

      <div className="p-2 text-left sm:text-center sm:border-l sm:border-slate-100">
        <span className="text-[11px] text-slate-400 font-bold block">Kuis Selesai</span>
        <p className="text-base sm:text-lg font-extrabold text-[#0077c0] mt-0.5 tracking-tight">
          {user.kuis_selesai} <span className="text-xs font-bold text-[#0077c0]/70">Soal</span>
        </p>
      </div>

      <div className="p-2 text-left sm:text-center sm:border-l sm:border-slate-100">
        <span className="text-[11px] text-slate-400 font-bold block">Akurasi Jawaban</span>
        <p className="text-base sm:text-lg font-extrabold text-[#0077c0] mt-0.5 tracking-tight">
          {akurasi}%
        </p>
      </div>
    </div>
  );
};
