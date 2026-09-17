import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Award, School, Building2, Globe2, 
  TrendingUp, UserCheck, ChevronRight, Sparkles 
} from 'lucide-react';
import { UserProfile } from '../../../core/types';
import { firestoreService } from '../../../services/firestore';
import { sound } from '../../../shared/services/sound';

type LeaderboardScope = 'nasional' | 'sekolah' | 'kampus';

interface LeaderboardUser {
  rank: number;
  uid: string;
  nama: string;
  avatar: string;
  sekolah: string;
  poin: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  profile?: UserProfile | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile }) => {
  const [scope, setScope] = useState<LeaderboardScope>('nasional');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const unsub = firestoreService.subscribeLeaderboard(
      (data) => {
        setUsers(data);
        setIsLoading(false);
      },
      {
        scope,
        school: profile?.sekolah_kampus,
        role: scope === 'sekolah' ? 'pelajar' : scope === 'kampus' ? 'mahasiswa' : undefined,
        limit: 50,
      }
    );

    return () => {
      if (unsub) unsub();
    };
  }, [scope, profile?.sekolah_kampus]);

  // Ensure current user is included if they have points in this scope
  let combinedList = [...users];
  if (profile && !combinedList.some((u) => u.uid === profile.uid)) {
    const matchesScope =
      scope === 'nasional' ||
      (scope === 'sekolah' && (profile.role === 'pelajar' || !profile.role)) ||
      (scope === 'kampus' && profile.role === 'mahasiswa');
    if (matchesScope) {
      combinedList.push(profile);
      combinedList.sort((a, b) => (b.poin_total || 0) - (a.poin_total || 0));
    }
  }

  const leaderboardList: LeaderboardUser[] = combinedList.map((item, idx) => ({
    rank: idx + 1,
    uid: item.uid,
    nama: item.nama || 'Pengguna GO Lantas',
    avatar: item.avatar_url || '/mascot/logo.png',
    sekolah: item.sekolah_kampus || 'Pelopor Keselamatan',
    poin: item.poin_total || 0,
    isCurrentUser: profile?.uid === item.uid,
  }));

  const currentUserItem = leaderboardList.find((u) => u.isCurrentUser);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Papan Peringkat GO Lantas Edukasi</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kumpulkan poin dari belajar modul, flashcard, studi kasus, dan simulasi ujian.
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-full self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setScope('nasional');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              scope === 'nasional'
                ? 'bg-white text-[#0077c0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Nasional</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setScope('sekolah');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              scope === 'sekolah'
                ? 'bg-white text-[#0077c0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Sekolah</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setScope('kampus');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              scope === 'kampus'
                ? 'bg-white text-[#0077c0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Kampus</span>
          </button>
        </div>
      </div>

      {/* User's Floating Summary Card */}
      {currentUserItem && (
        <div className="p-4 rounded-[20px] apple-card bg-gradient-to-r from-blue-500/10 via-[#0077c0]/10 to-sky-500/10 border border-[#0077c0]/30 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0077c0] text-white flex items-center justify-center text-sm font-extrabold shadow-xs shrink-0">
              #{currentUserItem.rank}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {currentUserItem.nama}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#0077c0] text-white">
                  Anda
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentUserItem.sekolah}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-heading font-extrabold text-[#0077c0] block">
              {currentUserItem.poin.toLocaleString('id-ID')} Poin
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Pelopor Keselamatan
            </span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-[22px] border border-[#E5EBE8] space-y-3">
          <div className="w-8 h-8 border-3 border-[#0077c0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Memuat data peringkat...</p>
        </div>
      ) : leaderboardList.length === 0 ? (
        /* Empty State */
        <div className="p-8 text-center bg-white rounded-[22px] border border-[#E5EBE8] space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-heading font-extrabold text-slate-900">
            Belum Ada Data Peringkat
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Jadilah yang pertama mengumpulkan poin keselamatan dengan menyelesaikan modul pembelajaran dan simulasi ujian!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Highlights */}
          {leaderboardList.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              {leaderboardList.slice(0, 3).map((item, idx) => {
                const podiumStyles = [
                  { rankBg: 'bg-amber-400 text-white', border: 'border-amber-300', label: 'Juara 1' },
                  { rankBg: 'bg-slate-300 text-slate-800', border: 'border-slate-300', label: 'Juara 2' },
                  { rankBg: 'bg-amber-600 text-white', border: 'border-amber-500/40', label: 'Juara 3' },
                ][idx];

                const isLogo = item.avatar.includes('logo.png') || !item.avatar.startsWith('http');

                return (
                  <div
                    key={item.uid}
                    className={`p-3 sm:p-4 rounded-[20px] apple-card bg-white border ${podiumStyles.border} text-center space-y-2 flex flex-col justify-between shadow-xs relative overflow-hidden`}
                  >
                    <div className="space-y-1">
                      <span className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-full flex items-center justify-center text-xs font-extrabold ${podiumStyles.rankBg}`}>
                        {idx + 1}
                      </span>
                      <div className="w-10 h-10 mx-auto rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src={item.avatar}
                          alt={item.nama}
                          className={`w-full h-full ${isLogo ? 'object-contain p-1' : 'object-cover'}`}
                          onError={(e) => { e.currentTarget.src = '/mascot/logo.png'; }}
                        />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                        {item.nama}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1">
                        {item.sekolah}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-[#0077c0] block">
                        {item.poin.toLocaleString('id-ID')} Poin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="p-4 sm:p-5 rounded-[22px] apple-card bg-white border border-[#E5EBE8] space-y-2.5 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              Daftar Peringkat {scope === 'nasional' ? 'Nasional' : scope === 'sekolah' ? 'Tingkat Sekolah' : 'Tingkat Kampus'}
            </h3>

            <div className="divide-y divide-slate-100">
              {leaderboardList.map((item) => {
                const isLogo = item.avatar.includes('logo.png') || !item.avatar.startsWith('http');
                return (
                  <div
                    key={item.uid}
                    className={`py-3 px-2 flex items-center justify-between gap-3 rounded-xl transition-colors ${
                      item.isCurrentUser ? 'bg-blue-50/60 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-800' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        item.rank === 3 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'
                      }`}>
                        #{item.rank}
                      </span>

                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                        <img
                          src={item.avatar}
                          alt={item.nama}
                          className={`w-full h-full ${isLogo ? 'object-contain p-0.5' : 'object-cover'}`}
                          onError={(e) => { e.currentTarget.src = '/mascot/logo.png'; }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {item.nama}
                          </span>
                          {item.isCurrentUser && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#0077c0] text-white shrink-0">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {item.sekolah}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-[#0077c0]">
                        {item.poin.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        poin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

