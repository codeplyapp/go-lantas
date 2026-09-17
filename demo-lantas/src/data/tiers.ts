// Configuration and Constants for Go Lantas 3-Tier Modular Learning & Continuous AI Mode
import { CurriculumTier, TierConfig } from '../core/types';

export const CURRICULUM_TIERS: Record<CurriculumTier, TierConfig> = {
  dasar: {
    id: 'dasar',
    nomor: 1,
    nama: 'Tingkat Dasar',
    subjudul: 'Fondasi Keselamatan Nasional',
    deskripsi: '6 Modul esensial rambu, marka, etika, regulasi UU 22/2009, kesehatan pengemudi, dan tanggap darurat 110.',
    passingGrade: 70,
    pointPerQuestion: 20,
    bonusPoints: {
      first_pass: 120,
      repeat_pass: 50,
      fail: 15,
    },
    totalModulesRequired: 6,
    isAiGenerated: false,
    warna: '#0077C0',
    badge: 'Dasar',
  },
  menengah: {
    id: 'menengah',
    nomor: 2,
    nama: 'Tingkat Menengah',
    subjudul: 'Defensive Riding & Behavioral Risk',
    deskripsi: '2 Modul AI adaptif berfokus pada navigasi titik buta kendaraan berat, antisipasi blind corner, dan etika berkendara jam sibuk.',
    passingGrade: 75,
    pointPerQuestion: 25,
    bonusPoints: {
      first_pass: 180,
      repeat_pass: 70,
      fail: 20,
    },
    totalModulesRequired: 2,
    isAiGenerated: true,
    warna: '#059669', // Emerald
    badge: 'Menengah',
  },
  lanjutan: {
    id: 'lanjutan',
    nomor: 3,
    nama: 'Tingkat Lanjutan',
    subjudul: 'Mastery & Rekonstruksi Hukum',
    deskripsi: '2 Modul AI tingkat tinggi mencakup manuver pengereman darurat (threshold/cadence), bedah yurisprudensi laka, dan manajemen risiko konvoi.',
    passingGrade: 80,
    pointPerQuestion: 30,
    bonusPoints: {
      first_pass: 250,
      repeat_pass: 100,
      fail: 30,
    },
    totalModulesRequired: 2,
    isAiGenerated: true,
    warna: '#8B5CF6', // Purple
    badge: 'Lanjutan',
  },
  berkelanjutan: {
    id: 'berkelanjutan',
    nomor: 4,
    nama: 'Mode Berkelanjutan',
    subjudul: 'Siklus Pembelajaran Dinamis AI',
    deskripsi: 'Generasi set modul baru tak terbatas oleh AI Gemini untuk topik lalu lintas terkini (EV safety, ADAS, navigasi jalan tol baru).',
    passingGrade: 80,
    pointPerQuestion: 30,
    bonusPoints: {
      first_pass: 250,
      repeat_pass: 100,
      fail: 30,
    },
    totalModulesRequired: 2,
    isAiGenerated: true,
    warna: '#F59E0B', // Amber
    badge: 'Berkelanjutan ⚡',
  },
};

export const TIERS_LIST: TierConfig[] = [
  CURRICULUM_TIERS.dasar,
  CURRICULUM_TIERS.menengah,
  CURRICULUM_TIERS.lanjutan,
  CURRICULUM_TIERS.berkelanjutan,
];
