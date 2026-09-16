import React, { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authService, getFriendlyErrorMessage } from '../../services/auth';
import { sound } from '../../shared/services/sound';

interface ReverifyScreenProps {
  initialEmail?: string;
  onVerificationSent: (email: string) => void;
  onBack: () => void;
}

export const ReverifyScreen: React.FC<ReverifyScreenProps> = ({
  initialEmail = '',
  onVerificationSent,
  onBack,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendReverify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid.');
      sound.playWrong();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    sound.playClick();

    try {
      // Try to resend email verification to current signed-in user
      await authService.resendEmailVerification();
      sound.playCorrect();
      onVerificationSent(email.trim());
    } catch (err: any) {
      sound.playWrong();
      setErrorMsg(getFriendlyErrorMessage(err) || 'Gagal mengirim email verifikasi. Silakan coba masuk ulang.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 relative overflow-x-hidden">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#DDE6E2] shadow-[0_10px_35px_rgba(0,119,192,0.06)] p-6 sm:p-8 relative z-10 space-y-6 animate-fadeInScale my-auto shrink-0">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0F172A] tracking-tight">
              Verifikasi Ulang Akun
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              Akun Anda belum diverifikasi. Kami akan mengirim ulang tautan verifikasi ke email Anda.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendReverify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Alamat Email Terdaftar</label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/70 border border-[#DDE6E2] focus:bg-white focus:border-[#0077C0] text-xs sm:text-sm outline-none transition-all"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] disabled:bg-slate-200 text-white font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 btn-press"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengirim Email...</span>
              </>
            ) : (
              <span>Kirim Ulang Email Verifikasi</span>
            )}
          </button>
        </form>

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
