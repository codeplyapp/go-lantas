import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ParallaxBackgroundProps {
  slideIndex: number;
  totalSlides: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ 
  slideIndex,
  totalSlides: _totalSlides
}) => {
  // Compute slight parallax shifts for the 2 ambient orbs based on slide index
  const orb1TranslateX = slideIndex * -30;
  const orb1TranslateY = slideIndex * 15;
  const orb2TranslateX = slideIndex * 35;
  const orb2TranslateY = slideIndex * -20;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1: Top Right */}
      <div 
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#C7EEFF]/50 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${orb1TranslateX}px, ${orb1TranslateY}px)` }}
      />

      {/* Orb 2: Bottom Left */}
      <div 
        className="absolute -bottom-20 -left-20 w-88 h-88 rounded-full bg-[#E0F2FE]/60 blur-3xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${orb2TranslateX}px, ${orb2TranslateY}px)` }}
      />
    </div>
  );
};

export const ParticleLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // 18 smooth rising particles
    const particleCount = 18;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.5,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.35 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 119, 192, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-1 w-full h-full"
    />
  );
};

export const triggerTapBurst = (event: React.MouseEvent) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  try {
    confetti({
      particleCount: 15,
      spread: 45,
      startVelocity: 15,
      origin: { x, y },
      colors: ['#0077C0', '#0284C7', '#38BDF8', '#F59E0B'],
      disableForReducedMotion: true,
      scalar: 0.7,
      ticks: 80,
    });
  } catch {
    // Non-blocking fallback
  }
};
