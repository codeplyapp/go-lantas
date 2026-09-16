// Firebase Authentication Service for SIGAP / GO Lantas
// Pure Firebase Auth — no MockDB, no demo mode fallback
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { firestoreService } from './firestore';
import { UserProfile, UserRole } from '../core/types';

const SIGNUP_DRAFT_KEY = 'sigap_signup_draft';
const RATE_LIMIT_STORAGE_KEY = 'sigap_rate_limit_';
const CACHED_SESSION_KEY = 'golantas_cached_auth_session';

export interface SignupDraft {
  nama: string;
  email: string;
  pass: string;
  role: UserRole;
  sekolah_kampus?: string;
  agreedToTerms: boolean;
  createdAt: number;
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

/**
 * Translate Firebase error codes into friendly Indonesian messages
 */
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
  if (code.includes('auth/unauthorized-domain')) {
    return 'Domain Vercel ini belum didaftarkan di Firebase Console. Buka Firebase Console > Authentication > Settings > Authorized domains, lalu tambahkan domain aplikasi Vercel Anda.';
  }
  if (code.includes('auth/operation-not-allowed') || code.includes('auth/configuration-not-found')) {
    return 'Layanan Authentication belum diaktifkan di Firebase Console. Pastikan menu Authentication > Sign-in method (Email/Password & Google) sudah diaktifkan.';
  }

  return error?.message || 'Terjadi kesalahan pada proses autentikasi. Silakan coba lagi.';
}

export const authService = {
  isConfigured(): boolean {
    return isFirebaseConfigured();
  },

  getCurrentUser(): User | null {
    return auth?.currentUser || null;
  },

  // ─── Local Session Cache (Instant Persistence across Refresh/Close) ────────
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
  },

  // ─── Rate Limiter (Brute-Force Protection) ──────────────────────────────────
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
    } catch {
      return 0;
    }
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

    // Reset if previous lock expired
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

  // ─── Signup Draft ───────────────────────────────────────────────────────────
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

  // ─── Sign Up (Firebase Email Verification Flow) ─────────────────────────────

  /**
   * Register new user with Firebase Auth + send email verification.
   * Returns the created user (emailVerified: false until they click the link).
   */
  async signUp(draft: SignupDraft): Promise<AuthSession> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error('Firebase belum dikonfigurasi. Hubungi administrator sistem.');
    }

    const { email, pass, nama, role, sekolah_kampus } = draft;

    // 1. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, pass);

    // 2. Set display name
    await updateProfile(cred.user, { displayName: nama });

    // 3. Create Firestore profile
    const profile = await firestoreService.ensureUserProfile(cred.user.uid, {
      email,
      nama,
      role,
      sekolah_kampus,
    });

    // 4. Send email verification
    await sendEmailVerification(cred.user);

    this.clearSignupDraft();
    this.clearFailedAttempts(email);

    const session: AuthSession = {
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: nama,
        photoURL: cred.user.photoURL,
        emailVerified: false,
      },
      profile,
    };

    this.setCachedSession(session);
    return session;
  },

  /**
   * Resend email verification to the currently signed-in user
   */
  async resendEmailVerification(): Promise<void> {
    if (!isFirebaseConfigured() || !auth?.currentUser) {
      throw new Error('Tidak ada sesi aktif. Silakan masuk terlebih dahulu.');
    }
    await sendEmailVerification(auth.currentUser);
  },

  /**
   * Reload current user and check emailVerified status
   */
  async checkEmailVerified(): Promise<boolean> {
    if (!auth?.currentUser) return false;
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  },

  // ─── Sign In ────────────────────────────────────────────────────────────────

  /**
   * Sign In with Email and Password + Rate Limiter + emailVerified check
   */
  async signIn(email: string, pass: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();

    // Check lockout
    const remainingLockout = this.getRemainingLockoutSeconds(cleanEmail);
    if (remainingLockout > 0) {
      throw new Error(`Akun terkunci karena 5x kesalahan. Harap tunggu ${remainingLockout} detik.`);
    }

    if (!isFirebaseConfigured() || !auth) {
      throw new Error('Firebase belum dikonfigurasi. Hubungi administrator sistem.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);

      // Block login if email not verified
      if (!cred.user.emailVerified) {
        // Sign out silently so they can't bypass the guard
        await signOut(auth);
        const err: any = new Error('Harap verifikasi email Anda terlebih dahulu. Cek kotak masuk atau folder spam.');
        err.code = 'auth/email-not-verified';
        throw err;
      }

      let profile = await firestoreService.getUserProfile(cred.user.uid);
      if (!profile) {
        profile = await firestoreService.ensureUserProfile(cred.user.uid, {
          email: cred.user.email || cleanEmail,
          nama: cred.user.displayName || cleanEmail.split('@')[0],
          role: 'pelajar',
        });
      }

      this.clearFailedAttempts(cleanEmail);

      const session: AuthSession = {
        user: {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || profile.nama,
          photoURL: cred.user.photoURL,
          emailVerified: cred.user.emailVerified,
        },
        profile,
      };

      this.setCachedSession(session);
      return session;
    } catch (err: any) {
      if (err.code !== 'auth/email-not-verified') {
        this.recordFailedAttempt(cleanEmail);
      }
      throw err;
    }
  },

  // ─── Google Sign In ─────────────────────────────────────────────────────────

  /**
   * Sign In with Google Popup (Google accounts are auto-verified)
   */
  async signInWithGoogle(): Promise<{ session: AuthSession; isNewProfile: boolean }> {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      throw new Error('Firebase belum dikonfigurasi. Hubungi administrator sistem.');
    }

    const cred = await signInWithPopup(auth, googleProvider);
    let existingProfile = await firestoreService.getUserProfile(cred.user.uid);

    if (existingProfile) {
      const session: AuthSession = {
        user: {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          emailVerified: cred.user.emailVerified,
        },
        profile: existingProfile,
      };
      this.setCachedSession(session);
      return {
        session,
        isNewProfile: false,
      };
    }

    // New Google user — create session without profile yet (needs role selection)
    const newSession: AuthSession = {
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        emailVerified: cred.user.emailVerified,
      },
      profile: null,
    };
    this.setCachedSession(newSession);

    return {
      session: newSession,
      isNewProfile: true,
    };
  },

  // ─── Password Reset ─────────────────────────────────────────────────────────

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error('Firebase belum dikonfigurasi.');
    }
    await sendPasswordResetEmail(auth, email);
  },

  // ─── Sign Out ────────────────────────────────────────────────────────────────

  async signOutUser(): Promise<void> {
    this.setCachedSession(null);
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('[Auth] Sign out error:', err);
      }
    }
    this.clearSignupDraft();
  },

  // ─── Auth State Listener ────────────────────────────────────────────────────

  /**
   * Listen to Firebase Authentication state changes with robust fallback and persistence
   */
  onAuthChange(callback: (session: AuthSession | null) => void): () => void {
    if (!isFirebaseConfigured() || !auth) {
      const cached = this.getCachedSession();
      callback(cached);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        let profile = await firestoreService.getUserProfile(firebaseUser.uid);
        
        // If profile fetch fails or delayed, recover from cache or safe fallback
        if (!profile) {
          const cached = this.getCachedSession();
          if (cached?.profile && cached.user?.uid === firebaseUser.uid) {
            profile = cached.profile;
          } else {
            profile = await firestoreService.ensureUserProfile(firebaseUser.uid, {
              email: firebaseUser.email || '',
              nama: firebaseUser.displayName || 'Pengguna GO Lantas',
              role: 'pelajar',
            });
          }
        }

        const sessionObj: AuthSession = {
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || profile.nama,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          },
          profile,
        };

        this.setCachedSession(sessionObj);
        callback(sessionObj);
      } else {
        this.setCachedSession(null);
        callback(null);
      }
    });

    return unsubscribe;
  },
};
