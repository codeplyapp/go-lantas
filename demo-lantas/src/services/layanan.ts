import { mockStore } from './mockStore';
import {
  LayananJenis,
  LayananStatus,
  LayananSubmission,
  LaporanKehilangan,
  TilangEtleRecord,
  KehilanganKategori,
} from '../core/types';
import {
  SEED_SUBMISSIONS,
  SEED_LAPORAN_KEHILANGAN,
  DUMMY_TILANG_RECORDS,
  LAYANAN_CONFIGS,
} from '../data/layanan';

const KEY_SUBMISSIONS = 'golantas_layanan_submissions';
const KEY_LAPORAN_KEHILANGAN = 'golantas_laporan_kehilangan';

class LayananService {
  constructor() {
    this.initSeeds();
  }

  private initSeeds(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(KEY_SUBMISSIONS)) {
      mockStore.set(KEY_SUBMISSIONS, SEED_SUBMISSIONS);
    }
    if (!localStorage.getItem(KEY_LAPORAN_KEHILANGAN)) {
      mockStore.set(KEY_LAPORAN_KEHILANGAN, SEED_LAPORAN_KEHILANGAN);
    }
  }

  // ─── Submissions (E-SIM, STNK, SKCK, etc.) ────────────────────────────────

  listSubmissions(uid?: string): LayananSubmission[] {
    const list = mockStore.get<LayananSubmission[]>(KEY_SUBMISSIONS, SEED_SUBMISSIONS);
    if (!uid) return list;
    return list.filter((s) => s.uid === uid);
  }

  getSubmission(idOrNomor: string): LayananSubmission | null {
    const list = this.listSubmissions();
    const clean = idOrNomor.trim().toLowerCase();
    return (
      list.find((s) => s.id === clean || s.nomor_layanan.toLowerCase() === clean) || null
    );
  }

  createSubmission(payload: {
    jenis: LayananJenis;
    uid: string;
    nama_pemohon: string;
    nik: string;
    no_hp: string;
    email: string;
    satpas_tujuan: string;
    detail_layanan: Record<string, any>;
  }): LayananSubmission {
    const config = LAYANAN_CONFIGS[payload.jenis];
    const prefix =
      payload.jenis === 'e_sim'
        ? 'SIM'
        : payload.jenis === 'stnk'
        ? 'STNK'
        : payload.jenis === 'skck'
        ? 'SKCK'
        : payload.jenis === 'surat_kehilangan'
        ? 'SRT'
        : 'IZN';

    const currentList = this.listSubmissions();
    const count = currentList.length + 1;
    const nomor_layanan = `${prefix}-2026-${String(count).padStart(4, '0')}`;
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newSubmission: LayananSubmission = {
      id,
      nomor_layanan,
      jenis: payload.jenis,
      uid: payload.uid,
      nama_pemohon: payload.nama_pemohon,
      nik: payload.nik,
      no_hp: payload.no_hp,
      email: payload.email,
      satpas_tujuan: payload.satpas_tujuan,
      status: 'diajukan',
      progress_percent: 20,
      estimasi_hari: config?.estimasiHari || 3,
      tanggal_pengajuan: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
      detail_layanan: payload.detail_layanan,
      timeline: [
        {
          status: 'diajukan',
          label: 'Permohonan Didaftarkan',
          waktu: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WIB',
          deskripsi: 'Data formulir online dan berkas persyaratan berhasil dikirimkan.',
          selesai: true,
          aktif: true,
        },
        {
          status: 'verifikasi',
          label: 'Verifikasi Berkas Satpas',
          deskripsi: 'Pengecekan keabsahan dokumen oleh petugas loket verifikasi.',
          selesai: false,
        },
        {
          status: 'diproses',
          label: 'Proses Penerbitan & Enkripsi',
          deskripsi: 'Pembuatan dokumen sekuriti resmi atau kartu fisik chip presisi.',
          selesai: false,
        },
        {
          status: 'selesai',
          label: 'Dokumen Resmi Selesai',
          deskripsi: 'Dokumen terbit dan siap diambil atau diunduh.',
          selesai: false,
        },
        {
          status: 'diambil',
          label: 'Selesai & Diserahkan',
          deskripsi: 'Serah terima kepada pemohon.',
          selesai: false,
        },
      ],
    };

    mockStore.upsertItem(KEY_SUBMISSIONS, newSubmission, 'id');
    return newSubmission;
  }

  /**
   * Demo Simulation Feature: Advance Status to Next Stage
   * Allows judges / evaluators to test real-time state progression in seconds
   */
  advanceStatus(id: string): LayananSubmission | null {
    const list = this.listSubmissions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return null;

    const sub = list[idx];
    const sequence: LayananStatus[] = ['diajukan', 'verifikasi', 'diproses', 'selesai', 'diambil'];
    const currentSeqIdx = sequence.indexOf(sub.status);

    if (currentSeqIdx >= sequence.length - 1) {
      // Already at final stage
      return sub;
    }

    const nextStatus = sequence[currentSeqIdx + 1];
    const progressMap: Record<LayananStatus, number> = {
      diajukan: 20,
      verifikasi: 45,
      diproses: 75,
      selesai: 95,
      diambil: 100,
    };

    const nowStr =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const updatedTimeline = sub.timeline.map((step) => {
      if (step.status === nextStatus) {
        return {
          ...step,
          selesai: true,
          aktif: true,
          waktu: nowStr,
        };
      }
      if (sequence.indexOf(step.status) < sequence.indexOf(nextStatus)) {
        return {
          ...step,
          selesai: true,
          aktif: false,
        };
      }
      return {
        ...step,
        aktif: false,
      };
    });

    const updated: LayananSubmission = {
      ...sub,
      status: nextStatus,
      progress_percent: progressMap[nextStatus],
      timeline: updatedTimeline,
    };

    list[idx] = updated;
    mockStore.set(KEY_SUBMISSIONS, list);
    return updated;
  }

  subscribeSubmissions(callback: (list: LayananSubmission[]) => void): () => void {
    return mockStore.subscribe<LayananSubmission[]>(KEY_SUBMISSIONS, (data) => {
      callback(data || []);
    });
  }

  // ─── Cek Tilang ETLE ───────────────────────────────────────────────────────

  cekTilang(nopol: string): { records: TilangEtleRecord[]; found: boolean } {
    const cleanNopol = nopol.trim().toUpperCase().replace(/\s+/g, ' ');
    const records = DUMMY_TILANG_RECORDS[cleanNopol] || [];
    return {
      records,
      found: records.length > 0,
    };
  }

  // ─── Laporan Kehilangan (STPLK Online) ────────────────────────────────────

  listLaporan(uid?: string): LaporanKehilangan[] {
    const list = mockStore.get<LaporanKehilangan[]>(
      KEY_LAPORAN_KEHILANGAN,
      SEED_LAPORAN_KEHILANGAN
    );
    if (!uid) return list;
    return list.filter((l) => l.uid === uid);
  }

  getLaporan(idOrNomor: string): LaporanKehilangan | null {
    const list = this.listLaporan();
    const clean = idOrNomor.trim().toLowerCase();
    return list.find((l) => l.id === clean || l.nomor_lpk.toLowerCase() === clean) || null;
  }

  createLaporanKehilangan(payload: {
    uid: string;
    nama_pelapor: string;
    nik: string;
    no_hp: string;
    kategori: KehilanganKategori;
    judul_barang: string;
    ciri_ciri: string;
    lokasi_hilang: string;
    waktu_hilang: string;
    foto_bukti_url?: string;
  }): LaporanKehilangan {
    const currentList = this.listLaporan();
    const count = currentList.length + 1;
    const nomor_lpk = `LPK-2026-${String(count).padStart(4, '0')}`;
    const id = `lpk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newReport: LaporanKehilangan = {
      id,
      nomor_lpk,
      uid: payload.uid,
      nama_pelapor: payload.nama_pelapor,
      nik: payload.nik,
      no_hp: payload.no_hp,
      kategori: payload.kategori,
      judul_barang: payload.judul_barang,
      ciri_ciri: payload.ciri_ciri,
      lokasi_hilang: payload.lokasi_hilang,
      waktu_hilang: payload.waktu_hilang,
      foto_bukti_url: payload.foto_bukti_url,
      status: 'diproses',
      tanggal_lapor:
        new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB',
    };

    mockStore.upsertItem(KEY_LAPORAN_KEHILANGAN, newReport, 'id');
    return newReport;
  }

  subscribeLaporan(callback: (list: LaporanKehilangan[]) => void): () => void {
    return mockStore.subscribe<LaporanKehilangan[]>(KEY_LAPORAN_KEHILANGAN, (data) => {
      callback(data || []);
    });
  }
}

export const layananService = new LayananService();
