// Mock Data Store for GO Lantas — LocalStorage Key-Value with Pub/Sub Event Emitter
// Replaces Firestore collections with local persistence and real-time reactive sync

export type Listener<T = any> = (data: T) => void;

class MockStore {
  private listeners: Map<string, Set<Listener>> = new Map();
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    this.initDefaultSeeds();
  }

  /**
   * Get value from LocalStorage with in-memory caching
   */
  get<T>(key: string, defaultValue: T): T {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        this.memoryCache.set(key, parsed);
        return parsed as T;
      }
    } catch (err) {
      console.warn(`[MockStore] Error reading key "${key}":`, err);
    }

    this.memoryCache.set(key, defaultValue);
    return defaultValue;
  }

  /**
   * Set value in LocalStorage and notify all subscribers
   */
  set<T>(key: string, value: T): void {
    this.memoryCache.set(key, value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn(`[MockStore] Error saving key "${key}":`, err);
      }
    }
    this.notify(key, value);
  }

  /**
   * Remove a key
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    this.notify(key, null);
  }

  /**
   * Upsert an item into an array collection
   */
  upsertItem<T extends Record<string, any>>(
    collectionKey: string,
    item: T,
    idKey: keyof T = 'id'
  ): T {
    const list = this.get<T[]>(collectionKey, []);
    const identifier = item[idKey];
    const index = list.findIndex((existing) => existing[idKey] === identifier);

    let updatedList: T[];
    if (index >= 0) {
      updatedList = [...list];
      updatedList[index] = { ...updatedList[index], ...item };
    } else {
      updatedList = [item, ...list];
    }

    this.set(collectionKey, updatedList);
    return item;
  }

  /**
   * Remove items matching predicate from array collection
   */
  removeItem<T>(collectionKey: string, predicate: (item: T) => boolean): void {
    const list = this.get<T[]>(collectionKey, []);
    const filtered = list.filter((item) => !predicate(item));
    this.set(collectionKey, filtered);
  }

  /**
   * Subscribe to changes for a given key
   */
  subscribe<T>(key: string, callback: Listener<T>, emitImmediately = true): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const set = this.listeners.get(key)!;
    set.add(callback as Listener);

    if (emitImmediately) {
      const current = this.get<T>(key, null as any);
      try {
        callback(current);
      } catch (err) {
        console.error(`[MockStore] Subscriber error on key "${key}":`, err);
      }
    }

    return () => {
      const currentSet = this.listeners.get(key);
      if (currentSet) {
        currentSet.delete(callback as Listener);
        if (currentSet.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a key
   */
  notify(key: string, value: any): void {
    const set = this.listeners.get(key);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(value);
        } catch (err) {
          console.error(`[MockStore] Error notifying subscriber for key "${key}":`, err);
        }
      });
    }
  }

  /**
   * Initialize rich default seeds for Demo mode
   */
  private initDefaultSeeds(): void {
    if (typeof window === 'undefined') return;

    // 1. Leaderboard Competitors (8 dummy competitors)
    const LEADERBOARD_KEY = 'golantas_mock_users';
    const existingUsers = localStorage.getItem(LEADERBOARD_KEY);
    if (!existingUsers) {
      const seedUsers = [
        {
          uid: 'demo_user_001',
          nama: 'Bripda Alif Farhan',
          email: 'demo@golantas.id',
          role: 'pelajar',
          sekolah_kampus: 'SMAN 2 Taruna Bhayangkara',
          kelas_jurusan: 'XII MIPA 1',
          poin_total: 940,
          streak_hari: 14,
          kuis_selesai: 28,
          jawaban_benar: 104,
          total_jawaban: 112,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-7821',
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_002',
          nama: 'Siti Rahma Azzahra',
          email: 'siti.rahma@student.sch.id',
          role: 'pelajar',
          sekolah_kampus: 'SMAN 1 Surabaya',
          kelas_jurusan: 'XI IPS 2',
          poin_total: 880,
          streak_hari: 11,
          kuis_selesai: 24,
          jawaban_benar: 92,
          total_jawaban: 100,
          avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-4192',
          created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_003',
          nama: 'Dimas Aditya Pratama',
          email: 'dimas.aditya@ugm.ac.id',
          role: 'mahasiswa',
          sekolah_kampus: 'Universitas Gadjah Mada',
          kelas_jurusan: 'Teknik Sipil Transportasi',
          poin_total: 820,
          streak_hari: 9,
          kuis_selesai: 21,
          jawaban_benar: 84,
          total_jawaban: 95,
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-5520',
          created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_004',
          nama: 'Nadira Putri Kinanti',
          email: 'nadira.putri@sman3bandung.sch.id',
          role: 'pelajar',
          sekolah_kampus: 'SMAN 3 Bandung',
          kelas_jurusan: 'XII IPA 3',
          poin_total: 760,
          streak_hari: 7,
          kuis_selesai: 19,
          jawaban_benar: 76,
          total_jawaban: 88,
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-8114',
          created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_005',
          nama: 'Muhammad Rizky Fadhilah',
          email: 'rizky.f@ui.ac.id',
          role: 'mahasiswa',
          sekolah_kampus: 'Universitas Indonesia',
          kelas_jurusan: 'Hukum Lalu Lintas & Pidana',
          poin_total: 710,
          streak_hari: 6,
          kuis_selesai: 18,
          jawaban_benar: 71,
          total_jawaban: 85,
          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-3290',
          created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_006',
          nama: 'Alya Salsabila',
          email: 'alya.s@smantarunabhayangkara.sch.id',
          role: 'pelajar',
          sekolah_kampus: 'SMAN 2 Taruna Bhayangkara',
          kelas_jurusan: 'XI MIPA 2',
          poin_total: 680,
          streak_hari: 5,
          kuis_selesai: 16,
          jawaban_benar: 65,
          total_jawaban: 80,
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-9012',
          created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_007',
          nama: 'Ir. Hendra Gunawan',
          email: 'hendra.gunawan@parent.id',
          role: 'orang_tua',
          sekolah_kampus: 'Komite Keselamatan Pelajar',
          kelas_jurusan: 'Wali Murid',
          poin_total: 620,
          streak_hari: 4,
          kuis_selesai: 14,
          jawaban_benar: 60,
          total_jawaban: 70,
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-6411',
          created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
        {
          uid: 'comp_008',
          nama: 'Kevin Ardiansyah',
          email: 'kevin.a@itb.ac.id',
          role: 'mahasiswa',
          sekolah_kampus: 'Institut Teknologi Bandung',
          kelas_jurusan: 'Perencanaan Wilayah & Kota',
          poin_total: 580,
          streak_hari: 4,
          kuis_selesai: 12,
          jawaban_benar: 52,
          total_jawaban: 65,
          avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          pairing_code: 'SGP-1789',
          created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
          last_aktivitas: new Date().toISOString().slice(0, 10),
        },
      ];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(seedUsers));
    }

    // 2. Dummy SOS Alert records for live preview
    const SOS_KEY = 'golantas_sos_alerts';
    if (!localStorage.getItem(SOS_KEY)) {
      const seedSOS = [
        {
          id: 'sos_mock_01',
          uid: 'comp_002',
          nama_pelapor: 'Siti Rahma Azzahra',
          peran: 'pelajar',
          sekolah_kampus: 'SMAN 1 Surabaya',
          lokasi: {
            latitude: -7.2575,
            longitude: 112.7521,
            alamat_perkiraan: 'Jl. Pemuda No. 45, Embong Kaliasin, Surabaya',
          },
          waktu: new Date(Date.now() - 15 * 60000).toISOString(),
          status: 'ditangani',
          catatan: 'Kendaraan mogok di perempatan traffic light, unit drone DFR sudah overwatch.',
        },
      ];
      localStorage.setItem(SOS_KEY, JSON.stringify(seedSOS));
    }

    // 3. Welcome Point History for default user
    const POINT_HIST_KEY = 'golantas_point_history_demo_user_001';
    if (!localStorage.getItem(POINT_HIST_KEY)) {
      const seedPointHistory = [
        {
          id: 'ph_01',
          uid: 'demo_user_001',
          source: 'welcome',
          judul: 'Bonus Selamat Datang',
          poin: 100,
          timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
          detail: 'Pendaftaran akun baru GO Lantas',
        },
        {
          id: 'ph_02',
          uid: 'demo_user_001',
          source: 'kuis_sim',
          judul: 'Lulus Uji Teori Rambu Golongan A',
          poin: 250,
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          detail: 'Skor 100% pada simulasi rambu prioritas',
        },
        {
          id: 'ph_03',
          uid: 'demo_user_001',
          source: 'lesson',
          judul: 'Modul Jalur Penyelamat Darurat',
          poin: 150,
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          detail: 'Menyelesaikan modul interaktif rem blong di turunan tajam',
        },
      ];
      localStorage.setItem(POINT_HIST_KEY, JSON.stringify(seedPointHistory));
    }
  }
}

export const mockStore = new MockStore();
