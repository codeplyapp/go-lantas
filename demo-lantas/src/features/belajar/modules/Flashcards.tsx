import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, RotateCw, 
  Layers, Award, Sparkles, Filter 
} from 'lucide-react';
import { FlashcardItem, ModuleProgress } from '../../../core/types';
import { sound } from '../../../shared/services/sound';
import { NotificationService } from '../../../shared/services/notification';
import confetti from 'canvas-confetti';

interface FlashcardsProps {
  moduleId: string;
  flashcards: FlashcardItem[];
  progress: ModuleProgress;
  onBack: () => void;
  onProgressUpdated: (updatedProgress: ModuleProgress) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({
  moduleId,
  flashcards,
  progress,
  onBack,
  onProgressUpdated,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('semua');

  const filteredCards = flashcards.filter(c => {
    if (activeFilter === 'semua') return true;
    return c.kategori === activeFilter;
  });

  const currentCard = filteredCards[currentIndex] || flashcards[0];
  const isMastered = progress.flashcards_done.includes(currentCard?.id || '');

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    sound.playClick();
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleMarkMastered = () => {
    if (!currentCard || isMastered) return;
    sound.playLevelUp();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
    });

    const updatedProgress: ModuleProgress = {
      ...progress,
      flashcards_done: progress.flashcards_done.includes(currentCard.id)
        ? progress.flashcards_done
        : [...progress.flashcards_done, currentCard.id],
      last_study: new Date().toISOString(),
    };
    onProgressUpdated(updatedProgress);
    NotificationService.showInAppToast(
      'Rambu Dikuasai! ✨',
      `Anda menghafal "${currentCard.judul}" (+10 Poin).`,
      'success'
    );
  };

  const categories = ['semua', 'peringatan', 'larangan', 'perintah', 'marka', 'aturan'];

  return (
    <div className="space-y-4 pb-6 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all btn-press"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-extrabold text-[#0077c0]">
            Kartu {currentIndex + 1} / {filteredCards.length}
          </span>
          <p className="text-[10px] text-slate-400 font-semibold">
            {progress.flashcards_done.length}/{flashcards.length} Dihapal
          </p>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playClick();
              setActiveFilter(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all shrink-0 btn-press ${
              activeFilter === cat
                ? 'bg-[#0077c0] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Flip Card Container */}
      {currentCard && (
        <div 
          onClick={handleFlip}
          className="relative w-full min-h-[300px] sm:min-h-[340px] rounded-[24px] cursor-pointer perspective select-none btn-press"
        >
          <div className="relative w-full min-h-[300px] sm:min-h-[340px] p-6 rounded-[24px] apple-card bg-white border border-[#E5EBE8] shadow-sm flex flex-col justify-between transition-all duration-300">
            {/* Top Card Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {currentCard.kategori}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <RotateCw className="w-3.5 h-3.5 text-[#0077c0]" />
                <span>{isFlipped ? 'Ketuk untuk kembali' : 'Ketuk untuk membalik'}</span>
              </div>
            </div>

            {/* Middle Content */}
            {!isFlipped ? (
              /* Front Face: Symbol + Title */
              <div className="text-center py-6 space-y-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 shadow-inner flex items-center justify-center text-4xl sm:text-5xl">
                  {currentCard.gambar_simbol || '⚠️'}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-tight">
                    {currentCard.judul}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Apa arti dan fungsi rambu/marka ini?
                  </p>
                </div>
              </div>
            ) : (
              /* Back Face: Meaning + Explanation + Law */
              <div className="py-4 space-y-3 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">
                    Arti Resmi Rambu / Marka:
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A] leading-snug">
                    {currentCard.arti}
                  </h3>
                </div>

                <p className="pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {currentCard.penjelasan}
                </p>

                {currentCard.pasal_hukum && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span>⚖️ Dasar Hukum:</span>
                      <strong className="text-slate-900">{currentCard.pasal_hukum}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400">
                GO Lantas Korlantas Flashcard
              </span>
              {isMastered && (
                <span className="text-[11px] font-extrabold flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Hapal
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions: Prev, Mark Mastered, Next */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all btn-press shadow-xs"
          title="Kartu Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleMarkMastered}
          disabled={isMastered}
          className={`flex-1 py-3 px-4 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all btn-press ${
            isMastered
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-[#0077c0] hover:bg-[#008be0] text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isMastered ? 'Sudah Dihapal' : 'Tandai Hapal (+10 Poin)'}</span>
        </button>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all btn-press shadow-xs"
          title="Kartu Selanjutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
