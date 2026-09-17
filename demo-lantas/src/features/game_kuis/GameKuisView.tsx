import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Trophy, Flame, CheckCircle, XCircle, 
  ArrowRight, Lock, Unlock, Award, BookOpen, RotateCcw,
  School, Globe, GraduationCap, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, UserProfile } from '../../core/types';
import { QUIZ_LEVELS, BANK_SOAL_KUIS } from '../../data/quiz_questions';
import { firestoreService } from '../../services/firestore';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

interface GameKuisViewProps {
  profile?: UserProfile | null;
}

export const GameKuisView: React.FC<GameKuisViewProps> = ({ profile }) => {
  const [subTab, setSubTab] = useState<'harian' | 'jalur' | 'leaderboard'>('harian');
  const [leaderboardScope, setLeaderboardScope] = useState<'sekolah' | 'kampus' | 'nasional'>('sekolah');
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);

  const safeUser: UserProfile = profile || {
    uid: 'guest',
    nama: 'Pengguna GO Lantas',
    role: 'pelajar',
    sekolah_kampus: '',
    poin_total: 0,
    streak_hari: 0,
    kuis_selesai: 0,
    jawaban_benar: 0,
    total_jawaban: 0,
    pairing_code: 'SGP-8821',
    created_at: new Date().toISOString(),
  };

  // Questions loaded from static data
  const allQuizQuestions: QuizQuestion[] = BANK_SOAL_KUIS;

  // Active quiz session state
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Filter questions for active level or daily quiz
  const filteredQuestions = allQuizQuestions.filter(q => q.level === activeLevel);
  const currentQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  useEffect(() => {
    if (subTab === 'leaderboard') {
      setIsLeaderboardLoading(true);
      const unsub = firestoreService.subscribeLeaderboard(
        (data) => {
          setLeaderboard(data);
          setIsLeaderboardLoading(false);
        },
        {
          scope: leaderboardScope,
          school: profile?.sekolah_kampus,
          role: leaderboardScope === 'sekolah' ? 'pelajar' : leaderboardScope === 'kampus' ? 'mahasiswa' : undefined,
          limit: 20,
        }
      );
      return () => {
        if (unsub) unsub();
      };
    }
  }, [subTab, leaderboardScope, profile?.sekolah_kampus]);

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.jawaban_benar;

    // Gamification persistence to Firestore
    if (safeUser.uid && safeUser.uid !== 'guest') {
      firestoreService.saveQuizAttempt({
        uid: safeUser.uid,
        question_id: currentQuestion.id,
        level: activeLevel,
        pilihan_user: index,
        benar: isCorrect,
        poin_didapat: isCorrect ? currentQuestion.poin : 0,
        timestamp: new Date().toISOString(),
      });
      firestoreService.registerActivity(safeUser.uid, { isCorrect });
      if (isCorrect) {
        firestoreService.addPoints(safeUser.uid, currentQuestion.poin);
        firestoreService.recordPointAward(
          safeUser.uid,
          'kuis_sim',
          `Kuis SIM Level ${activeLevel}`,
          currentQuestion.poin
        );
      }
    }

    if (isCorrect) {
      sound.playCorrect();
      setSessionScore(prev => prev + currentQuestion.poin);
      
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#0077c0', '#c7eeff', '#f59e0b', '#10b981']
      });

      NotificationService.showInAppToast(
        'Jawaban Tepat!',
        `+${currentQuestion.poin} Poin Keselamatan ditambahkan ke akunmu.`,
        'success'
      );
    } else {
      sound.playWrong();
      NotificationService.showInAppToast(
        'Jawaban Belum Tepat',
        'Pelajari penjelasan pasal hukum di bawah untuk memperdalam pemahamanmu.',
        'warning'
      );
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      if (safeUser.uid && safeUser.uid !== 'guest') {
        firestoreService.registerActivity(safeUser.uid, { quizDone: true });
      }
      sound.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestartQuiz = (levelNum: number) => {
    sound.playClick();
    setActiveLevel(levelNum);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionScore(0);
    setQuizCompleted(false);
    setSubTab('harian');
  };

  return (
    <div className="space-y-6 pb-4 animate-fadeIn">
      {/* Segmented Pill Navigation */}
      <div className="flex rounded-full p-1.5 bg-slate-100 border border-[#E5EBE8] shadow-xs">
        <button
          onClick={() => { sound.playClick(); setSubTab('harian'); }}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 btn-press ${
            subTab === 'harian'
              ? 'bg-[#0077C0] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Kuis SIM</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setSubTab('jalur'); }}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 btn-press ${
            subTab === 'jalur'
              ? 'bg-[#0077C0] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Jalur Level</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setSubTab('leaderboard'); }}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 btn-press ${
            subTab === 'leaderboard'
              ? 'bg-[#0077C0] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* --- TAB 1: KUIS SIM AKTIF --- */}
      {subTab === 'harian' && currentQuestion && (
        <div className="space-y-4">
          {!quizCompleted ? (
            <>
              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-[20px] apple-card bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#0077c0]/10 text-[#0077c0] font-extrabold uppercase tracking-wider">
                    Level {activeLevel} • Soal {currentQuestionIndex + 1}/{filteredQuestions.length}
                  </span>
                  <span className="font-extrabold text-[#0077c0] flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    +{currentQuestion.poin} Poin
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] leading-relaxed tracking-apple-tight">
                  {currentQuestion.pertanyaan}
                </h3>

                {/* Question Options */}
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.opsi.map((opsi, idx) => {
                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-[#0077c0] hover:bg-blue-50/40';
                    if (isAnswered) {
                      if (idx === currentQuestion.jawaban_benar) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      } else if (idx === selectedOption) {
                        btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-3.5 rounded-[14px] border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 btn-press ${btnStyle}`}
                      >
                        <span className="leading-snug">{opsi}</span>
                        {isAnswered && idx === currentQuestion.jawaban_benar && (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && idx === selectedOption && idx !== currentQuestion.jawaban_benar && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Law explanation */}
                {isAnswered && (
                  <div className="p-4 rounded-[14px] bg-blue-50/80 border border-blue-200 text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-[#0077c0] font-extrabold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Dasar Hukum & Pembahasan Korlantas</span>
                    </div>
                    {currentQuestion.pasal_hukum && (
                      <p className="font-mono text-[11px] font-bold text-slate-700">
                        {currentQuestion.pasal_hukum}
                      </p>
                    )}
                    <p className="text-slate-600 leading-relaxed">
                      {currentQuestion.penjelasan}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Button */}
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 apple-button-primary font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>{currentQuestionIndex < filteredQuestions.length - 1 ? 'Soal Berikutnya' : 'Selesaikan Kuis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            /* Quiz Completion Card */
            <div className="p-6 sm:p-8 rounded-[24px] apple-card bg-white text-center space-y-5 shadow-xs animate-fadeInScale">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-[#0077c0] uppercase tracking-widest">
                  Level Selesai!
                </span>
                <h2 className="text-xl font-heading font-extrabold text-[#0F172A] mt-1 tracking-apple-tight">
                  Selamat, Sahabat GO Lantas!
                </h2>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-md mx-auto font-medium">
                  Kamu telah menyelesaikan tantangan Level {activeLevel}. Poin dan peringkatmu di leaderboard telah diperbarui!
                </p>
              </div>

              {/* Score Recap */}
              <div className="grid grid-cols-2 divide-x divide-slate-100 py-3 border-y border-slate-100">
                <div className="px-3">
                  <span className="text-xs text-slate-500 font-bold">Poin Sesi Ini</span>
                  <p className="text-xl font-extrabold text-[#0077c0] mt-0.5">+{sessionScore} Pts</p>
                </div>
                <div className="px-3">
                  <span className="text-xs text-slate-500 font-bold">Total Poin Kamu</span>
                  <p className="text-xl font-extrabold text-[#0077C0] mt-0.5">{safeUser.poin_total} Pts</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleRestartQuiz(activeLevel)}
                  className="flex-1 py-3 apple-button-secondary text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ulangi Level Ini
                </button>
                <button
                  onClick={() => setSubTab('leaderboard')}
                  className="flex-1 py-3 apple-button-primary text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Cek Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: JALUR BELAJAR --- */}
      {subTab === 'jalur' && (
        <div className="space-y-4">
          <div className="p-4 rounded-[16px] apple-card bg-white text-xs text-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#0077C0] shrink-0" />
            <span className="leading-relaxed font-semibold">
              Selesaikan tiap level untuk membuka materi SIM berikutnya dan raih gelar <strong>Pelopor Keselamatan Lalu Lintas Korlantas</strong>!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUIZ_LEVELS.map((level) => {
              const isUnlocked = safeUser.poin_total >= level.min_poin_unlock;
              const isCurrent = activeLevel === level.level;

              return (
                <div
                  key={level.level}
                  className={`p-5 rounded-[16px] apple-card bg-white flex flex-col justify-between space-y-4 transition-all ${
                    !isUnlocked ? 'opacity-60 bg-slate-50' : 'hover:border-[#0077C0]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 rounded-xl border border-[#0077c0]/30 bg-[#0077c0]/10 text-[#0077c0] shadow-xs">
                        {isUnlocked ? <Unlock className="w-4.5 h-4.5 text-[#0077c0]" /> : <Lock className="w-4.5 h-4.5 text-slate-400" />}
                      </div>
                      {isCurrent && isUnlocked && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Sedang Aktif
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-[#0F172A] tracking-apple-tight">
                      {level.judul}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {level.deskripsi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      {level.total_soal} Butir Soal
                    </span>
                    {isUnlocked ? (
                      <button
                        onClick={() => handleRestartQuiz(level.level)}
                        className="text-xs font-bold text-[#0077c0] hover:underline flex items-center gap-1"
                      >
                        <span>Mulai Kuis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Butuh {level.min_poin_unlock} Poin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: LEADERBOARD MINGGUAN --- */}
      {subTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex rounded-full p-1 bg-slate-100 border border-[#E5EBE8] text-xs">
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('sekolah'); }}
              className={`flex-1 py-2 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 btn-press ${
                leaderboardScope === 'sekolah'
                  ? 'bg-[#0077C0] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Per Sekolah</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('kampus'); }}
              className={`flex-1 py-2 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 btn-press ${
                leaderboardScope === 'kampus'
                  ? 'bg-[#0077C0] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Per Kampus</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('nasional'); }}
              className={`flex-1 py-2 rounded-full font-extrabold transition-all flex items-center justify-center gap-1.5 btn-press ${
                leaderboardScope === 'nasional'
                  ? 'bg-[#0077C0] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Nasional</span>
            </button>
          </div>

          {isLeaderboardLoading ? (
            <div className="p-8 text-center bg-white rounded-[16px] border border-[#E5EBE8] space-y-2">
              <div className="w-6 h-6 border-2 border-[#0077c0] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Memuat peringkat...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[16px] border border-[#E5EBE8] space-y-2">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-xs font-extrabold text-slate-900">Belum Ada Data Peringkat</h4>
              <p className="text-[11px] text-slate-500">Selesaikan kuis untuk menjadi yang pertama masuk papan peringkat!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leaderboard.map((entry, idx) => {
                const isMe = entry.uid === safeUser.uid;
                const rankNum = idx + 1;

                return (
                  <div
                    key={entry.uid}
                    className={`p-4 rounded-[16px] bg-white border flex items-center justify-between gap-3 transition-all ${
                      isMe
                        ? 'apple-card border-[#0077C0] shadow-sm ring-2 ring-[#0077C0]/20 bg-[#F0F9FF]'
                        : 'apple-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold bg-slate-100 text-slate-700">
                        {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-extrabold text-[#0F172A]">
                            {entry.nama}
                          </h4>
                          {isMe && (
                            <span className="text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-[#0077C0] text-white">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate max-w-[150px]">
                          {entry.sekolah_kampus || 'Pelopor Keselamatan'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 text-xs font-extrabold text-[#0077c0]">
                        <Award className="w-3 h-3 text-[#0077c0]" />
                        <span>{entry.poin_total || 0} Pts</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-extrabold flex items-center justify-end gap-0.5 mt-0.5">
                        <Flame className="w-2.5 h-2.5 text-[#0077c0]" />
                        {entry.streak_hari || 0} hari
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameKuisView;
