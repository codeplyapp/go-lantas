import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  durationMs
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFinishedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const triggerFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFadingOut(true);

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setTimeout(() => {
      onFinish();
    }, 350);
  };

  useEffect(() => {
    const video = videoRef.current;
    
    // Direct unmuted video configuration
    if (video) {
      video.volume = 1.0;
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts initial audio without gesture, keep visual animation moving
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }

    // Instant unmute on the first valid user gesture anywhere
    const handleGesture = () => {
      const v = videoRef.current;
      if (v) {
        v.muted = false;
        v.volume = 1.0;
        if (v.paused) {
          v.play().catch(() => {});
        }
      }
    };

    const gestureEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'];
    gestureEvents.forEach(evt => {
      window.addEventListener(evt, handleGesture, { once: true, passive: true });
    });

    // Safety fallback timer matching video duration (~8.6s)
    const timeoutDuration = durationMs || 8600;
    const safetyTimer = setTimeout(() => {
      triggerFinish();
    }, timeoutDuration);

    return () => {
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, handleGesture);
      });
      clearTimeout(safetyTimer);
    };
  }, [durationMs]);

  const handleVideoEnded = () => {
    setTimeout(() => {
      triggerFinish();
    }, 200);
  };

  const handleContainerClick = () => {
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.volume = 1.0;
      if (v.paused) {
        v.play().catch(() => {});
      }
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      onTouchStart={handleContainerClick}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-5 sm:p-7 transition-all duration-350 ease-out select-none overflow-hidden cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #F5F6F8 0%, #F5F6F8 12%, #EEF0F4 30%, #E7E9ED 55%, #E2E3E7 80%, #E3E4E8 100%)'
      }}
    >
      {/* Full Background Studio Video (Seamless Mask & Direct Audio) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <video
          ref={videoRef}
          src="/mascot/animasi_logo_hq.mp4"
          autoPlay
          playsInline
          muted
          preload="auto"
          onEnded={handleVideoEnded}
          className="w-auto h-full max-h-[75vh] sm:max-h-[80vh] aspect-[9/16] object-contain"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse 90% 84% at 50% 50%, black 50%, rgba(0, 0, 0, 0.85) 68%, rgba(0, 0, 0, 0.3) 85%, transparent 95%)',
            maskImage: 'radial-gradient(ellipse 90% 84% at 50% 50%, black 50%, rgba(0, 0, 0, 0.85) 68%, rgba(0, 0, 0, 0.3) 85%, transparent 95%)',
          }}
        />
      </div>

      {/* Top Header: Badge (No Skip Button) */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center pt-1 sm:pt-3 animate-fadeIn">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#D5D8DE] shadow-2xs">
          <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center overflow-hidden p-0.5">
            <img 
              src="/favicon.png" 
              alt="Logo Korlantas POLRI" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/mascot/logo.png';
              }}
            />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0077C0]">
            Korlantas POLRI
          </span>
        </div>
      </div>

      {/* Center Spacer to let the full mascot video shine */}
      <div className="flex-1 w-full pointer-events-none" />

      {/* Bottom Branding & Loading Indicator */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-3 pb-3 sm:pb-5 animate-fadeIn">
        {/* Branding Typography */}
        <div className="space-y-0.5">
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-[#0F172A] drop-shadow-xs">
            GO <span className="text-[#0077C0]">Lantas</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed max-w-xs mx-auto">
            Sistem Informasi & Edukasi Keselamatan Lalu Lintas Generasi Muda
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="w-2 h-2 rounded-full bg-[#0077C0] typing-dot-1" />
          <span className="w-2 h-2 rounded-full bg-[#0077C0] typing-dot-2" />
          <span className="w-2 h-2 rounded-full bg-[#0077C0] typing-dot-3" />
        </div>
        <p className="text-[10px] font-semibold text-slate-500 text-center">
          Inovasi Digital Pelopor Keselamatan Berlalu Lintas
        </p>
      </div>
    </div>
  );
};
