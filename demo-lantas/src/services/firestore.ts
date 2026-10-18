// Firestore Service for GO Lantas — Pure MockStore Architecture (Frontend-Only)
// 100% Identical Public API signatures & live subscriptions without Firebase dependencies

import { mockStore } from './mockStore';
import {
  UserProfile,
  UserRole,
  QuizAttempt,
  ModuleProgress,
  ExamAttempt,
  CertificateData,
  SOSAlert,
  FamilyLink,
  ModuleData,
  QuizQuestion,
  PointSource,
  PointHistoryEntry,
} from '../core/types';

export type Unsubscribe = () => void;

const KEY_USERS = 'golantas_mock_users';
const KEY_SOS_ALERTS = 'golantas_sos_alerts';
const KEY_FAMILY_LINKS = 'golantas_family_links';

export const firestoreService = {
  // ─── User Profile ─────────────────────────────────────────────────────────

  /**
   * Retrieve user profile from MockStore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const users = mockStore.get<UserProfile[]>(KEY_USERS, []);
    const user = users.find((u) => u.uid === uid);
    return user || null;
  },

  /**
   * Create or ensure user profile exists
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

    mockStore.upsertItem(KEY_USERS, newProfile, 'uid');
    await this.recordPointAward(
      uid,
      'welcome',
      'Bonus Selamat Datang',
      100,
      'Pendaftaran akun baru GO Lantas'
    );

    return newProfile;
  },

  /**
   * Update profile fields in MockStore
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const users = mockStore.get<UserProfile[]>(KEY_USERS, []);
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      mockStore.set(KEY_USERS, users);
    }
  },

  /**
   * Add points atomically
   */
  async addPoints(uid: string, delta: number): Promise<void> {
    if (delta <= 0) return;
    const users = mockStore.get<UserProfile[]>(KEY_USERS, []);
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        poin_total: (users[idx].poin_total || 0) + delta,
      };
      mockStore.set(KEY_USERS, users);
    }
  },

  /**
   * Register user quiz/study activity (updates streak and answer counters)
   */
  async registerActivity(
    uid: string,
    stats?: { isCorrect?: boolean; quizDone?: boolean }
  ): Promise<void> {
    const users = mockStore.get<UserProfile[]>(KEY_USERS, []);
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx < 0) return;

    const current = users[idx];
    const today = new Date().toISOString().slice(0, 10);
    const last = current.last_aktivitas;

    let newStreak = current.streak_hari || 1;
    if (!last) {
      newStreak = 1;
    } else if (last === today) {
      newStreak = current.streak_hari || 1;
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (last === yesterday) {
        newStreak = (current.streak_hari || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    const updatedUser: UserProfile = {
      ...current,
      last_aktivitas: today,
      streak_hari: newStreak,
      kuis_selesai: (current.kuis_selesai || 0) + (stats?.quizDone ? 1 : 0),
      total_jawaban: (current.total_jawaban || 0) + (stats?.isCorrect !== undefined ? 1 : 0),
      jawaban_benar:
        (current.jawaban_benar || 0) + (stats?.isCorrect === true ? 1 : 0),
    };

    users[idx] = updatedUser;
    mockStore.set(KEY_USERS, users);
  },

  /**
   * Realtime listener for a specific user profile
   */
  subscribeUserProfile(
    uid: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe | null {
    return mockStore.subscribe<UserProfile[]>(KEY_USERS, (allUsers) => {
      const found = (allUsers || []).find((u) => u.uid === uid) || null;
      callback(found);
    });
  },

  // ─── Quiz Attempts ─────────────────────────────────────────────────────────

  async saveQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<void> {
    const key = `golantas_quiz_attempts_${attempt.uid}`;
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: attempt.timestamp || new Date().toISOString(),
    };
    mockStore.upsertItem(key, newAttempt, 'id');
  },

  async getQuizAttempts(uid: string, maxItems = 20): Promise<QuizAttempt[]> {
    const key = `golantas_quiz_attempts_${uid}`;
    const attempts = mockStore.get<QuizAttempt[]>(key, []);
    return attempts.slice(0, maxItems);
  },

  subscribeQuizAttempts(
    uid: string,
    callback: (attempts: QuizAttempt[]) => void,
    maxLimit = 20
  ): Unsubscribe | null {
    const key = `golantas_quiz_attempts_${uid}`;
    return mockStore.subscribe<QuizAttempt[]>(key, (list) => {
      callback((list || []).slice(0, maxLimit));
    });
  },

  // ─── Point History ─────────────────────────────────────────────────────────

  async recordPointAward(
    uid: string,
    source: PointSource,
    judul: string,
    poin: number,
    detail?: string
  ): Promise<void> {
    if (!uid || poin <= 0) return;
    const key = `golantas_point_history_${uid}`;
    const entry: PointHistoryEntry = {
      id: 'point_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      uid,
      source,
      judul,
      poin,
      detail: detail || '',
      timestamp: new Date().toISOString(),
    };
    mockStore.upsertItem(key, entry, 'id');
  },

  subscribePointHistory(
    uid: string,
    callback: (entries: PointHistoryEntry[]) => void,
    maxLimit = 20
  ): Unsubscribe | null {
    const key = `golantas_point_history_${uid}`;
    return mockStore.subscribe<PointHistoryEntry[]>(key, (list) => {
      callback((list || []).slice(0, maxLimit));
    });
  },

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  async getLeaderboard(maxItems = 20): Promise<UserProfile[]> {
    const users = mockStore.get<UserProfile[]>(KEY_USERS, []);
    return [...users].sort((a, b) => (b.poin_total || 0) - (a.poin_total || 0)).slice(0, maxItems);
  },

  subscribeLeaderboard(
    callback: (entries: UserProfile[]) => void,
    options?: {
      scope?: 'nasional' | 'sekolah' | 'kampus';
      school?: string;
      role?: string;
      limit?: number;
    }
  ): Unsubscribe | null {
    const maxLimit = options?.limit || 20;
    const scope = options?.scope || 'nasional';

    return mockStore.subscribe<UserProfile[]>(KEY_USERS, (users) => {
      let filtered = [...(users || [])];

      if (scope === 'sekolah') {
        filtered = filtered.filter((u) => {
          if (options?.school) {
            return u.role === 'pelajar' && u.sekolah_kampus === options.school;
          }
          return u.role === 'pelajar';
        });
      } else if (scope === 'kampus') {
        filtered = filtered.filter((u) => {
          if (options?.school) {
            return u.role === 'mahasiswa' && u.sekolah_kampus === options.school;
          }
          return u.role === 'mahasiswa';
        });
      }

      filtered.sort((a, b) => (b.poin_total || 0) - (a.poin_total || 0));
      callback(filtered.slice(0, maxLimit));
    });
  },

  // ─── Module Progress ────────────────────────────────────────────────────────

  async getModuleProgress(uid: string): Promise<ModuleProgress[]> {
    const key = `golantas_mod_progress_${uid}`;
    return mockStore.get<ModuleProgress[]>(key, []);
  },

  async updateModuleProgress(
    uid: string,
    moduleId: string,
    progress: Partial<ModuleProgress>
  ): Promise<void> {
    const key = `golantas_mod_progress_${uid}`;
    const list = mockStore.get<ModuleProgress[]>(key, []);
    const idx = list.findIndex((m) => m.moduleId === moduleId);

    const updated: ModuleProgress = {
      moduleId,
      lessons_done: [],
      kuis_best: 0,
      kuis_attempts: 0,
      kuis_passed: false,
      flashcards_done: [],
      cases_done: [],
      last_study: new Date().toISOString(),
      total_menit: 0,
      ...(idx >= 0 ? list[idx] : {}),
      ...progress,
    };

    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }

    mockStore.set(key, list);
  },

  // ─── Extra / AI-Generated Curriculum Modules ───────────────────────────────

  async saveExtraModule(
    uid: string,
    module: ModuleData,
    quizQuestions: QuizQuestion[]
  ): Promise<void> {
    const modKey = `golantas_extra_modules_${uid}`;
    const quizKey = `golantas_extra_quizzes_${uid}`;

    mockStore.upsertItem(modKey, module, 'id');

    const existingQuizzes = mockStore.get<Record<string, QuizQuestion[]>>(quizKey, {});
    existingQuizzes[module.id] = quizQuestions;
    mockStore.set(quizKey, existingQuizzes);
  },

  async getExtraModules(uid: string): Promise<ModuleData[]> {
    return mockStore.get<ModuleData[]>(`golantas_extra_modules_${uid}`, []);
  },

  async getExtraModuleQuizzes(uid: string): Promise<Record<string, QuizQuestion[]>> {
    return mockStore.get<Record<string, QuizQuestion[]>>(`golantas_extra_quizzes_${uid}`, {});
  },

  async getExtraModuleQuiz(uid: string, moduleId: string): Promise<QuizQuestion[] | null> {
    const all = await this.getExtraModuleQuizzes(uid);
    return all[moduleId] || null;
  },

  // ─── Exam Attempts ─────────────────────────────────────────────────────────

  async saveExamAttempt(attempt: Omit<ExamAttempt, 'id'>): Promise<void> {
    const key = `golantas_exam_attempts_${attempt.uid}`;
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };
    mockStore.upsertItem(key, newAttempt, 'id');
  },

  async getExamAttempts(uid: string): Promise<ExamAttempt[]> {
    const key = `golantas_exam_attempts_${uid}`;
    return mockStore.get<ExamAttempt[]>(key, []).slice(0, 10);
  },

  // ─── Certificates ──────────────────────────────────────────────────────────

  async getCertificates(uid: string): Promise<CertificateData[]> {
    const key = `golantas_certificates_${uid}`;
    return mockStore.get<CertificateData[]>(key, []);
  },

  async saveCertificate(cert: Omit<CertificateData, 'id'>): Promise<void> {
    const key = `golantas_certificates_${cert.uid}`;
    const newCert: CertificateData = {
      ...cert,
      id: 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };
    mockStore.upsertItem(key, newCert, 'id');
  },

  // ─── SOS Emergency Alerts ──────────────────────────────────────────────────

  async saveSOSAlert(alert: Omit<SOSAlert, 'id'>): Promise<string | null> {
    const newId = 'sos_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newAlert: SOSAlert = {
      ...alert,
      id: newId,
    };
    mockStore.upsertItem(KEY_SOS_ALERTS, newAlert, 'id');
    return newId;
  },

  subscribeSOSAlerts(callback: (alerts: SOSAlert[]) => void): Unsubscribe | null {
    return mockStore.subscribe<SOSAlert[]>(KEY_SOS_ALERTS, (alerts) => {
      callback(alerts || []);
    });
  },

  // ─── Family Links ──────────────────────────────────────────────────────────

  async getFamilyLinks(uid: string): Promise<FamilyLink[]> {
    const all = mockStore.get<FamilyLink[]>(KEY_FAMILY_LINKS, []);
    return all.filter((l) => l.parent_uid === uid || l.child_uid === uid);
  },
};
