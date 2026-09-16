import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { ONBOARDING_SLIDES } from './slides';
import { ParallaxBackground, ParticleLayer, triggerTapBurst } from './OnboardingFX';
import { sound } from '../../shared/services/sound';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRobotBouncing, setIsRobotBouncing] = useState(false);

  const totalSlides = ONBOARDING_SLIDES.length;
  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const handleNext = () => {
    sound.playClick();
    if (isLastSlide) {
      handleComplete();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      sound.playClick();
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    sound.playCorrect();
    localStorage.setItem('sigap_onboarding_done', 'true');
    onFinish();
  };

  const handleRobotClick = (e: React.MouseEvent) => {
    sound.playCorrect();
    triggerTapBurst(e);
    setIsRobotBouncing(true);
    setTimeout(() => setIsRobotBouncing(false), 500);
  };

  const isLeft = currentSlide.mascotSide === 'left';

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col justify-between overflow-hidden select-none">
      {/* Dynamic Parallax Background Gradient & Ambient Particles */}
      <ParallaxBackground slideIndex={currentSlideIndex} totalSlides={totalSlides} />
      <ParticleLayer />

      {/* 1. Top Navigation Bar (Clean & Minimalist) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-5 sm:px-8 pt-5 sm:pt-6 flex items-center justify-between">
        {/* Logo Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E5EBE8] shadow-xs flex items-center justify-center overflow-hidden p-0.5">
            <img 
              src="/mascot/logo.png" 
              alt="Logo GO Lantas" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-heading font-extrabold text-[#0F172A] tracking-tight leading-none">
              GO <span className="text-[#0077C0]">Lantas</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Korlantas POLRI
            </span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleComplete}
          className="text-xs font-bold text-slate-500 hover:text-[#0077C0] px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-colors btn-press"
        >
          Lewati
        </button>
      </div>

      {/* 2. Main Content Focus (Centered, Clean & Distraction-Free) */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
        <div key={`slide-text-${currentSlide.id}`} className="space-y-3 animate-fadeIn">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0F172A] tracking-tight leading-tight">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base font-bold text-[#0077C0]">
            {currentSlide.subtitle}
          </p>

          {/* Clean Description */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto pt-1">
            {currentSlide.description}
          </p>
        </div>
      </div>

      {/* 3. Emerging Friendly Robot Companion (Bottom Corner behind Button Bar) */}
      <div 
        className={`fixed z-10 flex flex-col items-center pointer-events-auto transition-all duration-500 ${
          isLeft 
            ? '-left-10 sm:-left-6 md:-left-2 lg:left-4 -bottom-10 sm:-bottom-16 md:-bottom-20' 
            : '-right-10 sm:-right-6 md:-right-2 lg:right-4 -bottom-10 sm:-bottom-16 md:-bottom-20'
        }`}
      >
        {/* Full-Body Emerging Character */}
        <div 
          key={`mascot-emerge-${currentSlide.id}`}
          onClick={handleRobotClick}
          className={`relative cursor-pointer group select-none ${
            isLeft ? 'animate-robot-emerge-left' : 'animate-robot-emerge-right'
          }`}
          title="Ketuk robot!"
        >
          <div className={`${
            isLeft ? 'animate-robot-idle-peek-left' : 'animate-robot-idle-peek-right'
          } transition-transform duration-300 ${
            isRobotBouncing ? 'scale-108' : 'group-hover:scale-103'
          }`}>
            {/* Ambient Aura Ring under character */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-10 bg-[#0077C0]/20 rounded-full blur-xl animate-radar-ripple -z-10" />

            {/* Character Image (Maximum Heroic Size & tilted inward) */}
            <img
              src={currentSlide.mascotUrl}
              alt={currentSlide.title}
              className="h-[380px] sm:h-[480px] md:h-[580px] lg:h-[660px] xl:h-[720px] w-auto object-contain drop-shadow-[0_24px_48px_rgba(0,119,192,0.25)] pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = '/mascot/mascot1.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Navigation & Action Controls (Layered in Front at z-30) */}
      <div className="relative z-30 w-full max-w-sm mx-auto px-6 pb-6 sm:pb-8 flex flex-col items-center space-y-4">
        {/* Animated Dots Indicator */}
        <div className="flex items-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setCurrentSlideIndex(idx);
              }}
              aria-label={`Ke slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlideIndex === idx
                  ? 'w-8 bg-[#0077C0]'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons Row */}
        <div className="w-full flex items-center gap-3">
          {currentSlideIndex > 0 && (
            <button
              onClick={handlePrev}
              className="py-3.5 px-4.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5EBE8] hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-[0_4px_16px_rgba(0,0,0,0.06)] btn-press shrink-0"
            >
              Kembali
            </button>
          )}

          <button
            onClick={handleNext}
            className={`flex-1 py-3.5 px-6 rounded-2xl text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_6px_20px_rgba(0,119,192,0.28)] btn-press ${
              isLastSlide
                ? 'bg-gradient-to-r from-[#0077C0] to-[#0284C7] hover:from-[#008be0] hover:to-[#0369a1]'
                : 'bg-[#0077C0] hover:bg-[#008be0]'
            }`}
          >
            <span>{isLastSlide ? 'Mulai Belajar & Masuk' : 'Lanjut'}</span>
            {isLastSlide ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


