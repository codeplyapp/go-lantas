// Mock Firestore Database Engine with LocalStorage Persistence for SIGAP (TSD §4 Compliant)

import { 
  UserProfile, UserRole, QuizQuestion, QuizAttempt, 
  LeaderboardEntry, SOSAlert, FamilyLink, FamilyAccessLog, 
  NotificationSchedule, GeoPoint 
} from './types';
import { BANK_SOAL_KUIS } from '../data/quiz_questions';
import { INITIAL_USER_PERSONAS, INITIAL_LEADERBOARD_ENTRIES } from '../data/mock_leaderboard';

const DB_KEYS = {
  ACTIVE_ROLE: 'sigap_active_role',
  USERS: 'sigap_db_users',
  QUIZ_QUESTIONS: 'sigap_db_quiz_questions',
  QUIZ_ATTEMPTS: 'sigap_db_quiz_attempts',
  LEADERBOARD: 'sigap_db_leaderboard_weekly',
  FAMILY_LINKS: 'sigap_db_family_links',
  FAMILY_LOGS: 'sigap_db_family_logs',
  SOS_ALERTS: 'sigap_db_sos_alerts',
  NOTIFICATION_PREFS: 'sigap_db_notification_prefs',
};

const DEFAULT_NOTIFICATIONS: NotificationSchedule[] = [
  {
    id: 'notif_01',
    jenis: 'berangkat_sekolah',
    judul: '🎒 Jam Berangkat Sekolah (06:30)',
    pesan: 'Pastikan tali helm berbunyi KLIK! Periksa kaca spion dan nyalakan lampu utama motor Anda.',
    jam: '06:30',
    aktif: true,
    hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  },
  {
    id: 'notif_02',
    jenis: 'pulang_sekolah',
    judul: '🛵 Jam Pulang Padat (15:30)',
    pesan: 'Arus Simpang Lima sedang ramai. Jaga jarak aman minimal 3 detik dan jangan menyalip dari kiri!',
    jam: '15:30',
    aktif: true,
    hari: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  },
  {
    id: 'notif_03',
    jenis: 'cuaca_hujan',
    judul: '🌧️ Peringatan Cuaca Hujan',
    pesan: 'Aspal licin di seputar Jl. Gajah Mada & Jl. Ijen. Kurangi kecepatan maksimal 30 km/jam.',
    jam: '13:00',
    aktif: true,
    hari: ['Setiap Hari'],
  },
  {
    id: 'notif_04',
    jenis: 'kuis_harian',
    judul: '⭐ Tantangan Kuis Harian SIGAP',
    pesan: 'Jawab 5 kuis keselamatan hari ini untuk mempertahankan streak 5 hari dan raih poin tambahan!',
    jam: '19:00',
    aktif: true,
    hari: ['Setiap Hari'],
  },
];

const DEFAULT_FAMILY_LINKS: FamilyLink[] = [
  {
    id: 'link_01',
    parent_uid: 'user_parent_01',
    parent_nama: 'Bpk. Hendra Pratama',
    child_uid: 'user_pelajar_01',
    child_nama: 'Rian Pratama',
    child_sekolah: 'SMAN 1 Giri Banyuwangi',
    pairing_code: 'SGP-8821',
    status: 'disetujui',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_location: {
      latitude: -8.2085,
      longitude: 114.3625,
      accuracy: 12,
      alamat_perkiraan: 'Jl. HOS Cokroaminoto (Kawasan SMAN 1 Giri)',
      updated_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    },
    is_live_sharing: true,
  }
];

const DEFAULT_FAMILY_LOGS: FamilyAccessLog[] = [
  {
    id: 'log_01',
    link_id: 'link_01',
    accessor_nama: 'Bpk. Hendra Pratama',
    accessor_role: 'orang_tua',
    target_child_nama: 'Rian Pratama',
    waktu_akses: 'Hari ini, 06:45 WIB',
    lokasi_dilihat: 'Jl. HOS Cokroaminoto (SMAN 1 Giri)',
    tujuan_akses: 'Pengecekan keberangkatan sekolah aman',
  },
  {
    id: 'log_02',
    link_id: 'link_01',
    accessor_nama: 'Bpk. Hendra Pratama',
    accessor_role: 'orang_tua',
    target_child_nama: 'Rian Pratama',
    waktu_akses: 'Kemarin, 15:40 WIB',
    lokasi_dilihat: 'Jl. Ahmad Yani (Taman Blambangan)',
    tujuan_akses: 'Pengecekan perjalanan pulang',
  }
];

const DEFAULT_SOS_ALERTS: SOSAlert[] = [
  {
    id: 'sos_demo_01',
    uid: 'user_pelajar_01',
    nama_pelapor: 'Rian Pratama',
    peran: 'pelajar',
    sekolah_kampus: 'SMAN 1 Giri Banyuwangi',
    lokasi: {
      latitude: -8.2285,
      longitude: 114.3562,
      accuracy: 8,
      alamat_perkiraan: 'Jl. Gajah Mada No. 45, Banyuwangi Kota',
    },
    waktu: 'Kemarin, 17:15 WIB',
    status: 'ditangani',
    catatan: 'Patroli Satlantas Polresta Banyuwangi Unit Reaksi Cepat tiba di lokasi dalam 4 menit.',
  }
];

// Helper to notify all components about DB changes
function dispatchDBChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sigap_db_updated', { detail: { key } }));
  }
}

export const MockDB = {
  // --- INITIALIZATION ---
  init() {
    if (!localStorage.getItem(DB_KEYS.ACTIVE_ROLE)) {
      localStorage.setItem(DB_KEYS.ACTIVE_ROLE, 'pelajar');
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USER_PERSONAS));
    }
    if (!localStorage.getItem(DB_KEYS.QUIZ_QUESTIONS)) {
      localStorage.setItem(DB_KEYS.QUIZ_QUESTIONS, JSON.stringify(BANK_SOAL_KUIS));
    }
    if (!localStorage.getItem(DB_KEYS.LEADERBOARD)) {
      localStorage.setItem(DB_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD_ENTRIES));
    }
    if (!localStorage.getItem(DB_KEYS.FAMILY_LINKS)) {
      localStorage.setItem(DB_KEYS.FAMILY_LINKS, JSON.stringify(DEFAULT_FAMILY_LINKS));
    }
    if (!localStorage.getItem(DB_KEYS.FAMILY_LOGS)) {
      localStorage.setItem(DB_KEYS.FAMILY_LOGS, JSON.stringify(DEFAULT_FAMILY_LOGS));
    }
    if (!localStorage.getItem(DB_KEYS.SOS_ALERTS)) {
      localStorage.setItem(DB_KEYS.SOS_ALERTS, JSON.stringify(DEFAULT_SOS_ALERTS));
    }
    if (!localStorage.getItem(DB_KEYS.NOTIFICATION_PREFS)) {
      localStorage.setItem(DB_KEYS.NOTIFICATION_PREFS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(DB_KEYS.QUIZ_ATTEMPTS)) {
      localStorage.setItem(DB_KEYS.QUIZ_ATTEMPTS, JSON.stringify([]));
    }
  },

  // --- RESET TO SEED DATA ---
  resetAllData() {
    localStorage.removeItem(DB_KEYS.ACTIVE_ROLE);
    localStorage.removeItem(DB_KEYS.USERS);
    localStorage.removeItem(DB_KEYS.QUIZ_QUESTIONS);
    localStorage.removeItem(DB_KEYS.QUIZ_ATTEMPTS);
    localStorage.removeItem(DB_KEYS.LEADERBOARD);
    localStorage.removeItem(DB_KEYS.FAMILY_LINKS);
    localStorage.removeItem(DB_KEYS.FAMILY_LOGS);
    localStorage.removeItem(DB_KEYS.SOS_ALERTS);
    localStorage.removeItem(DB_KEYS.NOTIFICATION_PREFS);
    this.init();
    dispatchDBChange('*');
  },

  // --- ROLE / PERSONA ---
  getActiveRole(): UserRole {
    return (localStorage.getItem(DB_KEYS.ACTIVE_ROLE) as UserRole) || 'pelajar';
  },

  setActiveRole(role: UserRole) {
    localStorage.setItem(DB_KEYS.ACTIVE_ROLE, role);
    dispatchDBChange(DB_KEYS.ACTIVE_ROLE);
  },

  // --- USERS ---
  getAllUsers(): Record<string, UserProfile> {
    const raw = localStorage.getItem(DB_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USER_PERSONAS;
  },

  getCurrentUser(): UserProfile {
    const role = this.getActiveRole();
    const users = this.getAllUsers();
    return users[role] || INITIAL_USER_PERSONAS[role] || INITIAL_USER_PERSONAS['pelajar'];
  },

  updateCurrentUser(updates: Partial<UserProfile>) {
    const role = this.getActiveRole();
    const users = this.getAllUsers();
    if (users[role]) {
      users[role] = { ...users[role], ...updates };
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      dispatchDBChange(DB_KEYS.USERS);
    }
  },

  // --- QUIZ & LEADERBOARD SYNC ---
  getQuizQuestions(): QuizQuestion[] {
    const raw = localStorage.getItem(DB_KEYS.QUIZ_QUESTIONS);
    return raw ? JSON.parse(raw) : BANK_SOAL_KUIS;
  },

  recordQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) {
    const rawAttempts = localStorage.getItem(DB_KEYS.QUIZ_ATTEMPTS);
    const attempts: QuizAttempt[] = rawAttempts ? JSON.parse(rawAttempts) : [];
    
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    attempts.push(newAttempt);
    localStorage.setItem(DB_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));

    // Update User Stats & Points
    const currentUser = this.getCurrentUser();
    const addedPoints = attempt.benar ? attempt.poin_didapat : 0;
    const isNewCorrect = attempt.benar ? 1 : 0;

    const updatedUser: Partial<UserProfile> = {
      poin_total: currentUser.poin_total + addedPoints,
      total_jawaban: currentUser.total_jawaban + 1,
      jawaban_benar: currentUser.jawaban_benar + isNewCorrect,
      kuis_selesai: currentUser.kuis_selesai + 1,
    };
    this.updateCurrentUser(updatedUser);

    // Update Leaderboard immediately
    this.updateLeaderboardPoints(currentUser.uid, addedPoints);

    dispatchDBChange(DB_KEYS.QUIZ_ATTEMPTS);
    return newAttempt;
  },

  getLeaderboard(): LeaderboardEntry[] {
    const raw = localStorage.getItem(DB_KEYS.LEADERBOARD);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD_ENTRIES;
    const currentUser = this.getCurrentUser();

    // Re-rank based on points
    return entries
      .map(entry => {
        if (entry.uid === currentUser.uid) {
          return {
            ...entry,
            nama: currentUser.nama,
            sekolah_kampus: currentUser.sekolah_kampus,
            poin_minggu_ini: currentUser.poin_total + 120,
            streak_hari: currentUser.streak_hari,
            is_current_user: true,
          };
        }
        return { ...entry, is_current_user: false };
      })
      .sort((a, b) => b.poin_minggu_ini - a.poin_minggu_ini)
      .map((entry, idx) => ({ ...entry, peringkat: idx + 1 }));
  },

  updateLeaderboardPoints(uid: string, addedPoints: number) {
    const raw = localStorage.getItem(DB_KEYS.LEADERBOARD);
    let entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : INITIAL_LEADERBOARD_ENTRIES;
    
    let found = false;
    entries = entries.map(item => {
      if (item.uid === uid) {
        found = true;
        return { ...item, poin_minggu_ini: item.poin_minggu_ini + addedPoints };
      }
      return item;
    });

    if (!found) {
      const user = this.getCurrentUser();
      entries.push({
        uid: user.uid,
        nama: user.nama,
        role: user.role,
        sekolah_kampus: user.sekolah_kampus,
        poin_minggu_ini: user.poin_total,
        peringkat: entries.length + 1,
        streak_hari: user.streak_hari,
      });
    }

    entries.sort((a, b) => b.poin_minggu_ini - a.poin_minggu_ini);
    entries = entries.map((e, idx) => ({ ...e, peringkat: idx + 1 }));

    localStorage.setItem(DB_KEYS.LEADERBOARD, JSON.stringify(entries));
    dispatchDBChange(DB_KEYS.LEADERBOARD);
  },

  // --- SOS ALERTS ---
  getSOSAlerts(): SOSAlert[] {
    const raw = localStorage.getItem(DB_KEYS.SOS_ALERTS);
    return raw ? JSON.parse(raw) : DEFAULT_SOS_ALERTS;
  },

  createSOSAlert(lokasi: GeoPoint, catatan?: string): SOSAlert {
    const user = this.getCurrentUser();
    const raw = localStorage.getItem(DB_KEYS.SOS_ALERTS);
    const alerts: SOSAlert[] = raw ? JSON.parse(raw) : [];

    const newAlert: SOSAlert = {
      id: 'sos_' + Date.now(),
      uid: user.uid,
      nama_pelapor: user.nama,
      peran: user.role,
      sekolah_kampus: user.sekolah_kampus,
      lokasi,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB, Hari ini',
      status: 'terkirim',
      catatan: catatan || 'Sinyal darurat dipicu dari aplikasi SIGAP. Notifikasi diteruskan ke Command Center Polresta Banyuwangi.',
    };

    alerts.unshift(newAlert);
    localStorage.setItem(DB_KEYS.SOS_ALERTS, JSON.stringify(alerts));
    dispatchDBChange(DB_KEYS.SOS_ALERTS);
    return newAlert;
  },

  // --- FAMILY MONITORING & CONSENT ---
  getFamilyLinks(): FamilyLink[] {
    const raw = localStorage.getItem(DB_KEYS.FAMILY_LINKS);
    return raw ? JSON.parse(raw) : DEFAULT_FAMILY_LINKS;
  },

  getFamilyLogs(): FamilyAccessLog[] {
    const raw = localStorage.getItem(DB_KEYS.FAMILY_LOGS);
    return raw ? JSON.parse(raw) : DEFAULT_FAMILY_LOGS;
  },

  requestFamilyPairing(pairingCode: string): { success: boolean; message: string; link?: FamilyLink } {
    const links = this.getFamilyLinks();
    const users = this.getAllUsers();
    
    // Find child with matching pairing code
    const child = Object.values(users).find(u => u.pairing_code.toUpperCase() === pairingCode.toUpperCase().trim());
    if (!child) {
      return { success: false, message: 'Kode pairing tidak ditemukan. Pastikan memasukkan 6-digit kode yang tertera di aplikasi Anak/Pelajar.' };
    }

    const parent = this.getCurrentUser();
    const existing = links.find(l => l.child_uid === child.uid && l.parent_uid === parent.uid);
    if (existing) {
      return { success: true, message: 'Tautan keluarga sudah terdaftar.', link: existing };
    }

    const newLink: FamilyLink = {
      id: 'link_' + Date.now(),
      parent_uid: parent.uid,
      parent_nama: parent.nama,
      child_uid: child.uid,
      child_nama: child.nama,
      child_sekolah: child.sekolah_kampus,
      pairing_code: pairingCode.toUpperCase(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_live_sharing: false,
    };

    links.push(newLink);
    localStorage.setItem(DB_KEYS.FAMILY_LINKS, JSON.stringify(links));
    dispatchDBChange(DB_KEYS.FAMILY_LINKS);
    return { success: true, message: `Permintaan pairing terkirim ke ${child.nama}. Menunggu persetujuan (consent) dari perangkat anak.`, link: newLink };
  },

  updateFamilyLinkStatus(linkId: string, status: 'disetujui' | 'dicabut'): boolean {
    const links = this.getFamilyLinks();
    const updated = links.map(link => {
      if (link.id === linkId) {
        return {
          ...link,
          status,
          updated_at: new Date().toISOString(),
          is_live_sharing: status === 'disetujui',
          last_location: status === 'disetujui' ? {
            latitude: -8.2085,
            longitude: 114.3625,
            accuracy: 10,
            alamat_perkiraan: 'Jl. HOS Cokroaminoto (SMAN 1 Giri, Banyuwangi)',
            updated_at: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          } : undefined
        };
      }
      return link;
    });

    localStorage.setItem(DB_KEYS.FAMILY_LINKS, JSON.stringify(updated));
    dispatchDBChange(DB_KEYS.FAMILY_LINKS);
    return true;
  },

  recordFamilyAccessLog(linkId: string, lokasiDilihat: string, tujuan: string) {
    const logs = this.getFamilyLogs();
    const user = this.getCurrentUser();
    const links = this.getFamilyLinks();
    const link = links.find(l => l.id === linkId);

    const newLog: FamilyAccessLog = {
      id: 'log_' + Date.now(),
      link_id: linkId,
      accessor_nama: user.nama,
      accessor_role: user.role,
      target_child_nama: link ? link.child_nama : 'Anak',
      waktu_akses: 'Baru saja, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      lokasi_dilihat: lokasiDilihat,
      tujuan_akses: tujuan,
    };

    logs.unshift(newLog);
    localStorage.setItem(DB_KEYS.FAMILY_LOGS, JSON.stringify(logs.slice(0, 20))); // Keep last 20 logs
    dispatchDBChange(DB_KEYS.FAMILY_LOGS);
  },

  // --- NOTIFICATION PREFERENCES ---
  getNotificationSchedules(): NotificationSchedule[] {
    const raw = localStorage.getItem(DB_KEYS.NOTIFICATION_PREFS);
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATIONS;
  },

  toggleNotificationSchedule(id: string): NotificationSchedule[] {
    const schedules = this.getNotificationSchedules().map(item => {
      if (item.id === id) {
        return { ...item, aktif: !item.aktif };
      }
      return item;
    });
    localStorage.setItem(DB_KEYS.NOTIFICATION_PREFS, JSON.stringify(schedules));
    dispatchDBChange(DB_KEYS.NOTIFICATION_PREFS);
    return schedules;
  },
};
