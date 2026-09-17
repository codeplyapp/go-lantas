import React, { useState } from 'react';
import { 
  ChevronLeft, CheckCircle, XCircle, ArrowRight, RotateCcw, 
  Award, BookOpen, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { QuizQuestion, ModuleProgress, ModuleData } from '../../../core/types';
import { firestoreService } from '../../../services/firestore';
import { authService } from '../../../services/auth';
import { sound } from '../../../shared/services/sound';
import { NotificationService } from '../../../shared/services/notification';
import { CURRICULUM_TIERS } from '../../../data/tiers';
import confetti from 'canvas-confetti';

interface QuizModuleProps {
  module?: ModuleData;
  moduleId: string;
  moduleTitle: string;
  questions: QuizQuestion[];
  progress: ModuleProgress;
  onBack: () => void;
  onQuizCompleted: (updatedProgress: ModuleProgress) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({
  module,
  moduleId,
  moduleTitle,
  questions,
  progress,
  onBack,
  onQuizCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selected: number; isCorrect: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const tierKey = module?.tier || 'dasar';
  const tierConfig = CURRICULUM_TIERS[tierKey];

  const passingGrade = module?.passing_grade || tierConfig.passingGrade || 70;
  const pointPerQuestion = tierConfig.pointPerQuestion || 20;
  const bonusConfig = module?.bonus_points || tierConfig.bonusPoints;

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length || 1;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.jawaban_benar;
    const uid = authService.getCurrentUser()?.uid;

    if (uid) {
      firestoreService.saveQuizAttempt({
        uid,
        question_id: currentQ.id,
        level: tierKey === 'lanjutan' || tierKey === 'berkelanjutan' ? 3 : tierKey === 'menengah' ? 2 : 1,
        pilihan_user: idx,
        benar: isCorrect,
        poin_didapat: isCorrect ? pointPerQuestion : 0,
        timestamp: new Date().toISOString(),
      });
      firestoreService.registerActivity(uid, { isCorrect });
      if (isCorrect) {
        firestoreService.addPoints(uid, pointPerQuestion);
        firestoreService.recordPointAward(
          uid,
          'kuis_modul',
          `Kuis Modul: ${module?.judul || 'Modul Keselamatan'}`,
          pointPerQuestion
        );
      }
    }

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    setUserAnswers(prev => [
      ...prev,
      { questionId: currentQ.id, selected: idx, isCorrect }
    ]);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= passingGrade;
    const bonusPoints = passed
      ? (!progress.kuis_passed ? bonusConfig.first_pass : bonusConfig.repeat_pass)
      : bonusConfig.fail;

    const uid = authService.getCurrentUser()?.uid;

    if (passed) {
      sound.playLevelUp();
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.65 },
      });
      NotificationService.showInAppToast(
        'Lulus Kuis Modul! 🏆',
        `Skor Anda: ${score}%. ${!progress.kuis_passed ? `Bonus +${bonusConfig.first_pass} Poin ditambahkan!` : `+${bonusConfig.repeat_pass} Poin ulangan ditambahkan.`}`,
        'success'
      );
    } else {
      NotificationService.showInAppToast(
        'Belum Memenuhi Passing Grade',
        `Skor Anda: ${score}% (Minimal ${passingGrade}%). +${bonusConfig.fail} Poin partisipasi ditambahkan. Pelajari kembali pembahasannya dan coba lagi.`,
        'warning'
      );
    }

    // Update progress locally and Firestore
    const updatedProgress: ModuleProgress = {
      ...progress,
      moduleId,
      tier: tierKey,
      kuis_attempts: (progress.kuis_attempts || 0) + 1,
      kuis_best: Math.max(progress.kuis_best || 0, score),
      kuis_passed: progress.kuis_passed || passed,
      last_study: new Date().toISOString(),
    };

    if (uid) {
      firestoreService.addPoints(uid, bonusPoints);
      firestoreService.recordPointAward(
        uid,
        'bonus_modul',
        `Bonus ${passed ? 'Lulus Modul' : 'Partisipasi'}: ${module?.judul || 'Modul Keselamatan'}`,
        bonusPoints
      );
      firestoreService.registerActivity(uid, { quizDone: true });
      firestoreService.updateModuleProgress(uid, moduleId, updatedProgress);
    }

    onQuizCompleted(updatedProgress);
    setIsFinished(true);
  };

  const handleRetry = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
  };

  // 1. Result View
  if (isFinished) {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= passingGrade;

    return (
      <div className="space-y-4 pb-6 animate-fadeIn">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all btn-press"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Modul</span>
          </button>
          <span className="text-xs font-bold text-slate-500">Hasil Evaluasi • {tierConfig.nama}</span>
        </div>

        {/* Score Summary Card */}
        <div className={`p-5 sm:p-6 rounded-[22px] apple-card text-center space-y-3 ${
          passed ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-b from-rose-50 to-white border-rose-200'
        }`}>
          <div className="inline-flex p-3 rounded-full bg-white shadow-xs">
            {passed ? (
              <Award className="w-10 h-10 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-rose-600" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
              {passed ? 'Selamat! Anda Lulus Kuis Modul' : 'Belum Mencapai Nilai Kelulusan'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {moduleTitle} • Passing Grade: {passingGrade}%
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 py-2">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">{score}%</span>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">Skor Akhir</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">{correctCount}/{totalQuestions}</span>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">Jawaban Benar</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={handleRetry}
              className="flex-1 py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all btn-press"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis</span>
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all btn-press"
            >
              <span>Lanjut ke Modul</span>
            </button>
          </div>
        </div>

        {/* Detail Pembahasan Soal */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#0F172A] border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-[#0077c0]" />
            <h3 className="text-xs sm:text-sm font-extrabold tracking-apple-tight">
              Pembahasan Lengkap & Dasar Hukum
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => {
              const answer = userAnswers.find(a => a.questionId === q.id);
              const isCorrect = answer?.isCorrect;

              return (
                <div key={q.id} className="py-3.5 space-y-2 text-xs first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-900 leading-snug">
                      {idx + 1}. {q.pertanyaan}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 flex items-center gap-1 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isCorrect ? 'Benar' : 'Salah'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11.5px] text-slate-700 pl-3 border-l-2 border-slate-200">
                    <p>
                      <strong>Kunci Jawaban:</strong> <span className="text-emerald-700 font-bold">{q.opsi[q.jawaban_benar]}</span>
                    </p>
                    <p className="leading-relaxed text-slate-600">
                      💡 {q.penjelasan}
                    </p>
                    {q.pasal_hukum && (
                      <p className="text-[10.5px] font-bold text-[#0077c0] pt-0.5">
                        ⚖️ Rujukan: {q.pasal_hukum}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Question View
  return (
    <div className="space-y-4 pb-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all btn-press"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Keluar</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-extrabold text-[#0077c0]">
            Soal {currentIndex + 1} dari {totalQuestions}
          </span>
          <p className="text-[10px] text-slate-400 font-semibold">{moduleTitle}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
        <div 
          className="bg-[#0077c0] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-6 rounded-[20px] apple-card bg-white space-y-4 shadow-xs border-[#E5EBE8]">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Kategori: {currentQ.kategori.toUpperCase()}</span>
          <span className="text-[#0077c0]">+{pointPerQuestion} Poin / Benar</span>
        </div>

        <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] leading-relaxed">
          {currentQ.pertanyaan}
        </h3>

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          {currentQ.opsi.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.jawaban_benar;
            
            let btnStyle = 'border-slate-200 hover:border-[#0077c0] bg-white text-slate-800';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-200';
              } else if (isSelected) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-200';
              } else {
                btnStyle = 'border-slate-200 bg-slate-50 opacity-60 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between gap-3 transition-all btn-press ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    isSelected ? 'bg-[#0077c0] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Explanation Callout */}
        {isAnswered && (
          <div className="pt-3.5 border-t border-slate-100 space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0077c0]" />
              <span>Penjelasan Resmi:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs font-medium pl-5.5">
              {currentQ.penjelasan}
            </p>
            {currentQ.pasal_hukum && (
              <p className="text-[11px] font-bold text-[#0077c0] pl-5.5 pt-0.5">
                ⚖️ Dasar Hukum: {currentQ.pasal_hukum}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <div className="pt-2 animate-fadeIn">
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 px-4 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all btn-press"
          >
            <span>{currentIndex < totalQuestions - 1 ? 'Soal Selanjutnya' : 'Lihat Hasil Kuis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
