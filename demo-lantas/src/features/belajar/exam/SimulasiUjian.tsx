import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  Award, RotateCcw, ArrowRight, ShieldCheck, FileText, Check, HelpCircle
} from 'lucide-react';
import { QuestionItem, ExamAttempt } from '../../../core/types';
import { SIM_EXAM_QUESTIONS, ALL_QUESTIONS } from '../../../data/questions';
import { authService } from '../../../services/auth';
import { firestoreService } from '../../../services/firestore';
import { sound } from '../../../shared/services/sound';

interface SimulasiUjianProps {
  onBack: () => void;
  onFinished?: (attempt: ExamAttempt) => void;
}

const TOTAL_QUESTIONS = 20;
const PASSING_PERCENT = 80;
const EXAM_DURATION_SECONDS = 15 * 60; // 15 Menit

export const SimulasiUjian: React.FC<SimulasiUjianProps> = ({
  onBack,
  onFinished
}) => {
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION_SECONDS);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamAttempt | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load previous exam attempts on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.uid) {
      firestoreService.getExamAttempts(user.uid).then((res) => {
        if (res && res.length > 0) setAttempts(res);
      }).catch(() => {});
    }
  }, []);

  // Initialize random 20 questions
  const startExam = () => {
    sound.playClick();
    const sourceQuestions = ALL_QUESTIONS && ALL_QUESTIONS.length >= TOTAL_QUESTIONS 
      ? ALL_QUESTIONS 
      : SIM_EXAM_QUESTIONS;
    const shuffled = [...sourceQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, TOTAL_QUESTIONS);
    
    setQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeRemaining(EXAM_DURATION_SECONDS);
    setIsSubmitted(false);
    setExamResult(null);
    setShowReview(false);
    setExamStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (examStarted && !isSubmitted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, isSubmitted]);

  const handleSelectOption = (optionIndex: number) => {
    sound.playClick();
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sound.playClick();

    let correctCount = 0;
    const reviewData = questions.map((q: QuestionItem, idx: number) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.jawaban_benar;
      if (isCorrect) correctCount += 1;
      return {
        questionId: q.id,
        userAnswer: selected !== undefined ? selected : -1,
        isCorrect
      };
    });

    const score = Math.round((correctCount / Math.max(1, questions.length)) * 100);
    const lulus = score >= PASSING_PERCENT;
    const durasiDetik = EXAM_DURATION_SECONDS - timeRemaining;

    const currentUser = authService.getCurrentUser();
    const attempt: ExamAttempt = {
      id: `exam_${Date.now()}`,
      uid: currentUser?.uid || 'guest',
      tanggal: new Date().toISOString(),
      skor: score,
      lulus,
      durasi_detik: durasiDetik,
      total_soal: questions.length,
      jawaban_benar: correctCount,
      detail: reviewData
    };

    setAttempts(prev => [attempt, ...prev]);

    // Firestore gamification & attempt write
    if (currentUser?.uid && currentUser.uid !== 'guest') {
      const pointsAwarded = lulus ? 150 : 30;
      firestoreService.saveExamAttempt(attempt);
      firestoreService.addPoints(currentUser.uid, pointsAwarded);
      firestoreService.registerActivity(currentUser.uid, { quizDone: true });
    }

    if (lulus) {
      sound.playSuccess();
    } else {
      sound.playLevelUp();
    }

    setExamResult(attempt);
    setIsSubmitted(true);
    if (onFinished) onFinished(attempt);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 1. LOBBY / INTRO VIEW ---
  if (!examStarted) {
    const bestScore = 0;
    const passedAttempts = 0;

    return (
      <div className="space-y-4 animate-fadeIn pb-6">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 btn-press transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <span className="text-xs font-extrabold text-slate-700">Simulasi Ujian Teori SIM Korlantas</span>
        </div>

        {/* Hero Card */}
        <div className="p-5 sm:p-7 rounded-[24px] apple-card bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0077c0]/10 text-[#0077c0] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                Simulasi Ujian Teori SIM Nasional
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Uji kesiapan pemahaman aturan lalu lintas, etika berkendara, marka, dan rambu sesuai kurikulum standar Korlantas POLRI dengan sistem waktu nyata.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold block uppercase tracking-wide">Jumlah Soal</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">20 Butir Soal</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold block uppercase tracking-wide">Batas Waktu</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">15 Menit</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold block uppercase tracking-wide">Kelulusan</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-700">Min. 80% (16 Benar)</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold block uppercase tracking-wide">Hadiah</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#0077C0]">+150 Poin GO Lantas</span>
            </div>
          </div>

          {/* Previous attempts info */}
          {attempts.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">Riwayat Ujian Anda</span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {attempts.length}x Percobaan • {passedAttempts}x Lulus
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0077c0] font-extrabold border border-blue-200">
                Skor Tertinggi: {bestScore}%
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={startExam}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0077C0] hover:bg-[#005fa3] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all btn-press"
            >
              <Award className="w-4 h-4" />
              <span>Mulai Simulasi Ujian Teori Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. RESULT & REVIEW VIEW ---
  if (isSubmitted && examResult) {
    const { skor, lulus, jawaban_benar, total_soal, durasi_detik } = examResult;

    return (
      <div className="space-y-4 animate-fadeIn pb-8">
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              setExamStarted(false);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 btn-press transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Menu Ujian</span>
          </button>
        </div>

        {/* Score Card */}
        <div className={`p-6 rounded-[24px] apple-card bg-white border ${
          lulus ? 'border-emerald-300' : 'border-amber-300'
        } text-center space-y-4 shadow-xs`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            lulus ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {lulus ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-extrabold uppercase tracking-wider ${
              lulus ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {lulus ? 'SELAMAT! ANDA LULUS SIMULASI' : 'BELUM MEMENUHI SYARAT KELULUSAN'}
            </span>
            <h2 className="text-3xl font-heading font-extrabold text-[#0F172A]">
              {skor}%
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {jawaban_benar} dari {total_soal} soal dijawab dengan benar (Batas kelulusan {PASSING_PERCENT}%)
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Durasi: {Math.floor(durasi_detik / 60)}m {durasi_detik % 60}d</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[#0077c0] font-extrabold">
              +{lulus ? 150 : 30} Poin GO Lantas
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
            <button
              onClick={() => setShowReview(!showReview)}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all btn-press"
            >
              <FileText className="w-4 h-4" />
              <span>{showReview ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan Lengkap'}</span>
            </button>
            <button
              onClick={startExam}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0077C0] hover:bg-[#005fa3] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all btn-press"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Simulasi Ujian</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Reviews */}
        {showReview && (
          <div className="space-y-3 animate-fadeIn pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              Pembahasan 20 Butir Soal Ujian
            </h3>

            {questions.map((q: QuestionItem, idx: number) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns === q.jawaban_benar;

              return (
                <div 
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-[20px] apple-card bg-white border ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  } space-y-3 shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {q.kategori.toUpperCase()}
                      </span>
                    </div>

                    {isCorrect ? (
                      <span className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Salah
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {q.pertanyaan}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {q.opsi.map((opt: string, oIdx: number) => {
                      const isOptionCorrect = oIdx === q.jawaban_benar;
                      const isOptionSelected = oIdx === userAns;

                      let style = "border-slate-100 bg-slate-50/50 text-slate-700";
                      if (isOptionCorrect) {
                        style = "border-emerald-300 bg-emerald-50/90 text-emerald-900 font-bold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        style = "border-rose-300 bg-rose-50/90 text-rose-900 line-through";
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${style}`}>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/80 border border-current text-[11px] font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isOptionCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pembahasan & UU (Flat, clean, no card-in-card) */}
                  <div className="pt-2.5 border-t border-slate-100 text-xs space-y-1">
                    {q.pasal_hukum && (
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#0077c0]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Dasar Hukum: {q.pasal_hukum}</span>
                      </div>
                    )}
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {q.penjelasan}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- 3. ACTIVE EXAM TEST VIEW ---
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentSelected = userAnswers[currentIndex];
  const isTimeCritical = timeRemaining < 120;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      {/* Top Bar with Timer and Progress */}
      <div className="p-3.5 sm:p-4 rounded-[20px] apple-card bg-white border border-[#E5EBE8] flex items-center justify-between gap-3 shadow-xs sticky top-2 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (window.confirm('Yakin ingin membatalkan ujian yang sedang berjalan?')) {
                sound.playClick();
                setExamStarted(false);
              }
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Soal Ujian</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              {currentIndex + 1} dari {questions.length}
            </span>
          </div>
        </div>

        {/* Timer pill */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold border flex items-center gap-1.5 transition-colors ${
          isTimeCritical 
            ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
            : 'bg-blue-50 text-[#0077c0] border-blue-200'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>

        {/* Submit quick button */}
        <button
          onClick={() => {
            sound.playClick();
            if (answeredCount < questions.length) {
              if (window.confirm(`Anda baru menjawab ${answeredCount} dari ${questions.length} soal. Yakin ingin mengumpulkan sekarang?`)) {
                handleSubmitExam();
              }
            } else {
              handleSubmitExam();
            }
          }}
          className="px-3.5 py-1.5 rounded-full bg-[#0077c0] hover:bg-[#005fa3] text-white text-xs font-extrabold transition-all btn-press shadow-2xs shrink-0"
        >
          Selesai & Kumpulkan
        </button>
      </div>

      {/* Question Palette (Jump Grid) */}
      <div className="p-3.5 rounded-[18px] apple-card bg-white border border-[#E5EBE8] space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-0.5">
          <span>Daftar Nomor Soal ({answeredCount}/{questions.length} Dijawab)</span>
          <span className="text-[10px] text-slate-400">Klik untuk lompat</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_: QuestionItem, idx: number) => {
            const isAnswered = userAnswers[idx] !== undefined;
            const isCurrent = idx === currentIndex;

            let btnClass = "bg-slate-100 text-slate-600 border-slate-200";
            if (isCurrent) {
              btnClass = "bg-[#0077c0] text-white border-[#0077c0] font-extrabold ring-2 ring-blue-300";
            } else if (isAnswered) {
              btnClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex(idx);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs border flex items-center justify-center transition-all ${btnClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-6 rounded-[24px] apple-card bg-white border border-[#E5EBE8] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold">
            Kategori: {currentQ.kategori.toUpperCase()}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Bobot: 1 Poin
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] leading-relaxed">
          {currentQ.pertanyaan}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          {currentQ.opsi.map((pilihan: string, oIdx: number) => {
            const isSelected = currentSelected === oIdx;

            return (
              <button
                key={oIdx}
                onClick={() => handleSelectOption(oIdx)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center gap-3 transition-all btn-press ${
                  isSelected
                    ? 'bg-[#0077c0]/10 border-[#0077c0] text-slate-900 shadow-2xs font-semibold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? 'bg-[#0077c0] text-white border-[#0077c0]'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {String.fromCharCode(65 + oIdx)}
                </div>
                <span className="text-xs sm:text-sm leading-snug flex-1">
                  {pilihan}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={() => {
            sound.playClick();
            setCurrentIndex((prev) => Math.max(0, prev - 1));
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-bold text-slate-700 transition-all"
        >
          Soal Sebelumnya
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => {
              sound.playClick();
              setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0077c0] hover:bg-[#005fa3] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all btn-press shadow-2xs"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              handleSubmitExam();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all btn-press shadow-2xs"
          >
            <span>Kumpulkan Ujian</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
