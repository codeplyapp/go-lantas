import React, { useState } from 'react';
import { 
  ChevronLeft, Play, CheckCircle2, Award, BookOpen, 
  HelpCircle, Layers, Brain, Clock, ShieldCheck, ChevronRight, Sparkles 
} from 'lucide-react';
import { ModuleData, ModuleProgress, LessonItem, QuizQuestion } from '../../../core/types';
import { MODULE_QUIZ_QUESTIONS } from '../../../data/questions';
import { CURRICULUM_TIERS } from '../../../data/tiers';
import { sound } from '../../../shared/services/sound';

import { LessonPlayer } from './LessonPlayer';
import { QuizModule } from './QuizModule';
import { Flashcards } from './Flashcards';
import { CaseStudy } from './CaseStudy';

interface ModuleDetailProps {
  module: ModuleData;
  progress: ModuleProgress;
  extraQuizzes?: Record<string, QuizQuestion[]>;
  onBack: () => void;
  onProgressUpdated: (updatedProgress: ModuleProgress) => void;
}

type SubView = 'overview' | 'lesson' | 'quiz' | 'flashcard' | 'case_study';

export const ModuleDetail: React.FC<ModuleDetailProps> = ({
  module,
  progress,
  extraQuizzes = {},
  onBack,
  onProgressUpdated,
}) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('overview');
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);

  const tierKey = module.tier || 'dasar';
  const tierConfig = CURRICULUM_TIERS[tierKey];

  const completedLessonsCount = progress.lessons_done.length;
  const totalLessonsCount = module.lessons.length;
  const isQuizPassed = progress.kuis_passed;
  const quizQuestions = extraQuizzes[module.id] || MODULE_QUIZ_QUESTIONS[module.id] || [];

  const handleOpenLesson = (lesson: LessonItem) => {
    sound.playClick();
    setSelectedLesson(lesson);
    setActiveSubView('lesson');
  };

  const handleOpenQuiz = () => {
    sound.playClick();
    setActiveSubView('quiz');
  };

  const handleOpenFlashcards = () => {
    sound.playClick();
    setActiveSubView('flashcard');
  };

  const handleOpenCaseStudy = () => {
    sound.playClick();
    setActiveSubView('case_study');
  };

  // Render Sub-Views
  if (activeSubView === 'lesson' && selectedLesson) {
    return (
      <LessonPlayer
        moduleId={module.id}
        lesson={selectedLesson}
        progress={progress}
        onBack={() => setActiveSubView('overview')}
        onLessonCompleted={(upd) => {
          onProgressUpdated(upd);
        }}
      />
    );
  }

  if (activeSubView === 'quiz') {
    return (
      <QuizModule
        module={module}
        moduleId={module.id}
        moduleTitle={module.judul}
        questions={quizQuestions}
        progress={progress}
        onBack={() => setActiveSubView('overview')}
        onQuizCompleted={(upd) => {
          onProgressUpdated(upd);
        }}
      />
    );
  }

  if (activeSubView === 'flashcard') {
    return (
      <Flashcards
        moduleId={module.id}
        flashcards={module.flashcards}
        progress={progress}
        onBack={() => setActiveSubView('overview')}
        onProgressUpdated={(upd) => {
          onProgressUpdated(upd);
        }}
      />
    );
  }

  if (activeSubView === 'case_study') {
    return (
      <CaseStudy
        moduleId={module.id}
        cases={module.kasus}
        progress={progress}
        onBack={() => setActiveSubView('overview')}
        onProgressUpdated={(upd) => {
          onProgressUpdated(upd);
        }}
      />
    );
  }

  // --- OVERVIEW VIEW ---
  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Header Back Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 btn-press transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Kurikulum</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0077c0]">
            {tierConfig.nama}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            Modul #{module.nomor}
          </span>
        </div>
      </div>

      {/* Module Overview Hero Banner */}
      <div className="p-5 sm:p-6 rounded-[24px] apple-card bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0077c0]/10 text-[#0077c0]">
                {tierConfig.nama}
              </span>
              {module.is_ai_generated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-apple-tight leading-snug">
              {module.judul}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Edukasi Berstandar Korlantas POLRI
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0077c0]" />
              <span>{module.durasi_estimasi}</span>
            </span>
            {isQuizPassed && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Modul Lulus
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium pt-1 border-t border-slate-100">
          {module.deskripsi}
        </p>

        {/* Mini Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Progres Pelajaran</span>
            <span className="text-[#0077C0]">{completedLessonsCount}/{totalLessonsCount} Selesai</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedLessonsCount / Math.max(1, totalLessonsCount)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1. Daftar Materi Pelajaran (Lessons) */}
      <div className="p-4 sm:p-5 rounded-[20px] apple-card bg-white space-y-3 shadow-xs border-[#E5EBE8]">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#0077c0]" />
            Materi Pelajaran ({totalLessonsCount} Topik)
          </h3>
        </div>

        <div className="space-y-2.5">
          {module.lessons.map((les, index) => {
            const isLessonDone = progress.lessons_done.includes(les.id);

            return (
              <div
                key={les.id}
                onClick={() => handleOpenLesson(les)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-[#0077c0] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 btn-press"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isLessonDone 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-[#0077c0]/10 text-[#0077c0]'
                  }`}>
                    {isLessonDone ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate leading-snug">
                      {index + 1}. {les.judul}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ~{les.durasi_menit} Menit • Video Edukasi & Ringkasan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Features Grid: Kuis, Flashcard, Studi Kasus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Kuis Modul Card */}
        <div 
          onClick={handleOpenQuiz}
          className="p-4 rounded-[18px] apple-card bg-white border border-[#E5EBE8] hover:border-[#0077c0] hover:bg-slate-50 transition-all cursor-pointer space-y-2 flex flex-col justify-between shadow-xs btn-press"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5" />
            </div>
            {isQuizPassed && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Lulus {progress.kuis_best}%
              </span>
            )}
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              Kuis Evaluasi Modul
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {quizQuestions.length} Soal • Passing {module.passing_grade || tierConfig.passingGrade}% (+{module.bonus_points?.first_pass || tierConfig.bonusPoints.first_pass} Poin)
            </p>
          </div>
        </div>

        {/* Flashcard Rambu Card */}
        <div 
          onClick={handleOpenFlashcards}
          className="p-4 rounded-[18px] apple-card bg-white border border-[#E5EBE8] hover:border-[#0077c0] hover:bg-slate-50 transition-all cursor-pointer space-y-2 flex flex-col justify-between shadow-xs btn-press"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0077c0] flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-bold">
              {progress.flashcards_done.length}/{module.flashcards.length} Hapal
            </span>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              Flashcard Rambu Interaktif
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {module.flashcards.length} Kartu 3D Flip • Rambu & Makna
            </p>
          </div>
        </div>

        {/* Studi Kasus Card */}
        <div 
          onClick={handleOpenCaseStudy}
          className="p-4 rounded-[18px] apple-card bg-white border border-[#E5EBE8] hover:border-[#0077c0] hover:bg-slate-50 transition-all cursor-pointer space-y-2 flex flex-col justify-between shadow-xs btn-press"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] text-slate-500 font-bold">
              {progress.cases_done.length}/{module.kasus.length} Tuntas
            </span>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              Studi Kasus Jalan Raya
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Skenario Nyata & Analisis Behavioral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
