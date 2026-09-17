import React, { useState } from 'react';
import { 
  ChevronLeft, Brain, CheckCircle2, AlertTriangle, 
  Award, ShieldCheck, ArrowRight, Lightbulb 
} from 'lucide-react';
import { CaseStudyItem, ModuleProgress } from '../../../core/types';
import { firestoreService } from '../../../services/firestore';
import { authService } from '../../../services/auth';
import { sound } from '../../../shared/services/sound';
import { NotificationService } from '../../../shared/services/notification';
import confetti from 'canvas-confetti';

interface CaseStudyProps {
  moduleId: string;
  cases: CaseStudyItem[];
  progress: ModuleProgress;
  onBack: () => void;
  onProgressUpdated: (updatedProgress: ModuleProgress) => void;
}

export const CaseStudy: React.FC<CaseStudyProps> = ({
  moduleId,
  cases,
  progress,
  onBack,
  onProgressUpdated,
}) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);

  const activeCase = cases[currentCaseIndex] || cases[0];
  const isCaseCompleted = progress.cases_done.includes(activeCase?.id || '');

  const handleSelectOption = (index: number) => {
    if (isEvaluated) return;
    sound.playClick();
    setSelectedOption(index);
    setIsEvaluated(true);

    const chosen = activeCase.opsi[index];
    const isSafest = chosen.skor_aman >= 80;

    const updatedProgress: ModuleProgress = {
      ...progress,
      cases_done: progress.cases_done.includes(activeCase.id)
        ? progress.cases_done
        : [...progress.cases_done, activeCase.id],
      last_study: new Date().toISOString(),
    };

    // Firestore gamification: +25 points on first safest case study choice
    const uid = authService.getCurrentUser()?.uid;
    if (!isCaseCompleted && isSafest && uid) {
      firestoreService.addPoints(uid, 25);
      firestoreService.registerActivity(uid, { quizDone: false });
      firestoreService.updateModuleProgress(uid, moduleId, updatedProgress);
    }

    if (isSafest) {
      sound.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      NotificationService.showInAppToast(
        'Keputusan Sangat Bijak! 🌟',
        `Pilihan Anda paling aman. ${!isCaseCompleted ? '(+25 Poin)' : ''}`,
        'success'
      );
    } else {
      sound.playWrong();
      NotificationService.showInAppToast(
        'Pilihan Kurang Aman',
        `Pelajari analisis behavioral Korlantas di bawah.`,
        'warning'
      );
    }

    onProgressUpdated(updatedProgress);
  };

  const handleNextCase = () => {
    sound.playClick();
    if (currentCaseIndex < cases.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsEvaluated(false);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all btn-press"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0077c0]">
          <Brain className="w-4 h-4" />
          <span>Studi Kasus {currentCaseIndex + 1}/{cases.length}</span>
        </div>
      </div>

      {/* Case Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight">
          {activeCase.judul}
        </h2>
      </div>

      {/* Skenario Box (Clean Light Card) */}
      <div className="p-5 rounded-[22px] bg-white border border-[#E5EBE8] space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-amber-700">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-800">Skenario Lapangan:</h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pl-6 border-l-2 border-amber-300">
          "{activeCase.skenario}"
        </p>
      </div>

      {/* Decision Options */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 px-1">
          Pilih Tindakan Pengemudi:
        </h4>

        {activeCase.opsi.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isHighSafety = opt.skor_aman >= 80;

          let btnClass = 'border-slate-200 bg-white text-slate-800 hover:border-[#0077c0]';
          if (isEvaluated) {
            if (isSelected && isHighSafety) {
              btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 font-bold';
            } else if (isSelected && !isHighSafety) {
              btnClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-200 font-bold';
            } else if (isHighSafety) {
              btnClass = 'border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold';
            } else {
              btnClass = 'border-slate-200 bg-slate-50 opacity-50';
            }
          }

          return (
            <div key={idx} className="space-y-1.5">
              <button
                onClick={() => handleSelectOption(idx)}
                disabled={isEvaluated}
                className={`w-full p-4 rounded-2xl border text-xs sm:text-sm text-left flex items-start justify-between gap-3 transition-all btn-press ${btnClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed font-medium">{opt.text}</span>
                </div>

                {isEvaluated && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    isHighSafety ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    Skor: {opt.skor_aman}%
                  </span>
                )}
              </button>

              {isEvaluated && isSelected && (
                <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold leading-relaxed animate-fadeIn ${
                  isHighSafety ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}>
                  <p><strong>Feedback:</strong> {opt.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Behavioral Engineering Analysis (After choosing) */}
      {isEvaluated && (
        <div className="p-5 rounded-[22px] bg-white border border-[#E5EBE8] space-y-3 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2 text-purple-950 pb-2 border-b border-slate-100">
            <Brain className="w-4 h-4 text-purple-700" />
            <h4 className="text-xs sm:text-sm font-extrabold tracking-tight">
              Analisis Behavioral Korlantas
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {activeCase.analisis_behavioral}
          </p>
          <div className="pt-2.5 border-t border-slate-100">
            <span className="text-[11px] font-extrabold text-purple-900 block">
              🛡️ Rekomendasi Resmi:
            </span>
            <p className="text-xs text-slate-800 font-semibold mt-0.5">
              {activeCase.rekomendasi_korlantas}
            </p>
          </div>
        </div>
      )}

      {/* Next Case Button */}
      {isEvaluated && (
        <div className="pt-2 animate-fadeIn">
          <button
            onClick={handleNextCase}
            className="w-full py-3 px-4 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md btn-press transition-all"
          >
            <span>{currentCaseIndex < cases.length - 1 ? 'Studi Kasus Berikutnya' : 'Selesai & Kembali ke Modul'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
