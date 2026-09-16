import React from 'react';
import { 
  BookOpen, Clock, CheckCircle2, ChevronRight, Play, 
  Layers, Brain, HelpCircle, Award, ArrowRight
} from 'lucide-react';
import { ModuleData, ModuleProgress } from '../../../core/types';
import { sound } from '../../../shared/services/sound';

interface ModuleListProps {
  modules: ModuleData[];
  moduleProgress: Record<string, ModuleProgress>;
  onSelectModule: (module: ModuleData) => void;
  onOpenExam?: () => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  moduleProgress,
  onSelectModule,
  onOpenExam
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A]">
            6 Modul Kurikulum Keselamatan
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pelajari setiap materi secara terstruktur untuk membuka sertifikat kelulusan resmi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {modules.map((mod) => {
          const progress = moduleProgress[mod.id] || {
            moduleId: mod.id,
            lessons_done: [],
            kuis_attempts: 0,
            kuis_best: 0,
            kuis_passed: false,
            flashcards_done: [],
            cases_done: [],
            last_study: '',
            total_menit: 0,
          };

          const totalLessons = mod.lessons.length;
          const completedLessons = progress.lessons_done.length;
          const isPassed = progress.kuis_passed;
          const percentDone = Math.round(
            ((completedLessons + (isPassed ? 1 : 0)) / (totalLessons + 1)) * 100
          );

          return (
            <div
              key={mod.id}
              onClick={() => {
                sound.playClick();
                onSelectModule(mod);
              }}
              className="p-5 rounded-[22px] apple-card bg-white border border-[#E5EBE8] hover:border-[#0077c0] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group btn-press"
            >
              {/* Header: Module Number & Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0077c0] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0077c0]"></span>
                      Modul #{mod.nomor}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {mod.durasi_estimasi}
                    </span>
                  </div>

                  {isPassed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Lulus ({progress.kuis_best}%)
                    </span>
                  ) : completedLessons > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Berjalan ({percentDone}%)
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      Belum Mulai
                    </span>
                  )}
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] group-hover:text-[#0077C0] transition-colors leading-snug">
                    {mod.judul}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">
                    {mod.deskripsi}
                  </p>
                </div>
              </div>

              {/* Module Content Badges & Mini Progress */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#0077c0]" />
                    {totalLessons} Materi
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    {mod.flashcards.length} Flashcard
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-purple-500" />
                    {mod.kasus.length} Kasus
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentDone}%` }}
                  />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#0077C0] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    {isPassed ? 'Ulangi / Review Modul' : completedLessons > 0 ? 'Lanjutkan Modul' : 'Mulai Belajar'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-600">
                    +120 Poin
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
