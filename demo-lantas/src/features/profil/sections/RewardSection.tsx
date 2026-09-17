import React, { useState, useEffect } from 'react';
import { Trophy, History, Award, Flame, Star, CheckCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { UserProfile, LeaderboardEntry, QuizAttempt } from '../../../core/types';
import { firestoreService } from '../../../services/firestore';
import { authService } from '../../../services/auth';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { Card } from '../../../shared/components/Card';
import { FieldRow } from '../../../shared/components/FieldRow';
import { Sheet } from '../../../shared/components/Sheet';
import { Btn } from '../../../shared/components/Btn';

interface RewardSectionProps {
  user: UserProfile;
}

export const RewardSection: React.FC<RewardSectionProps> = ({ user }) => {
  const [activeSheet, setActiveSheet] = useState<'leaderboard' | 'history' | 'certificate' | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [myRank, setMyRank] = useState<number>(0);

  useEffect(() => {
    const unsubLb = firestoreService.subscribeLeaderboard((entries) => {
      setLeaderboard(entries);
      const rank = entries.findIndex((e) => e.uid === user.uid);
      setMyRank(rank >= 0 ? rank + 1 : 0);
    }, { limit: 20 });

    const unsubAttempts = firestoreService.subscribeQuizAttempts(user.uid, (data) => {
      setAttempts(data);
    }, 20);

    return () => {
      if (unsubLb) unsubLb();
      if (unsubAttempts) unsubAttempts();
    };
  }, [user.uid]);

  return (
    <div>
      <SectionHeader title="POIN & PENGHARGAAN" />
      <Card noPadding className="divide-y divide-slate-100">
        {/* 1. Posisi Leaderboard */}
        <FieldRow
          icon={<Trophy className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Posisi Leaderboard"
          subtitle="Peringkat mingguan pelajar se-Banyuwangi"
          trailing={
            <span className="text-xs font-extrabold text-[#0077c0]">
              #{myRank}
            </span>
          }
          onClick={() => setActiveSheet('leaderboard')}
        />

        {/* 2. Riwayat Poin */}
        <FieldRow
          icon={<History className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Riwayat Poin"
          subtitle="Catatan skor dari kuis rambu & etika"
          onClick={() => setActiveSheet('history')}
        />

        {/* 3. Sertifikat / Penghargaan */}
        <FieldRow
          icon={<Award className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Sertifikat & Penghargaan"
          subtitle="Insignia Duta Pelopor Keselamatan"
          trailing={
            <span className="text-xs font-extrabold text-orange-600 inline-flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" />
              {user.streak_hari} Hari
            </span>
          }
          onClick={() => setActiveSheet('certificate')}
        />
      </Card>

      {/* 1. Leaderboard Sheet */}
      <Sheet
        isOpen={activeSheet === 'leaderboard'}
        onClose={() => setActiveSheet(null)}
        title="Leaderboard Mingguan"
        subtitle="Peringkat keaktifan literasi keselamatan Korlantas POLRI"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0077c0] to-[#005a91] text-white flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-white/80 font-medium">Peringkat Anda Saat Ini</p>
              <p className="text-lg font-extrabold mt-0.5">#{myRank} • {user.nama}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80 font-medium">Total Skor</p>
              <p className="text-lg font-mono font-extrabold">{user.poin_total} Pts</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-white">
            {leaderboard.slice(0, 10).map((entry, idx) => (
              <div
                key={entry.uid}
                className={`p-3 flex items-center justify-between text-xs ${
                  entry.uid === user.uid
                    ? 'bg-[#0077c0]/5 font-bold'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{entry.nama}</p>
                    <p className="text-[10px] text-slate-400">{entry.sekolah_kampus}</p>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-[#0077c0]">
                  {entry.poin_total || 0} Pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* 2. Riwayat Poin Sheet */}
      <Sheet
        isOpen={activeSheet === 'history'}
        onClose={() => setActiveSheet(null)}
        title="Riwayat Poin Kuis"
        subtitle="Aktivitas penyelesaian modul kuis keselamatan lalu lintas"
      >
        <div className="space-y-3">
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Star className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Belum ada riwayat kuis terbaru.</p>
              <p className="text-[11px] text-slate-400">Selesaikan kuis di tab Belajar untuk mendapatkan poin!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-white">
              {attempts.slice(-10).reverse().map((att) => (
                <div key={att.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#0077c0]/10 text-[#0077c0]"
                    >
                      {att.benar ? <CheckCircle className="w-4 h-4 text-[#0077c0]" /> : <History className="w-4 h-4 text-[#0077c0]" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {att.benar ? 'Jawaban Benar' : 'Belum Tepat'} • Level {att.level}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(att.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold ${
                      att.benar ? 'text-[#0077c0]' : 'text-slate-400'
                    }`}
                  >
                    {att.benar ? `+${att.poin_didapat} Pts` : '+0 Pts'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Sheet>

      {/* 3. Sertifikat Sheet */}
      <Sheet
        isOpen={activeSheet === 'certificate'}
        onClose={() => setActiveSheet(null)}
        title="Sertifikat & Insignia"
        subtitle="Apresiasi Pelopor Keselamatan dari Korlantas POLRI"
      >
        <div className="space-y-4 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-[#0077c0]/30 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0077c0]/10 text-[#0077c0] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                Sertifikat Generasi Sadar Lalu Lintas
              </h4>
              <p className="text-xs text-[#0077c0] font-bold mt-0.5">
                Korlantas POLRI Presisi 2026
              </p>
            </div>

            <div className="py-2 text-xs text-slate-600 leading-relaxed">
              Diberikan kepada <span className="font-bold text-slate-900">{user.nama}</span> atas kedisiplinan dan literasi keselamatan berkendara di jalan raya dengan streak <span className="font-bold text-orange-600">{user.streak_hari} hari</span>.
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>ID: SGP-CERT-{user.uid.slice(-4).toUpperCase()}</span>
              <span>STATUS: TERVERIFIKASI</span>
            </div>
          </div>

          <Btn
            variant="primary"
            className="w-full"
            onClick={() => setActiveSheet(null)}
          >
            Tutup
          </Btn>
        </div>
      </Sheet>
    </div>
  );
};
