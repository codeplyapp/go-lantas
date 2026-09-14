import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Trophy, Flame, CheckCircle, XCircle, 
  ArrowRight, Lock, Unlock, Sparkles, BookOpen, RotateCcw,
  School, Globe, GraduationCap, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MockDB } from '../../core/db';
import { QuizQuestion, LeaderboardEntry, UserProfile } from '../../core/types';
import { QUIZ_LEVELS } from '../../data/quiz_questions';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

export const GameKuisView: React.FC = () => {
  const [subTab, setSubTab] = useState<'harian' | 'jalur' | 'leaderboard'>('harian');
  const [leaderboardScope, setLeaderboardScope] = useState<'sekolah' | 'kampus' | 'nasional'>('sekolah');
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(MockDB.getCurrentUser());
  const [questions, setQuestions] = useState<QuizQuestion[]>(MockDB.getQuizQuestions());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MockDB.getLeaderboard());

  // Active quiz session state
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(MockDB.getCurrentUser());
      setQuestions(MockDB.getQuizQuestions());
      setLeaderboard(MockDB.getLeaderboard());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  // Filter questions for active level or daily quiz
  const filteredQuestions = questions.filter(q => q.level === activeLevel);
  const currentQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.jawaban_benar;
    if (isCorrect) {
      sound.playCorrect();
      setSessionScore(prev => prev + currentQuestion.poin);
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0066cc', '#f59e0b', '#10b981']
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

    MockDB.recordQuizAttempt({
      uid: currentUser.uid,
      question_id: currentQuestion.id,
      level: currentQuestion.level,
      pilihan_user: index,
      benar: isCorrect,
      poin_didapat: currentQuestion.poin,
    });
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
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
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Apple-style Segmented Pill Navigation */}
      <div className="flex rounded-full p-1 bg-white/5 border border-white/10 backdrop-blur-md">
        <button
          onClick={() => { sound.playClick(); setSubTab('harian'); }}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 btn-press ${
            subTab === 'harian'
              ? 'bg-[#0066cc] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          Kuis SIM
        </button>

        <button
          onClick={() => { sound.playClick(); setSubTab('jalur'); }}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 btn-press ${
            subTab === 'jalur'
              ? 'bg-[#0066cc] text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          4 Level SIM
        </button>

        <button
          onClick={() => { sound.playClick(); setSubTab('leaderboard'); }}
          className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 btn-press ${
            subTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </button>
      </div>

      {/* --- TAB 1: KUIS INTERAKTIF --- */}
      {subTab === 'harian' && (
        <div className="space-y-4">
          {!quizCompleted ? (
            currentQuestion ? (
              <div className="apple-card p-5 space-y-4">
                {/* Header Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 uppercase">
                      Level {currentQuestion.level}: {currentQuestion.kategori}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Soal {currentQuestionIndex + 1}/{filteredQuestions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{currentQuestion.poin} Pts
                  </div>
                </div>

                {/* Progress Bar Pill */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0066cc] h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question Text */}
                <div className="py-2">
                  <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-apple-tight leading-relaxed">
                    {currentQuestion.pertanyaan}
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQuestion.opsi.map((option, idx) => {
                    const isChosen = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.jawaban_benar;
                    
                    let btnStyle = 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-500/30';
                      } else if (isChosen && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-950/70 text-rose-200 ring-2 ring-rose-500/30';
                      } else {
                        btnStyle = 'border-white/5 bg-black/20 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-3.5 rounded-[16px] border text-left text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 btn-press ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0 text-slate-200">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        )}
                        {isAnswered && isChosen && !isCorrect && (
                          <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {isAnswered && (
                  <div className="p-4 rounded-[18px] bg-[#151f38] border border-blue-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <BookOpen className="w-4 h-4" />
                      <span>Penjelasan Edukasi Korlantas:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentQuestion.penjelasan}
                    </p>
                    {currentQuestion.pasal_hukum && (
                      <div className="pt-1.5 text-[11px] text-blue-300 font-semibold border-t border-white/10">
                        ⚖️ Dasar Hukum: {currentQuestion.pasal_hukum}
                      </div>
                    )}

                    <button
                      onClick={handleNextQuestion}
                      className="w-full mt-3 py-3 px-4 apple-button-primary text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex < filteredQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Kuis'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            // Quiz Complete Result Card
            <div className="apple-card p-6 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
                  Level Selesai!
                </span>
                <h2 className="text-xl font-heading font-bold text-white mt-1 tracking-apple-tight">
                  Selamat, Sahabat SIGAP!
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Kamu telah menyelesaikan tantangan Level {activeLevel}. Poin dan peringkatmu di leaderboard telah diperbarui!
                </p>
              </div>

              {/* Score Recap */}
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-3.5 rounded-[16px] bg-black/20 border border-white/5">
                  <span className="text-xs text-slate-400">Poin Bertambah</span>
                  <p className="text-lg font-bold text-amber-400">+{sessionScore} Pts</p>
                </div>
                <div className="p-3.5 rounded-[16px] bg-black/20 border border-white/5">
                  <span className="text-xs text-slate-400">Total Poin Kamu</span>
                  <p className="text-lg font-bold text-[#2997ff]">{currentUser.poin_total} Pts</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleRestartQuiz(activeLevel)}
                  className="flex-1 py-3 apple-button-secondary text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ulangi Level
                </button>
                <button
                  onClick={() => setSubTab('leaderboard')}
                  className="flex-1 py-3 apple-button-primary text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Cek Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: JALUR BELAJAR (LEVEL 1-4) --- */}
      {subTab === 'jalur' && (
        <div className="space-y-3">
          <div className="p-4 rounded-[18px] apple-card text-xs text-slate-300 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="leading-relaxed">
              Selesaikan tiap level untuk membuka materi SIM berikutnya dan raih gelar <strong>Pelopor Keselamatan</strong>!
            </span>
          </div>

          <div className="space-y-3">
            {QUIZ_LEVELS.map((level) => {
              const isUnlocked = currentUser.poin_total >= level.min_poin_unlock;
              const isCurrent = activeLevel === level.level;

              return (
                <div
                  key={level.level}
                  className={`p-4.5 rounded-[18px] apple-card transition-all ${
                    !isUnlocked && 'opacity-60 bg-black/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-2xl border bg-gradient-to-br ${level.warna_tema}`}>
                        {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-apple-tight">{level.judul}</h3>
                          {isCurrent && isUnlocked && (
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {level.deskripsi}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                          <span>📝 {level.total_soal} Soal</span>
                          <span>⭐ Min. {level.min_poin_unlock} Poin</span>
                        </div>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => handleRestartQuiz(level.level)}
                        className="apple-button-primary text-xs px-4 py-1.5 shrink-0"
                      >
                        Mainkan
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        Terkunci
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
        <div className="space-y-3">
          {/* Scope Segmented Pill */}
          <div className="flex rounded-full p-1 bg-white/5 border border-white/10 text-xs backdrop-blur-md">
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('sekolah'); }}
              className={`flex-1 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 btn-press ${
                leaderboardScope === 'sekolah'
                  ? 'bg-[#0066cc] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              Per Sekolah
            </button>
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('kampus'); }}
              className={`flex-1 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 btn-press ${
                leaderboardScope === 'kampus'
                  ? 'bg-[#0066cc] text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Per Kampus
            </button>
            <button
              onClick={() => { sound.playClick(); setLeaderboardScope('nasional'); }}
              className={`flex-1 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 btn-press ${
                leaderboardScope === 'nasional'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Nasional
            </button>
          </div>

          <div className="p-3.5 rounded-[18px] apple-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Reset otomatis setiap <strong>Senin 00:00 WIB</strong></span>
            </div>
            <span className="text-[11px] text-slate-400">Minggu ke-2 Feb</span>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isMe = entry.is_current_user || entry.uid === currentUser.uid;
              let rankBadge = `${entry.peringkat}`;
              let rankStyle = 'bg-white/5 text-slate-400';

              if (entry.peringkat === 1) {
                rankBadge = '🥇';
                rankStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
              } else if (entry.peringkat === 2) {
                rankBadge = '🥈';
                rankStyle = 'bg-slate-300/20 text-slate-200 border border-slate-300/30';
              } else if (entry.peringkat === 3) {
                rankBadge = '🥉';
                rankStyle = 'bg-amber-700/20 text-amber-400 border border-amber-700/30';
              }

              return (
                <div
                  key={entry.uid}
                  className={`p-3.5 rounded-[18px] border flex items-center justify-between gap-3 transition-all ${
                    isMe
                      ? 'apple-card border-blue-500/60 shadow-lg ring-1 ring-blue-500/40 bg-[#151f38]'
                      : 'apple-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankStyle}`}>
                      {rankBadge}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white tracking-apple-tight">
                          {entry.nama}
                        </h4>
                        {isMe && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#0066cc] text-white">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {entry.sekolah_kampus}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-400">
                      <Sparkles className="w-3 h-3" />
                      <span>{entry.poin_minggu_ini} Pts</span>
                    </div>
                    <span className="text-[10px] text-orange-400 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                      <Flame className="w-2.5 h-2.5 fill-orange-400" />
                      {entry.streak_hari} hari
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
