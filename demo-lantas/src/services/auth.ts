// Authentication Service for GO Lantas — Simulated Mock Auth (Frontend-Only Prototype)
// 100% Identical Public API without Firebase dependency + Demo Verification Code simulation

import { firestoreService } from './firestore';
import { UserProfile, UserRole } from '../core/types';

const SIGNUP_DRAFT_KEY = 'sigap_signup_draft';
const RATE_LIMIT_STORAGE_KEY = 'sigap_rate_limit_';
const CACHED_SESSION_KEY = 'golantas_cached_auth_session';
const MOCK_AUTH_ACCOUNTS_KEY = 'golantas_mock_auth_accounts';

export interface SignupDraft {
  nama: string;
  email: string;
  pass: string;
  role: UserRole;
  sekolah_kampus?: string;
  agreedToTerms: boolean;
  createdAt: number;
}

export interface MockAuthAccount {
  uid: string;
  email: string;
  pass: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  verificationCode: string;
  role: UserRole;
  sekolah_kampus?: string;
}

export interface AuthSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  } | null;
  profile: UserProfile | null;
}

export function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || '';

  if (
    code.includes('auth/invalid-credential') ||
    code.includes('auth/wrong-password') ||
    code.includes('auth/user-not-found')
  ) {
    return 'Email atau kata sandi yang Anda masukkan salah.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'Alamat email ini sudah terdaftar. Silakan gunakan menu Masuk.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Format alamat email tidak valid.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Kata sandi tidak memenuhi kebijakan keamanan (minimal 8 karakter, kombinasi huruf, angka & simbol).';
  }
  if (
    code.includes('auth/popup-closed-by-user') ||
    code.includes('auth/cancelled-popup-request')
  ) {
    return 'Proses login dengan Google dibatalkan.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Terlalu banyak percobaan gagal. Akun sementara dikunci demi keamanan. Silakan tunggu beberapa menit.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
  }
  if (code.includes('auth/user-disabled')) {
    return 'Akun ini telah dinonaktifkan oleh administrator Korlantas.';
  }

  return error?.message || 'Terjadi kesalahan pada proses autentikasi. Silakan coba lagi.';
}

// In-Memory Pub/Sub for Auth State Listeners
type AuthListener = (session: AuthSession | null) => void;
const authListeners: Set<AuthListener> = new Set();

function notifyAuthListeners(session: AuthSession | null) {
  authListeners.forEach((listener) => {
    try {
      listener(session);
    } catch (err) {
      console.error('[AuthService] Listener error:', err);
    }
  });
}

function getStoredAccounts(): MockAuthAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_AUTH_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Seed default demo account
  const defaultAccounts: MockAuthAccount[] = [
    {
      uid: 'demo_user_001',
      email: 'demo@golantas.id',
      pass: 'demo1234',
      displayName: 'Bripda Alif Farhan',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
      verificationCode: '881122',
      role: 'pelajar',
      sekolah_kampus: 'SMAN 2 Taruna Bhayangkara',
    },
  ];
  try {
    localStorage.setItem(MOCK_AUTH_ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
  } catch {}
  return defaultAccounts;
}

function saveStoredAccounts(accounts: MockAuthAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOCK_AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

export const authService = {
  isConfigured(): boolean {
    return true; // Always ready in mock/demo mode
  },

  getCurrentUser(): any {
    const session = this.getCachedSession();
    return session?.user || null;
  },

  // ─── Local Session Cache ───────────────────────────────────────────────────

  getCachedSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(CACHED_SESSION_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.user && data.user.uid) {
        return data as AuthSession;
      }
    } catch {}
    return null;
  },

  setCachedSession(session: AuthSession | null): void {
    try {
      if (session && session.user) {
        localStorage.setItem(CACHED_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(CACHED_SESSION_KEY);
      }
    } catch {}
    notifyAuthListeners(session);
  },

  // ─── Rate Limiter ──────────────────────────────────────────────────────────

  getRateLimitKey(email: string): string {
    return `${RATE_LIMIT_STORAGE_KEY}${email.trim().toLowerCase()}`;
  },

  getRemainingLockoutSeconds(email: string): number {
    const raw = localStorage.getItem(this.getRateLimitKey(email));
    if (!raw) return 0;
    try {
      const data = JSON.parse(raw);
      if (data.lockedUntil && Date.now() < data.lockedUntil) {
        return Math.ceil((data.lockedUntil - Date.now()) / 1000);
      }
    } catch {}
    return 0;
  },

  recordFailedAttempt(email: string): { attempts: number; isLocked: boolean; lockoutSeconds: number } {
    const key = this.getRateLimitKey(email);
    const now = Date.now();
    let data = { count: 0, lockedUntil: 0 };

    try {
      const raw = localStorage.getItem(key);
      if (raw) data = JSON.parse(raw);
    } catch {
      data = { count: 0, lockedUntil: 0 };
    }

    if (data.lockedUntil && now > data.lockedUntil) {
      data.count = 0;
      data.lockedUntil = 0;
    }

    data.count += 1;

    if (data.count >= 5) {
      data.lockedUntil = now + 5 * 60 * 1000;
      localStorage.setItem(key, JSON.stringify(data));
      return { attempts: data.count, isLocked: true, lockoutSeconds: 300 };
    }

    localStorage.setItem(key, JSON.stringify(data));
    return { attempts: data.count, isLocked: false, lockoutSeconds: 0 };
  },

  clearFailedAttempts(email: string): void {
    try {
      localStorage.removeItem(this.getRateLimitKey(email));
    } catch {}
  },

  // ─── Signup Draft ──────────────────────────────────────────────────────────

  saveSignupDraft(draft: SignupDraft): void {
    try {
      localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  },

  getSignupDraft(): SignupDraft | null {
    try {
      const raw = localStorage.getItem(SIGNUP_DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.createdAt > 30 * 60 * 1000) {
        this.clearSignupDraft();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clearSignupDraft(): void {
    try {
      localStorage.removeItem(SIGNUP_DRAFT_KEY);
    } catch {}
  },

  // ─── Demo Verification Code Helpers ────────────────────────────────────────

  getDemoVerificationCode(email?: string): string {
    const accounts = getStoredAccounts();
    const targetEmail = (email || this.getCurrentUser()?.email || '').trim().toLowerCase();
    const acc = accounts.find((a) => a.email.toLowerCase() === targetEmail);
    return acc ? acc.verificationCode : '782190';
  },

  // ─── Sign Up Flow ──────────────────────────────────────────────────────────

  async signUp(draft: SignupDraft): Promise<AuthSession> {
    const { email, pass, nama, role, sekolah_kampus } = draft;
    const cleanEmail = email.trim().toLowerCase();

    const accounts = getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      const err: any = new Error('Alamat email ini sudah terdaftar.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    // Generate random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newAccount: MockAuthAccount = {
      uid,
      email: cleanEmail,
      pass,
      displayName: nama,
      photoURL: '/mascot/logo.png',
      emailVerified: false,
      verificationCode,
      role,
      sekolah_kampus,
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    // Create user profile in MockStore
    const profile = await firestoreService.ensureUserProfile(uid, {
      email: cleanEmail,
      nama,
      role,
      sekolah_kampus,
    });

    this.clearSignupDraft();
    this.clearFailedAttempts(cleanEmail);

    const session: AuthSession = {
      user: {
        uid,
        email: cleanEmail,
        displayName: nama,
        photoURL: '/mascot/logo.png',
        emailVerified: false,
      },
      profile,
    };

    this.setCachedSession(session);
    return session;
  },

  /**
   * Resend simulated verification email (generates new 6-digit code)
   */
  async resendEmailVerification(targetEmail?: string): Promise<string> {
    const accounts = getStoredAccounts();
    const userEmail = (targetEmail || this.getCurrentUser()?.email || '').trim().toLowerCase();
    const acc = accounts.find((a) => a.email.toLowerCase() === userEmail);
    
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (acc) {
      acc.verificationCode = newCode;
      saveStoredAccounts(accounts);
    }
    return newCode;
  },

  /**
   * Verify email via demo code or 1-click button
   */
  async verifyEmail(email?: string): Promise<boolean> {
    const accounts = getStoredAccounts();
    const userEmail = (email || this.getCurrentUser()?.email || '').trim().toLowerCase();
    const acc = accounts.find((a) => a.email.toLowerCase() === userEmail);

    if (acc) {
      acc.emailVerified = true;
      saveStoredAccounts(accounts);
    }

    const currentSession = this.getCachedSession();
    if (currentSession?.user) {
      const updatedSession: AuthSession = {
        ...currentSession,
        user: {
          ...currentSession.user,
          emailVerified: true,
        },
      };
      this.setCachedSession(updatedSession);
    }

    return true;
  },

  /**
   * Check if email is verified
   */
  async checkEmailVerified(): Promise<boolean> {
    const currentSession = this.getCachedSession();
    if (!currentSession?.user?.email) return false;

    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === currentSession.user!.email!.toLowerCase());
    return acc ? acc.emailVerified : false;
  },

  // ─── Sign In ───────────────────────────────────────────────────────────────

  async signIn(email: string, pass: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();

    // Rate Limiting Check
    const remainingLockout = this.getRemainingLockoutSeconds(cleanEmail);
    if (remainingLockout > 0) {
      throw new Error(`Akun terkunci karena 5x kesalahan. Harap tunggu ${remainingLockout} detik.`);
    }

    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!acc || acc.pass !== pass) {
      this.recordFailedAttempt(cleanEmail);
      const err: any = new Error('Email atau kata sandi yang Anda masukkan salah.');
      err.code = 'auth/invalid-credential';
      throw err;
    }

    // Check email verification status
    if (!acc.emailVerified) {
      const err: any = new Error('Harap verifikasi email Anda terlebih dahulu.');
      err.code = 'auth/email-not-verified';
      throw err;
    }

    let profile = await firestoreService.getUserProfile(acc.uid);
    if (!profile) {
      profile = await firestoreService.ensureUserProfile(acc.uid, {
        email: acc.email,
        nama: acc.displayName,
        role: acc.role || 'pelajar',
        sekolah_kampus: acc.sekolah_kampus,
      });
    }

    this.clearFailedAttempts(cleanEmail);

    const session: AuthSession = {
      user: {
        uid: acc.uid,
        email: acc.email,
        displayName: acc.displayName,
        photoURL: acc.photoURL || null,
        emailVerified: true,
      },
      profile,
    };

    this.setCachedSession(session);
    return session;
  },

  // ─── Google Sign In (Auto-Verified Demo) ───────────────────────────────────

  async signInWithGoogle(): Promise<{ session: AuthSession; isNewProfile: boolean }> {
    const googleEmail = 'taruna.polri@gmail.com';
    const accounts = getStoredAccounts();
    let acc = accounts.find((a) => a.email === googleEmail);

    if (!acc) {
      acc = {
        uid: 'google_user_demo_01',
        email: googleEmail,
        pass: 'google_demo_pass',
        displayName: 'Taruna Akpol Pratama',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        emailVerified: true,
        verificationCode: '654321',
        role: 'mahasiswa',
        sekolah_kampus: 'Akademi Kepolisian (AKPOL)',
      };
      accounts.push(acc);
      saveStoredAccounts(accounts);
    }

    let profile = await firestoreService.getUserProfile(acc.uid);
    const isNew = !profile;

    if (!profile) {
      profile = await firestoreService.ensureUserProfile(acc.uid, {
        email: acc.email,
        nama: acc.displayName,
        role: acc.role,
        sekolah_kampus: acc.sekolah_kampus,
        avatar_url: acc.photoURL,
      });
    }

    const session: AuthSession = {
      user: {
        uid: acc.uid,
        email: acc.email,
        displayName: acc.displayName,
        photoURL: acc.photoURL || null,
        emailVerified: true,
      },
      profile,
    };

    this.setCachedSession(session);
    return { session, isNewProfile: isNew };
  },

  // ─── Password Reset ────────────────────────────────────────────────────────

  async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!acc) {
      // Simulate silent success for security
      return;
    }
  },

  // ─── Sign Out ──────────────────────────────────────────────────────────────

  async signOutUser(): Promise<void> {
    this.setCachedSession(null);
    this.clearSignupDraft();
  },

  // ─── Auth State Listener ───────────────────────────────────────────────────

  onAuthChange(callback: (session: AuthSession | null) => void): () => void {
    authListeners.add(callback);
    const current = this.getCachedSession();
    // Fire callback immediately with current cache
    callback(current);

    return () => {
      authListeners.delete(callback);
    };
  },
};
