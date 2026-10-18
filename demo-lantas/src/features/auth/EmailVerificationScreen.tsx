import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { authService, getFriendlyErrorMessage } from '../../services/auth';
import { sound } from '../../shared/services/sound';

interface EmailVerificationScreenProps {
  email: string;
  /** Called when user successfully verifies (emailVerified becomes true) */
  onVerified: () => void;
  /** Called to go back to auth screen */
  onBack: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onVerified,
  onBack,
}) => {
  const [cooldown, setCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoCode, setDemoCode] = useState<string>(() => authService.getDemoVerificationCode(email));
  const [inputCode, setInputCode] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Auto-poll check
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const verified = await authService.checkEmailVerified();
        if (verified) {
          clearInterval(pollInterval);
          sound.playCorrect();
          onVerified();
        }
      } catch {}
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [onVerified]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setResendStatus(null);
    sound.playClick();

    try {
      const newCode = await authService.resendEmailVerification(email);
      setDemoCode(newCode);
      sound.playCorrect();
      setResendStatus({ type: 'success', text: `Kode verifikasi baru (${newCode}) telah diterbitkan untuk simulasi.` });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      sound.playWrong();
      setResendStatus({ type: 'error', text: getFriendlyErrorMessage(err) });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyDemo = async () => {
    setIsVerifying(true);
    setErrorStatus(null);
    sound.playClick();

    try {
      await authService.verifyEmail(email);
      sound.playCorrect();
      setTimeout(() => {
        onVerified();
      }, 500);
    } catch (err: any) {
      sound.playWrong();
      setErrorStatus(getFriendlyErrorMessage(err));
      setIsVerifying(false);
    }
  };

  const handleVerifyWithInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    if (inputCode.trim() === demoCode.trim()) {
      handleVerifyDemo();
    } else {
      sound.playWrong();
      setErrorStatus(`Kode salah. Gunakan kode verifikasi demo: ${demoCode}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 relative overflow-y-auto overflow-x-hidden">
      {/* Background Watermark */}
      <div className="fixed -right-16 -top-16 w-80 h-80 pointer-events-none opacity-[0.03] text-[#0077C0] z-0">
        <ShieldCheck className="w-full h-full stroke-[1] fill-current" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#DDE6E2] shadow-[0_10px_35px_rgba(0,119,192,0.06)] p-6 sm:p-8 relative z-10 space-y-6 my-auto shrink-0 animate-fadeInScale">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] border border-[#0077C0]/20 flex items-center justify-center relative">
            <Mail className="w-8 h-8 text-[#0077C0]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-[#0077C0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulasi Verifikasi Email (Demo Mode)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0F172A] tracking-tight">
              Verifikasi Akun GO Lantas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              Tautan & kode verifikasi pendaftaran dikirimkan ke:
            </p>
            <p className="text-sm font-bold text-[#0077C0] break-all">{email}</p>
          </div>
        </div>

        {/* Demo Code Box (Khusus Prototipe & Evaluasi Juri) */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/50 rounded-2xl border-2 border-[#0077C0]/30 p-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#0077C0]">
            <KeyRound className="w-4 h-4" />
            <span>KODE VERIFIKASI DEMO</span>
          </div>
          <div className="text-3xl font-mono font-black tracking-widest text-[#0077C0] py-1 select-all">
            {demoCode}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Pada mode prototipe frontend-only, kode disimulasikan langsung di layar agar pengujian alur verifikasi berjalan mulus tanpa kendala inbox spam.
          </p>
        </div>

        {/* Manual Input or 1-Click Action */}
        <form onSubmit={handleVerifyWithInput} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Masukkan 6-Digit Kode Verifikasi
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder={`Ketik ${demoCode} atau klik tombol di bawah`}
                className="w-full text-center tracking-widest font-mono text-base font-bold py-3 px-4 rounded-2xl bg-slate-50 border border-[#DDE6E2] focus:bg-white focus:border-[#0077C0] outline-none transition-all"
              />
            </div>
          </div>

          {errorStatus && (
            <div className="p-3 rounded-xl border bg-rose-50 border-rose-200 text-xs font-medium text-rose-700">
              {errorStatus}
            </div>
          )}

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

          {/* Primary CTA — 1-Click Verification (Demo) */}
          <button
            type="button"
            onClick={handleVerifyDemo}
            disabled={isVerifying}
            className="w-full py-3.5 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi Akun Sekarang (Demo)</span>
              </>
            )}
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="space-y-2.5 pt-2 border-t border-[#E5EBE8]">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-2 btn-press"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengirim Ulang...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Kirim Ulang Kode ({cooldown}s)</span>
            ) : (
              <span>Kirim Ulang Kode Verifikasi</span>
            )}
          </button>

          <div className="text-center">
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
    </div>
  );
};
