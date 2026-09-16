import React, { useState, useEffect } from 'react';
import { 
  Shield, Mail, Lock, User, Eye, EyeOff, GraduationCap, 
  School, Users, BookOpen, ArrowRight, Sparkles, AlertCircle, 
  CheckCircle2, X, Check, ShieldAlert, Clock
} from 'lucide-react';
import { authService, getFriendlyErrorMessage, AuthSession, SignupDraft } from '../../services/auth';
import { validatePasswordPolicy } from './passwordPolicy';
import { UserRole } from '../../core/types';
import { sound } from '../../shared/services/sound';

interface AuthScreenProps {
  onAuthSuccess: (session: AuthSession, isNewProfile?: boolean) => void;
  onNavigateToEmailVerification?: (email: string) => void;
  onNavigateToReverify?: (email?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onAuthSuccess, 
  onNavigateToEmailVerification,
  onNavigateToReverify,
}) => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [role, setRole] = useState<UserRole>('pelajar');
  const [sekolahKampus, setSekolahKampus] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rate Limiting Lockout State
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [isForgotLoading, setIsForgotLoading] = useState<boolean>(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check rate limit on email change or mount
  useEffect(() => {
    if (email) {
      const remaining = authService.getRemainingLockoutSeconds(email);
      setLockoutSeconds(remaining);
    }
  }, [email]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Restore draft if user navigated back
  useEffect(() => {
    const draft = authService.getSignupDraft();
    if (draft && !isLoginMode) {
      setNama(draft.nama || '');
      setEmail(draft.email || '');
      setRole(draft.role || 'pelajar');
      setSekolahKampus(draft.sekolah_kampus || '');
      setAgreedToTerms(draft.agreedToTerms || false);
    }
  }, [isLoginMode]);

  const passwordPolicy = validatePasswordPolicy(password);
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleToggleMode = () => {
    sound.playClick();
    setIsLoginMode(!isLoginMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // ─── LOGIN FLOW ──────────────────────────────────────────────
    if (isLoginMode) {
      if (!cleanEmail || !password.trim()) {
        setErrorMessage('Mohon lengkapi email dan kata sandi Anda.');
        sound.playWrong();
        return;
      }

      // Check client lockout
      const remaining = authService.getRemainingLockoutSeconds(cleanEmail);
      if (remaining > 0) {
        setLockoutSeconds(remaining);
        setErrorMessage(`Akun terkunci sementara demi keamanan. Coba lagi dalam ${remaining} detik.`);
        sound.playWrong();
        return;
      }

      setIsLoading(true);
      sound.playClick();

      try {
        const session = await authService.signIn(cleanEmail, password);
        sound.playCorrect();
        onAuthSuccess(session);
      } catch (err: any) {
        sound.playWrong();
        const msg = getFriendlyErrorMessage(err);
        setErrorMessage(msg);
        const newRemaining = authService.getRemainingLockoutSeconds(cleanEmail);
        if (newRemaining > 0) {
          setLockoutSeconds(newRemaining);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ─── SIGN UP WITH EMAIL VERIFICATION FLOW ────────────────────────────────
    if (!nama.trim()) {
      setErrorMessage('Mohon masukkan nama lengkap Anda.');
      sound.playWrong();
      return;
    }

    if (!passwordPolicy.isValid) {
      setErrorMessage('Kata sandi harus memenuhi semua kriteria keamanan (minimal 8 karakter, huruf besar & kecil, angka, dan simbol).');
      sound.playWrong();
      return;
    }

    if (!isPasswordMatch) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      sound.playWrong();
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Harap centang persetujuan Syarat Layanan & Kebijakan Privasi.');
      sound.playWrong();
      return;
    }

    setIsLoading(true);
    sound.playClick();

    const draft: SignupDraft = {
      nama: nama.trim(),
      email: cleanEmail,
      pass: password,
      role,
      sekolah_kampus: sekolahKampus.trim(),
      agreedToTerms: true,
      createdAt: Date.now(),
    };

    try {
      // Save draft so we can restore on back navigation
      authService.saveSignupDraft(draft);

      // Create Firebase Auth user + send email verification
      await authService.signUp(draft);
      sound.playCorrect();

      // Navigate to email verification screen
      if (onNavigateToEmailVerification) {
        onNavigateToEmailVerification(cleanEmail);
      } else {
        setSuccessMessage('Email verifikasi telah dikirim. Silakan cek kotak masuk Anda.');
      }
    } catch (err: any) {
      sound.playWrong();
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    sound.playClick();

    try {
      const { session, isNewProfile } = await authService.signInWithGoogle();
      sound.playCorrect();
      onAuthSuccess(session, isNewProfile);
    } catch (err: any) {
      sound.playWrong();
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', text: 'Masukkan alamat email Anda.' });
      return;
    }

    setIsForgotLoading(true);
    setForgotStatus(null);
    sound.playClick();

    try {
      await authService.resetPassword(forgotEmail.trim());
      sound.playCorrect();
      setForgotStatus({
        type: 'success',
        text: 'Instruksi reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk/spam.',
      });
    } catch (err: any) {
      sound.playWrong();
      setForgotStatus({
        type: 'error',
        text: getFriendlyErrorMessage(err),
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-start py-8 sm:py-14 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Subtle Background Watermark Shield */}
      <div className="fixed -right-16 -top-16 w-80 h-80 pointer-events-none opacity-[0.03] text-[#0077C0] z-0">
        <Shield className="w-full h-full stroke-[1] fill-current" />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#DDE6E2] shadow-[0_10px_35px_rgba(0,119,192,0.06)] p-6 sm:p-8 relative z-10 space-y-6 my-auto shrink-0">
        
        {/* Brand Header & Mascot Avatar */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#E0F2FE] to-[#C7EEFF]/50 border border-[#E5EBE8] shadow-xs flex items-center justify-center p-2 group">
            <img
              src="/mascot/logo.png"
              alt="Logo GO Lantas"
              className="w-full h-full object-contain drop-shadow-md animate-float-mascot-smooth"
              onError={(e) => {
                e.currentTarget.src = '/mascot/mascot.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0077C0] text-white text-[9px] font-black border-2 border-white shadow-2xs">
              POLRI
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0F172A] tracking-tight">
              {isLoginMode ? 'Selamat Datang!' : 'Pendaftaran Akun Baru'}
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
              {isLoginMode
                ? 'Masuk ke portal edukasi dan pemantauan tertib lalu lintas GO Lantas.'
                : 'Daftar akun resmi dan verifikasi melalui email Anda.'}
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutSeconds > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <Clock className="w-4 h-4 shrink-0 text-rose-600 animate-spin" />
            <div>
              <span>Akun terkunci karena 5x percobaan gagal.</span>
              <span className="block font-black text-rose-800 mt-0.5">
                Silakan tunggu {lockoutSeconds} detik sebelum mencoba kembali.
              </span>
            </div>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || lockoutSeconds > 0}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-[#DDE6E2] hover:border-[#0077C0] disabled:opacity-50 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all hover:bg-slate-50/80 shadow-2xs btn-press"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            atau gunakan email
          </span>
        </div>

        {/* Error / Success Feedback Banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Exclusive Fields */}
          {!isLoginMode && (
            <>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Role Picker (4 Options) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Pilih Peran Akun
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('pelajar');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                      role === 'pelajar'
                        ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                        : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Pelajar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('mahasiswa');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                      role === 'mahasiswa'
                        ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                        : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Mahasiswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('orang_tua');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all btn-press flex flex-col items-center justify-center gap-1.5 ${
                      role === 'orang_tua'
                        ? 'bg-blue-50 border-[#0077C0] text-[#0077C0] shadow-xs'
                        : 'bg-[#F6FAF8] border-[#DDE6E2] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Orang Tua</span>
                  </button>
                </div>
              </div>

              {/* School / Campus Name */}
              {(role === 'pelajar' || role === 'mahasiswa') && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    {role === 'pelajar' ? 'Nama Sekolah (SMP/SMA)' : 'Nama Universitas / Kampus'}
                  </label>
                  <input
                    type="text"
                    placeholder={role === 'pelajar' ? 'Contoh: SMAN 2 Taruna Bhayangkara' : 'Contoh: Universitas Airlangga'}
                    value={sekolahKampus}
                    onChange={(e) => setSekolahKampus(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:bg-white transition-all"
                  />
                </div>
              )}
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
              Alamat Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                Kata Sandi
              </label>
              {isLoginMode && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setForgotEmail(email);
                    setForgotStatus(null);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#0077C0] hover:underline"
                >
                  Lupa kata sandi?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={isLoginMode ? 'Masukkan kata sandi' : 'Minimal 8 karakter'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Checklist (Sign Up Mode Only) */}
          {!isLoginMode && password.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-[11px] animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">Kekuatan Kata Sandi:</span>
                <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded-full text-white ${passwordPolicy.strengthColor}`}>
                  {passwordPolicy.strengthLabel}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${passwordPolicy.strengthColor}`} 
                  style={{ width: `${(passwordPolicy.score / 5) * 100}%` }}
                />
              </div>

              {/* 5-Criteria Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-slate-500">
                <div className={`flex items-center gap-1 ${passwordPolicy.checks.minLength ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordPolicy.checks.minLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-center">•</span>}
                  <span>Minimal 8 karakter</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordPolicy.checks.hasUppercase ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordPolicy.checks.hasUppercase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-center">•</span>}
                  <span>Huruf besar (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordPolicy.checks.hasLowercase ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordPolicy.checks.hasLowercase ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-center">•</span>}
                  <span>Huruf kecil (a-z)</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordPolicy.checks.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordPolicy.checks.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-center">•</span>}
                  <span>Angka (0-9)</span>
                </div>
                <div className={`flex items-center gap-1 col-span-2 ${passwordPolicy.checks.hasSpecialChar ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordPolicy.checks.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 text-center">•</span>}
                  <span>Simbol / Karakter khusus (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password (Sign Up Mode Only) */}
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-[#F6FAF8] border text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all ${
                    confirmPassword && !isPasswordMatch
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-[#DDE6E2] focus:border-[#0077C0]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !isPasswordMatch && (
                <p className="text-[10px] text-rose-500 font-semibold pl-1">
                  Kata sandi tidak cocok.
                </p>
              )}
            </div>
          )}

          {/* Terms & PDP Privacy Consent Checkbox (Sign Up Mode Only) */}
          {!isLoginMode && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#0077C0] focus:ring-[#0077C0] w-4 h-4"
                />
                <span>
                  Saya menyetujui <strong>Ketentuan Layanan</strong> & <strong>Kebijakan Privasi</strong> Korlantas POLRI (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi).
                </span>
              </label>

              {role === 'pelajar' && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[10px] text-blue-800 leading-snug flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#0077C0]" />
                  <span>
                    Catatan: Pengguna usia &lt;17 tahun disarankan memperoleh persetujuan & pendampingan orang tua/wali.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || lockoutSeconds > 0 || (!isLoginMode && (!agreedToTerms || !passwordPolicy.isValid || !isPasswordMatch))}
            className="w-full h-12 rounded-2xl bg-[#0077C0] hover:bg-[#008be0] disabled:bg-slate-200 disabled:text-slate-400 text-white font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md btn-press mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-white typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-white typing-dot-3" />
                <span>{isLoginMode ? 'Memverifikasi...' : 'Mengirim Kode OTP...'}</span>
              </div>
            ) : (
              <>
                <span>{isLoginMode ? 'Masuk ke GO Lantas' : 'Kirim Kode OTP & Lanjutkan'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login & Register */}
        <div className="pt-2 text-center space-y-1.5">
          <p className="text-xs text-slate-600 font-medium">
            {isLoginMode ? 'Belum memiliki akun GO Lantas?' : 'Sudah memiliki akun?'}
            {' '}
            <button
              type="button"
              onClick={handleToggleMode}
              className="font-extrabold text-[#0077C0] hover:underline"
            >
              {isLoginMode ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>

          {isLoginMode && onNavigateToReverify && (
            <p className="text-[11px] text-slate-400">
              Akun belum diverifikasi?{' '}
              <button
                type="button"
                onClick={() => onNavigateToReverify(email)}
                className="font-bold text-[#0077C0] hover:underline"
              >
                Verifikasi ulang OTP
              </button>
            </p>
          )}
        </div>

        {/* Terms Footer */}
        <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
          &copy; 2026 Korlantas POLRI — Pelopor Keselamatan Berlalu Lintas Digital
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div 
          onClick={() => setIsForgotModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#DDE6E2] shadow-2xl space-y-4 animate-fadeInScale relative"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-black text-[#0F172A]">
                Reset Kata Sandi
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>

            {forgotStatus && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                forgotStatus.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}>
                {forgotStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{forgotStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F6FAF8] border border-[#DDE6E2] text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0077C0]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0077C0] hover:bg-[#008be0] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {isForgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
