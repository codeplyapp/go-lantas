import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { authService, getFriendlyErrorMessage } from '../../services/auth';
import { sound } from '../../shared/services/sound';

interface EmailVerificationScreenProps {
  email: string;
  /** Called when user successfully verifies (emailVerified becomes true) */
  onVerified: () => void;
  /** Called to go back to auth screen */
  onBack: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onVerified,
  onBack,
}) => {
  const [cooldown, setCooldown] = useState<number>(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [checkStatus, setCheckStatus] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setResendStatus(null);
    sound.playClick();

    try {
      await authService.resendEmailVerification();
      sound.playCorrect();
      setResendStatus({ type: 'success', text: 'Email verifikasi telah dikirim ulang. Cek kotak masuk atau folder spam.' });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      sound.playWrong();
      setResendStatus({ type: 'error', text: getFriendlyErrorMessage(err) });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setIsChecking(true);
    setCheckStatus(null);
    sound.playClick();

    try {
      const verified = await authService.checkEmailVerified();
      if (verified) {
        sound.playCorrect();
        onVerified();
      } else {
        sound.playWrong();
        setCheckStatus('Email Anda belum diverifikasi. Silakan klik tautan di email yang dikirimkan.');
      }
    } catch (err: any) {
      sound.playWrong();
      setCheckStatus(getFriendlyErrorMessage(err));
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenEmailApp = () => {
    sound.playClick();
    // Try to open webmail based on email domain
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (domain.includes('gmail')) {
      window.open('https://mail.google.com', '_blank');
    } else if (domain.includes('yahoo')) {
      window.open('https://mail.yahoo.com', '_blank');
    } else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
      window.open('https://outlook.live.com', '_blank');
    } else {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 relative overflow-y-auto overflow-x-hidden">
      {/* Background Watermark */}
      <div className="fixed -right-16 -top-16 w-80 h-80 pointer-events-none opacity-[0.03] text-[#0077C0] z-0">
        <ShieldCheck className="w-full h-full stroke-[1] fill-current" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#DDE6E2] shadow-[0_10px_35px_rgba(0,119,192,0.06)] p-6 sm:p-8 relative z-10 space-y-6 my-auto shrink-0">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] border border-[#0077C0]/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#0077C0]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0F172A] tracking-tight">
              Cek Email Anda
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              Kami telah mengirimkan tautan verifikasi ke:
            </p>
            <p className="text-sm font-bold text-[#0077C0] break-all">{email}</p>
          </div>
        </div>

        {/* Instruction Steps */}
        <div className="bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] p-4 space-y-3">
          {[
            { step: '1', text: 'Buka email yang masuk dari Firebase / Korlantas' },
            { step: '2', text: 'Klik tautan "Verifikasi email" di dalam email tersebut' },
            { step: '3', text: 'Kembali ke sini dan tekan tombol "Sudah Verifikasi"' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0077C0] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {resendStatus && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              resendStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {resendStatus.text}
          </div>
        )}
        {checkStatus && (
          <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 text-xs font-medium text-amber-700">
            {checkStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary CTA — Open Email App */}
          <button
            onClick={handleOpenEmailApp}
            className="w-full py-3.5 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Aplikasi Email
          </button>

          {/* Check Verified */}
          <button
            onClick={handleCheckVerified}
            disabled={isChecking}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sudah Verifikasi — Lanjutkan</span>
              </>
            )}
          </button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 font-heading font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 btn-press"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Kirim Ulang ({cooldown}s)</span>
            ) : (
              <span>Kirim Ulang Email Verifikasi</span>
            )}
          </button>
        </div>

        {/* Note about spam */}
        <p className="text-center text-xs text-slate-400 font-medium">
          Tidak menemukan email? Periksa folder{' '}
          <span className="font-bold text-slate-500">Spam / Junk</span> Anda.
        </p>

        {/* Back Link */}
        <div className="pt-2 border-t border-[#E5EBE8] text-center">
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-[#0077C0] transition-colors inline-flex items-center gap-1.5 btn-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
