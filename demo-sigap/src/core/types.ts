// Types for SIGAP Application (Aligned with TSD §4 Firestore Schema)

export type UserRole = 'pelajar' | 'mahasiswa' | 'orang_tua';

export interface UserProfile {
  uid: string;
  nama: string;
  role: UserRole;
  sekolah_kampus: string;
  kelas_jurusan?: string;
  poin_total: number;
  streak_hari: number;
  kuis_selesai: number;
  jawaban_benar: number;
  total_jawaban: number;
  avatar_url?: string;
  pairing_code: string; // 6-char code for parent pairing
  created_at: string;
}

export type QuizCategory = 'rambu' | 'marka' | 'etika' | 'darurat';

export interface QuizQuestion {
  id: string;
  level: number; // 1, 2, 3, 4
  kategori: QuizCategory;
  pertanyaan: string;
  opsi: string[];
  jawaban_benar: number; // 0, 1, 2, 3
  poin: number;
  penjelasan: string;
  pasal_hukum?: string; // misal: UU No. 22/2009 Pasal 106 Ayat 8
  gambar_url?: string;
  tipe_rambu?: 'peringatan' | 'larangan' | 'perintah' | 'petunjuk';
}

export interface QuizLevelInfo {
  level: number;
  judul: string;
  kategori: QuizCategory;
  deskripsi: string;
  icon_name: string;
  min_poin_unlock: number;
  total_soal: number;
  warna_tema: string;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  question_id: string;
  level: number;
  pilihan_user: number;
  benar: boolean;
  poin_didapat: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  uid: string;
  nama: string;
  role: UserRole;
  sekolah_kampus: string;
  poin_minggu_ini: number;
  peringkat: number;
  streak_hari: number;
  is_current_user?: boolean;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  alamat_perkiraan?: string;
}

export type SOSStatus = 'terkirim' | 'menunggu_patroli' | 'ditangani' | 'selesai';

export interface SOSAlert {
  id: string;
  uid: string;
  nama_pelapor: string;
  peran: UserRole;
  sekolah_kampus: string;
  lokasi: GeoPoint;
  waktu: string;
  status: SOSStatus;
  catatan?: string;
}

export type FamilyLinkStatus = 'pending' | 'disetujui' | 'dicabut';

export interface FamilyLink {
  id: string;
  parent_uid: string;
  parent_nama: string;
  child_uid: string;
  child_nama: string;
  child_sekolah: string;
  pairing_code: string;
  status: FamilyLinkStatus;
  created_at: string;
  updated_at: string;
  last_location?: GeoPoint & { updated_at: string };
  is_live_sharing: boolean;
}

export interface FamilyAccessLog {
  id: string;
  link_id: string;
  accessor_nama: string;
  accessor_role: UserRole;
  target_child_nama: string;
  waktu_akses: string;
  lokasi_dilihat: string;
  tujuan_akses: string;
}

export type TimeSlot = 'pagi' | 'siang' | 'sore' | 'malam';

export interface TrafficHotspot {
  id: string;
  nama_jalan: string;
  wilayah: string; // misal: "Banyuwangi Kota"
  koordinat: [number, number]; // [lat, lng]
  level_kemacetan: 'lancar' | 'ramai_lancar' | 'padat_merayap' | 'macet_total';
  jam_rawan: string;
  kecepatan_rata_rata: string;
  penyebab: string;
  saran_rute: string;
  time_slots: TimeSlot[];
}

export interface TrafficIncident {
  id: string;
  judul: string;
  lokasi: string;
  koordinat: [number, number];
  tipe: 'kecelakaan' | 'perbaikan_jalan' | 'contraflow' | 'pasar_tumpah';
  status: 'aktif' | 'penanganan' | 'selesai';
  waktu: string;
  deskripsi: string;
  label_simulasi: boolean;
}

export interface NotificationSchedule {
  id: string;
  jenis: 'berangkat_sekolah' | 'pulang_sekolah' | 'helm_dan_sim' | 'cuaca_hujan' | 'kuis_harian';
  judul: string;
  pesan: string;
  jam: string;
  aktif: boolean;
  hari: string[];
}

export interface AccidentReport {
  id: string;
  nomor_laporan: string;
  lokasi: string;
  koordinat: [number, number];
  waktu_kejadian: string;
  kategori_kendaraan: string;
  tingkat_keparahan: 'Ringan' | 'Sedang' | 'Berat';
  kronologi_singkat: string;
  faktor_penyebab: string;
  edukasi_pencegahan: string;
  label: 'SIMULASI KORLANTAS POLRI';
}

export interface EdukasiTopic {
  id: string;
  judul: string;
  kategori: string;
  poin_kunci: string[];
  referensi_uu: string;
  pesan_edukatif: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  is_fallback?: boolean;
  category?: 'rute' | 'laka' | 'polri' | 'kuis' | 'umum';
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
}

export interface AIService {
  sendMessage(prompt: string, history: AIChatMessage[]): Promise<{ text: string; isFallback: boolean }>;
}
