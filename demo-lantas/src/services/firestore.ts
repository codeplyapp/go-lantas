// Firestore Service for SIGAP / GO Lantas — Pure Firebase, No MockDB
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, Timestamp, Unsubscribe, increment,
} from 'firebase/firestore';
import { 
  UserProfile, UserRole, QuizAttempt, ModuleProgress, 
  ExamAttempt, CertificateData, SOSAlert, FamilyLink, FamilyAccessLog,
  ModuleData, QuizQuestion
} from '../core/types';

const COLLECTION_USERS = 'users';
const COLLECTION_QUIZ_ATTEMPTS = 'quiz_attempts';
const COLLECTION_EXAM_ATTEMPTS = 'exam_attempts';
const COLLECTION_CERTIFICATES = 'certificates';
const COLLECTION_SOS_ALERTS = 'sos_alerts';
const COLLECTION_FAMILY_LINKS = 'family_links';
const COLLECTION_FAMILY_LOGS = 'family_logs';

export const firestoreService = {
  // ─── User Profile ─────────────────────────────────────────────────────────

  /**
   * Retrieve user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const userDocRef = doc(db, COLLECTION_USERS, uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
    } catch (err) {
      console.warn('[Firestore] Error getting user profile:', err);
    }
    return null;
  },

  /**
   * Create or ensure user profile exists in Firestore
   */
  async ensureUserProfile(
    uid: string,
    initial: {
      email: string;
      nama: string;
      role: UserRole;
      sekolah_kampus?: string;
      kelas_jurusan?: string;
      avatar_url?: string;
    }
  ): Promise<UserProfile> {
    const existing = await this.getUserProfile(uid);
    if (existing) return existing;

    const newProfile: UserProfile = {
      uid,
      nama: initial.nama || 'Pengguna GO Lantas',
      role: initial.role || 'pelajar',
      sekolah_kampus: initial.sekolah_kampus || '',
      kelas_jurusan: initial.kelas_jurusan || '',
      poin_total: 100, // Welcome bonus
      streak_hari: 1,
      kuis_selesai: 0,
      jawaban_benar: 0,
      total_jawaban: 0,
      avatar_url: initial.avatar_url || '/mascot/logo.png',
      pairing_code: 'SGP-' + Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      last_aktivitas: new Date().toISOString().slice(0, 10),
    };

    if (isFirebaseConfigured() && db) {
      try {
        const userDocRef = doc(db, COLLECTION_USERS, uid);
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (err) {
        console.warn('[Firestore] Error creating user profile:', err);
      }
    }

    return newProfile;
  },

  /**
   * Update profile fields in Firestore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      const userDocRef = doc(db, COLLECTION_USERS, uid);
      await updateDoc(userDocRef, updates as Record<string, unknown>);
    } catch (err) {
      console.warn('[Firestore] Error updating user profile:', err);
    }
  },

  /**
   * Add points atomically using FieldValue.increment
   */
  async addPoints(uid: string, delta: number): Promise<void> {
    if (!isFirebaseConfigured() || !db || delta <= 0) return;
    try {
      const userDocRef = doc(db, COLLECTION_USERS, uid);
      await updateDoc(userDocRef, {
        poin_total: increment(delta),
      });
    } catch (err) {
      console.warn('[Firestore] Error adding points:', err);
    }
  },

  /**
   * Register user quiz/study activity (updates streak and answer counters)
   */
  async registerActivity(uid: string, stats?: { isCorrect?: boolean; quizDone?: boolean }): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      const userDocRef = doc(db, COLLECTION_USERS, uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) return;

      const current = snap.data() as UserProfile;
      const today = new Date().toISOString().slice(0, 10);
      const last = current.last_aktivitas;

      let newStreak = current.streak_hari || 1;
      if (!last) {
        newStreak = 1;
      } else if (last === today) {
        // Same day activity - streak remains
        newStreak = current.streak_hari || 1;
      } else {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (last === yesterday) {
          newStreak = (current.streak_hari || 0) + 1;
        } else {
          newStreak = 1; // Missed day, reset streak
        }
      }

      const updates: Record<string, any> = {
        last_aktivitas: today,
        streak_hari: newStreak,
      };

      if (stats?.quizDone) {
        updates.kuis_selesai = increment(1);
      }
      if (stats?.isCorrect !== undefined) {
        updates.total_jawaban = increment(1);
        if (stats.isCorrect) {
          updates.jawaban_benar = increment(1);
        }
      }

      await updateDoc(userDocRef, updates);
    } catch (err) {
      console.warn('[Firestore] Error registering activity:', err);
    }
  },

  /**
   * Realtime listener for a specific user profile
   */
  subscribeUserProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe | null {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const userDocRef = doc(db, COLLECTION_USERS, uid);
      return onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          callback(snap.data() as UserProfile);
        } else {
          callback(null);
        }
      }, (err) => {
        console.warn('[Firestore] User profile listener error:', err);
      });
    } catch (err) {
      console.warn('[Firestore] Error setting up user profile listener:', err);
      return null;
    }
  },

  // ─── Quiz Attempts ─────────────────────────────────────────────────────────

  /**
   * Save a quiz attempt to Firestore
   * Aligned with firestore.rules: request.auth.uid == request.resource.data.uid
   */
  async saveQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      await addDoc(collection(db, COLLECTION_QUIZ_ATTEMPTS), {
        ...attempt,
        timestamp: attempt.timestamp || new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Firestore] Error saving quiz attempt:', err);
    }
  },

  /**
   * Get quiz attempts for a specific user (one-time fetch)
   */
  async getQuizAttempts(uid: string, maxItems = 20): Promise<QuizAttempt[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_QUIZ_ATTEMPTS),
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(maxItems)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
    } catch (err) {
      console.warn('[Firestore] Error fetching quiz attempts:', err);
      return [];
    }
  },

  /**
   * Realtime listener for quiz attempts of a user
   */
  subscribeQuizAttempts(uid: string, callback: (attempts: QuizAttempt[]) => void, maxLimit = 20): Unsubscribe | null {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const q = query(
        collection(db, COLLECTION_QUIZ_ATTEMPTS),
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(maxLimit)
      );
      return onSnapshot(q, (snap) => {
        const attempts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
        callback(attempts);
      }, (err) => {
        console.warn('[Firestore] Quiz attempts listener warning:', err);
      });
    } catch (err) {
      console.warn('[Firestore] Error setting up quiz attempts listener:', err);
      return null;
    }
  },

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  /**
   * Get leaderboard from Firestore users collection (sorted by poin_total)
   */
  async getLeaderboard(maxItems = 20): Promise<UserProfile[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_USERS),
        orderBy('poin_total', 'desc'),
        limit(maxItems)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserProfile);
    } catch (err) {
      console.warn('[Firestore] Error fetching leaderboard:', err);
      return [];
    }
  },

  /**
   * Real-time listener for Leaderboard with scope filter (nasional, sekolah, kampus)
   */
  subscribeLeaderboard(
    callback: (entries: UserProfile[]) => void,
    options?: {
      scope?: 'nasional' | 'sekolah' | 'kampus';
      school?: string;
      role?: string;
      limit?: number;
    }
  ): Unsubscribe | null {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const maxLimit = options?.limit || 20;
      const scope = options?.scope || 'nasional';

      let q = query(
        collection(db, COLLECTION_USERS),
        orderBy('poin_total', 'desc'),
        limit(maxLimit)
      );

      if (scope === 'sekolah') {
        if (options?.school) {
          q = query(
            collection(db, COLLECTION_USERS),
            where('role', '==', 'pelajar'),
            where('sekolah_kampus', '==', options.school),
            orderBy('poin_total', 'desc'),
            limit(maxLimit)
          );
        } else {
          q = query(
            collection(db, COLLECTION_USERS),
            where('role', '==', 'pelajar'),
            orderBy('poin_total', 'desc'),
            limit(maxLimit)
          );
        }
      } else if (scope === 'kampus') {
        if (options?.school) {
          q = query(
            collection(db, COLLECTION_USERS),
            where('role', '==', 'mahasiswa'),
            where('sekolah_kampus', '==', options.school),
            orderBy('poin_total', 'desc'),
            limit(maxLimit)
          );
        } else {
          q = query(
            collection(db, COLLECTION_USERS),
            where('role', '==', 'mahasiswa'),
            orderBy('poin_total', 'desc'),
            limit(maxLimit)
          );
        }
      }

      return onSnapshot(q, (snap) => {
        const entries = snap.docs.map((d) => d.data() as UserProfile);
        callback(entries);
      }, (err) => {
        console.warn('[Firestore] Scoped leaderboard listener fallback on error/missing index:', err);
        // Fallback to national query with client filter if compound index is pending
        try {
          if (!db) return;
          const fallbackQ = query(
            collection(db, COLLECTION_USERS),
            orderBy('poin_total', 'desc'),
            limit(50)
          );
          onSnapshot(fallbackQ, (fallbackSnap) => {
            let items = fallbackSnap.docs.map((d) => d.data() as UserProfile);
            if (scope === 'sekolah') {
              items = items.filter(u => u.role === 'pelajar' || (options?.school && u.sekolah_kampus === options.school));
            } else if (scope === 'kampus') {
              items = items.filter(u => u.role === 'mahasiswa' || (options?.school && u.sekolah_kampus === options.school));
            }
            callback(items.slice(0, maxLimit));
          });
        } catch {}
      });
    } catch (err) {
      console.warn('[Firestore] Error setting up leaderboard listener:', err);
      return null;
    }
  },

  // ─── Module Progress ────────────────────────────────────────────────────────

  /**
   * Get module progress for a user from subcollection users/{uid}/module_progress
   */
  async getModuleProgress(uid: string): Promise<ModuleProgress[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const progressRef = collection(db, COLLECTION_USERS, uid, 'module_progress');
      const snap = await getDocs(progressRef);
      return snap.docs.map((d) => ({ moduleId: d.id, ...d.data() } as ModuleProgress));
    } catch (err) {
      console.warn('[Firestore] Error fetching module progress:', err);
      return [];
    }
  },

  /**
   * Update/create module progress for a user
   */
  async updateModuleProgress(uid: string, moduleId: string, progress: Partial<ModuleProgress>): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      const progressRef = doc(db, COLLECTION_USERS, uid, 'module_progress', moduleId);
      await setDoc(progressRef, { ...progress, moduleId, updated_at: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Error updating module progress:', err);
    }
  },

  // ─── Extra / AI-Generated Curriculum Modules ───────────────────────────────

  /**
   * Save an AI-generated extra module and its corresponding quiz
   */
  async saveExtraModule(uid: string, module: ModuleData, quizQuestions: QuizQuestion[]): Promise<void> {
    // 1. Cache to localStorage
    if (typeof window !== 'undefined') {
      try {
        const modKey = `golantas_extra_modules_${uid}`;
        const quizKey = `golantas_extra_quizzes_${uid}`;
        const existingMods: ModuleData[] = JSON.parse(localStorage.getItem(modKey) || '[]');
        const updatedMods = existingMods.filter(m => m.id !== module.id).concat(module);
        localStorage.setItem(modKey, JSON.stringify(updatedMods));

        const existingQuizzes: Record<string, QuizQuestion[]> = JSON.parse(localStorage.getItem(quizKey) || '{}');
        existingQuizzes[module.id] = quizQuestions;
        localStorage.setItem(quizKey, JSON.stringify(existingQuizzes));
      } catch (cacheErr) {
        console.warn('[Firestore] LocalStorage cache error:', cacheErr);
      }
    }

    // 2. Persist to Firestore subcollections
    if (!isFirebaseConfigured() || !db) return;
    try {
      const moduleDocRef = doc(db, COLLECTION_USERS, uid, 'extra_modules', module.id);
      await setDoc(moduleDocRef, {
        ...module,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }, { merge: true });

      if (quizQuestions && quizQuestions.length > 0) {
        const quizDocRef = doc(db, COLLECTION_USERS, uid, 'extra_module_quizzes', module.id);
        await setDoc(quizDocRef, {
          moduleId: module.id,
          questions: quizQuestions,
          updated_at: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[Firestore] Error saving extra module to Firestore:', err);
    }
  },

  /**
   * Retrieve all AI-generated extra modules for a user
   */
  async getExtraModules(uid: string): Promise<ModuleData[]> {
    let localMods: ModuleData[] = [];
    if (typeof window !== 'undefined') {
      try {
        localMods = JSON.parse(localStorage.getItem(`golantas_extra_modules_${uid}`) || '[]');
      } catch {}
    }

    if (!isFirebaseConfigured() || !db) {
      return localMods;
    }

    try {
      const modulesRef = collection(db, COLLECTION_USERS, uid, 'extra_modules');
      const snap = await getDocs(modulesRef);
      if (!snap.empty) {
        const firestoreMods = snap.docs.map(d => ({ id: d.id, ...d.data() } as ModuleData));
        // Update local cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(`golantas_extra_modules_${uid}`, JSON.stringify(firestoreMods));
        }
        return firestoreMods;
      }
    } catch (err) {
      console.warn('[Firestore] Error fetching extra modules from Firestore:', err);
    }

    return localMods;
  },

  /**
   * Retrieve all AI-generated module quizzes for a user as a record map
   */
  async getExtraModuleQuizzes(uid: string): Promise<Record<string, QuizQuestion[]>> {
    let localQuizzes: Record<string, QuizQuestion[]> = {};
    if (typeof window !== 'undefined') {
      try {
        localQuizzes = JSON.parse(localStorage.getItem(`golantas_extra_quizzes_${uid}`) || '{}');
      } catch {}
    }

    if (!isFirebaseConfigured() || !db) {
      return localQuizzes;
    }

    try {
      const quizRef = collection(db, COLLECTION_USERS, uid, 'extra_module_quizzes');
      const snap = await getDocs(quizRef);
      if (!snap.empty) {
        const result: Record<string, QuizQuestion[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data && data.questions) {
            result[d.id] = data.questions as QuizQuestion[];
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(`golantas_extra_quizzes_${uid}`, JSON.stringify(result));
        }
        return result;
      }
    } catch (err) {
      console.warn('[Firestore] Error fetching extra module quizzes from Firestore:', err);
    }

    return localQuizzes;
  },

  /**
   * Retrieve a single extra module quiz
   */
  async getExtraModuleQuiz(uid: string, moduleId: string): Promise<QuizQuestion[] | null> {
    const all = await this.getExtraModuleQuizzes(uid);
    return all[moduleId] || null;
  },

  // ─── Exam Attempts ─────────────────────────────────────────────────────────

  /**
   * Save an exam attempt
   */
  async saveExamAttempt(attempt: Omit<ExamAttempt, 'id'>): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      await addDoc(collection(db, COLLECTION_EXAM_ATTEMPTS), {
        ...attempt,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Firestore] Error saving exam attempt:', err);
    }
  },

  /**
   * Get exam attempts for a user
   */
  async getExamAttempts(uid: string): Promise<ExamAttempt[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_EXAM_ATTEMPTS),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExamAttempt));
    } catch (err) {
      console.warn('[Firestore] Error fetching exam attempts:', err);
      return [];
    }
  },

  // ─── Certificates ──────────────────────────────────────────────────────────

  /**
   * Get certificates for a user
   */
  async getCertificates(uid: string): Promise<CertificateData[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const q = query(
        collection(db, COLLECTION_CERTIFICATES),
        where('uid', '==', uid),
        orderBy('tanggal_terbit', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertificateData));
    } catch (err) {
      console.warn('[Firestore] Error fetching certificates:', err);
      return [];
    }
  },

  /**
   * Save a new certificate
   */
  async saveCertificate(cert: Omit<CertificateData, 'id'>): Promise<void> {
    if (!isFirebaseConfigured() || !db) return;
    try {
      await addDoc(collection(db, COLLECTION_CERTIFICATES), {
        ...cert,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Firestore] Error saving certificate:', err);
    }
  },

  // ─── SOS Emergency Alerts (Firebase Spark Real-Time Sync) ───────────────────
  // NOTE: Pada paket Firebase Spark (tanpa Cloud Functions / FCM push notification),
  // pengiriman sinyal darurat SOS dan pembaruan lokasi bekerja melalui Firestore
  // onSnapshot real-time listener ketika aplikasi anggota keluarga sedang aktif/terbuka.

  /**
   * Save and broadcast an SOS Emergency Alert
   */
  async saveSOSAlert(alert: Omit<SOSAlert, 'id'>): Promise<string | null> {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const docRef = await addDoc(collection(db, COLLECTION_SOS_ALERTS), {
        ...alert,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.warn('[Firestore] Error saving SOS alert:', err);
      return null;
    }
  },

  /**
   * Listen to active SOS Emergency Alerts in real-time
   */
  subscribeSOSAlerts(callback: (alerts: SOSAlert[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured() || !db) return null;
    try {
      const q = query(
        collection(db, COLLECTION_SOS_ALERTS),
        where('status', '==', 'terkirim'),
        orderBy('waktu', 'desc'),
        limit(10)
      );
      return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SOSAlert));
        callback(alerts);
      }, (err) => {
        console.warn('[Firestore] SOS real-time listener warning:', err);
      });
    } catch (err) {
      console.warn('[Firestore] Error setting up SOS listener:', err);
      return null;
    }
  },

  // ─── Family Links & PDP Audit Logs (Firebase Spark Real-Time Sync) ──────────
  // NOTE: Pemantauan keluarga berbasis persetujuan (UU PDP No. 27/2022) mengandalkan
  // real-time sync Firestore pada aplikasi yang aktif.

  /**
   * Get family links for a given user (either parent or child)
   */
  async getFamilyLinks(uid: string): Promise<FamilyLink[]> {
    if (!isFirebaseConfigured() || !db) return [];
    try {
      const qParent = query(collection(db, COLLECTION_FAMILY_LINKS), where('parent_uid', '==', uid));
      const qChild = query(collection(db, COLLECTION_FAMILY_LINKS), where('child_uid', '==', uid));
      
      const [snapP, snapC] = await Promise.all([getDocs(qParent), getDocs(qChild)]);
      const combined = [
        ...snapP.docs.map(d => ({ id: d.id, ...d.data() } as FamilyLink)),
        ...snapC.docs.map(d => ({ id: d.id, ...d.data() } as FamilyLink))
      ];
      return combined;
    } catch (err) {
      console.warn('[Firestore] Error fetching family links:', err);
      return [];
    }
  },
};
