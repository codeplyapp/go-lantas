// Firestore Service for SIGAP / GO Lantas — Pure Firebase, No MockDB
import { db, isFirebaseConfigured } from '../config/firebase';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, addDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, Timestamp, Unsubscribe,
} from 'firebase/firestore';
import { 
  UserProfile, UserRole, QuizAttempt, ModuleProgress, 
  ExamAttempt, CertificateData, SOSAlert, FamilyLink, FamilyAccessLog 
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
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[Firestore] Error saving quiz attempt:', err);
    }
  },

  /**
   * Get quiz attempts for a specific user
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
