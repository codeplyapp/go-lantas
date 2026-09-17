import React, { useState } from 'react';
import { 
  ChevronLeft, CheckCircle2, Clock, Play, BookOpen, 
  ShieldCheck, AlertCircle, Award, ExternalLink, RefreshCw,
  Video, ChevronRight, Layers, ArrowRight, Lightbulb
} from 'lucide-react';
import { LessonItem, ModuleProgress } from '../../../core/types';
import { CURRICULUM_VIDEOS } from '../../../data/videos';
import { firestoreService } from '../../../services/firestore';
import { authService } from '../../../services/auth';
import { sound } from '../../../shared/services/sound';
import { NotificationService } from '../../../shared/services/notification';
import confetti from 'canvas-confetti';

interface LessonPlayerProps {
  moduleId: string;
  lesson: LessonItem;
  progress: ModuleProgress;
  onBack: () => void;
  onLessonCompleted: (updatedProgress: ModuleProgress) => void;
}

type PlayerMode = 'interactive' | 'youtube';

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  moduleId,
  lesson,
  progress,
  onBack,
  onLessonCompleted,
}) => {
  const [playerMode, setPlayerMode] = useState<PlayerMode>('interactive');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const isDone = progress.lessons_done.includes(lesson.id);
  const videoConfig = CURRICULUM_VIDEOS[lesson.id];
  const slides = videoConfig?.slides || [
    {
      fase: 'Materi Inti',
      judul: lesson.judul,
      uraian: lesson.deskripsi,
      poin_kunci: lesson.poinPenting?.[0] || 'Kuasai materi keselamatan berlalu lintas berstandar Korlantas POLRI.',
      hukum: lesson.hukumTerkait
    }
  ];

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleMarkComplete = () => {
    sound.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0077C0', '#059669', '#F59E0B'],
    });

    // Update progress locally
    const updatedProgress: ModuleProgress = {
      ...progress,
      lessons_done: progress.lessons_done.includes(lesson.id)
        ? progress.lessons_done
        : [...progress.lessons_done, lesson.id],
      total_menit: (progress.total_menit || 0) + 5,
      last_study: new Date().toISOString(),
    };

    // Firestore gamification: +20 points on first lesson completion
    const uid = authService.getCurrentUser()?.uid;
    if (!isDone && uid) {
      firestoreService.addPoints(uid, 20);
      firestoreService.recordPointAward(
        uid,
        'lesson',
        `Pelajaran: ${lesson.judul}`,
        20
      );
      firestoreService.registerActivity(uid, { quizDone: false });
      firestoreService.updateModuleProgress(uid, moduleId, updatedProgress);
    }

    onLessonCompleted(updatedProgress);
    NotificationService.showInAppToast(
      'Pelajaran Selesai! 🎉',
      `Anda menyelesaikan "${lesson.judul}". ${!isDone ? '+20 Poin ditambahkan!' : 'Progres modul diperbarui.'}`,
      'success'
    );
  };

  const handleNextSlide = () => {
    sound.playClick();
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    sound.playClick();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all btn-press"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Modul</span>
        </button>

        {/* Player Mode Switcher Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setPlayerMode('interactive');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all ${
              playerMode === 'interactive'
                ? 'bg-white text-[#0077c0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Masterclass Interaktif</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setPlayerMode('youtube');
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all ${
              playerMode === 'youtube'
                ? 'bg-white text-[#0077c0] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Video YouTube</span>
          </button>
        </div>
      </div>

      {/* Lesson Header Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0077c0]" />
            ~{lesson.durasi_menit} Menit
          </span>
          {isDone && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold inline-flex items-center gap-1 ml-auto">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Sudah Selesai
            </span>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight leading-snug">
          {lesson.judul}
        </h2>
      </div>

      {/* --- 1. PRESENTATION CONTAINER (Flat, clean, NO card-in-card) --- */}
      {playerMode === 'interactive' ? (
        /* --- A. MASTERCLASS INTERAKTIF (Clean flat flow) --- */
        <div className="rounded-[24px] bg-white border border-[#E5EBE8] text-slate-900 shadow-xs p-5 sm:p-6 space-y-4">
          {/* Header Card: Slide Pagination */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span className="text-xs font-extrabold text-[#0077c0]">
              Langkah {currentSlideIndex + 1} dari {slides.length}
            </span>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlideIndex 
                      ? 'w-6 bg-[#0077c0]' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="space-y-2 min-h-[90px] flex flex-col justify-center">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A] tracking-tight leading-snug">
              {currentSlide.judul}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {currentSlide.uraian}
            </p>
          </div>

          {/* Seamless Integrated Intisari (No inner card border) */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-extrabold">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Intisari Keselamatan:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed pl-5">
              {currentSlide.poin_kunci}
            </p>
            {currentSlide.hukum && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#0077c0] font-bold pl-5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0077c0]" />
                <span>Dasar Hukum: {currentSlide.hukum}</span>
              </div>
            )}
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              disabled={currentSlideIndex === 0}
              onClick={handlePrevSlide}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center gap-1 btn-press"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentSlideIndex < slides.length - 1 ? (
              <button
                onClick={handleNextSlide}
                className="px-5 py-2.5 rounded-xl bg-[#0077c0] hover:bg-[#005fa3] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs btn-press"
              >
                <span>Lanjut Langkah Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Semua Langkah Selesai
              </span>
            )}
          </div>
        </div>
      ) : (
        /* --- B. YOUTUBE VIDEO EMBED WITH SAFE EXTERNAL LINK --- */
        <div className="space-y-3">
          <div className="relative w-full aspect-video rounded-[24px] overflow-hidden bg-slate-950 shadow-md border border-slate-200">
            <iframe
              src={`https://www.youtube.com/embed/${videoConfig?.youtubeId || 'W4E_vj8vJ3I'}?rel=0&modestbranding=1`}
              title={lesson.judul}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Helper toolbar for YouTube */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Video className="w-4 h-4 text-[#0077c0] shrink-0" />
              <span className="font-medium">
                Video tidak dapat diputar di browser Anda?
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setPlayerMode('interactive');
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[11px] font-bold transition-all shadow-2xs"
              >
                Beralih ke Masterclass
              </button>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoConfig?.searchQuery || lesson.judul)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#0077c0] hover:bg-[#005fa3] text-white text-[11px] font-extrabold flex items-center gap-1 transition-all shadow-2xs"
              >
                <span>Buka di YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Structured Summary Notes (Clean & Integrated, NO nested cards) */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-[#0077c0]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
            Ringkasan Materi Pelajaran
          </h3>
        </div>

        <div className="space-y-2.5">
          {lesson.ringkasan.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium">
              <span className="w-5 h-5 rounded-full bg-[#0077c0]/10 text-[#0077c0] text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Integrated Key Takeaways (Flat & Clean) */}
        {lesson.poinPenting && lesson.poinPenting.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              Poin Penting untuk Ujian Teori SIM:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-800 font-medium pl-2">
              {lesson.poinPenting.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Legal Reference (Flat & Clean) */}
        {lesson.hukumTerkait && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0077c0] shrink-0" />
            <span>Referensi Regulasi: <strong className="text-slate-900">{lesson.hukumTerkait}</strong></span>
          </div>
        )}
      </div>

      {/* 3. Action Claim Points Footer */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#E5EBE8] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-xs font-extrabold text-slate-900 block">
            {isDone ? 'Pelajaran Telah Diselesaikan' : 'Selesaikan Pelajaran Ini'}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">
            Dapatkan +20 Poin GO Lantas untuk akumulasi sertifikat dan leaderboard.
          </p>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={isDone}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
            isDone 
              ? 'bg-emerald-100 text-emerald-800 cursor-default' 
              : 'bg-[#0077C0] hover:bg-[#005fa3] text-white shadow-xs hover:shadow-md btn-press'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isDone ? 'Pelajaran Selesai (+20 Poin)' : 'Tandai Selesai (+20 Poin)'}</span>
        </button>
      </div>
    </div>
  );
};
