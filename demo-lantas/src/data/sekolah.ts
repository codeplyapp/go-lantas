// Daftar Sekolah & Kampus Mitra Kurikulum Keselamatan Korlantas POLRI
import { SchoolCampusEntry } from '../core/types';

export const DAFTAR_SEKOLAH_KAMPUS: SchoolCampusEntry[] = [
  // Sekolah SMA / SMK
  {
    id: 'sch_01',
    nama: 'SMAN 2 Taruna Bhayangkara Jawa Timur',
    tipe: 'sekolah',
    wilayah: 'Banyuwangi',
    total_siswa: 1240,
  },
  {
    id: 'sch_02',
    nama: 'SMAN 1 Glagah Banyuwangi',
    tipe: 'sekolah',
    wilayah: 'Banyuwangi',
    total_siswa: 1080,
  },
  {
    id: 'sch_03',
    nama: 'SMAN 1 Giri Banyuwangi',
    tipe: 'sekolah',
    wilayah: 'Banyuwangi',
    total_siswa: 960,
  },
  {
    id: 'sch_04',
    nama: 'SMKN 1 Banyuwangi',
    tipe: 'sekolah',
    wilayah: 'Banyuwangi',
    total_siswa: 1450,
  },
  {
    id: 'sch_05',
    nama: 'SMAN 1 Genteng',
    tipe: 'sekolah',
    wilayah: 'Banyuwangi',
    total_siswa: 1120,
  },
  {
    id: 'sch_06',
    nama: 'SMAN 3 Jakarta',
    tipe: 'sekolah',
    wilayah: 'DKI Jakarta',
    total_siswa: 1300,
  },
  {
    id: 'sch_07',
    nama: 'SMAN 5 Surabaya',
    tipe: 'sekolah',
    wilayah: 'Surabaya',
    total_siswa: 1250,
  },
  {
    id: 'sch_08',
    nama: 'SMAN 3 Bandung',
    tipe: 'sekolah',
    wilayah: 'Bandung',
    total_siswa: 1180,
  },

  // Perguruan Tinggi / Kampus
  {
    id: 'kmp_01',
    nama: 'Politeknik Negeri Banyuwangi (Poliwangi)',
    tipe: 'kampus',
    wilayah: 'Banyuwangi',
    total_siswa: 3800,
  },
  {
    id: 'kmp_02',
    nama: 'Universitas Airlangga (UNAIR SIKIA Banyuwangi)',
    tipe: 'kampus',
    wilayah: 'Banyuwangi',
    total_siswa: 2400,
  },
  {
    id: 'kmp_03',
    nama: 'Universitas Bakti Indonesia (UBI)',
    tipe: 'kampus',
    wilayah: 'Banyuwangi',
    total_siswa: 1950,
  },
  {
    id: 'kmp_04',
    nama: 'Universitas Indonesia (UI)',
    tipe: 'kampus',
    wilayah: 'Depok / DKI Jakarta',
    total_siswa: 42000,
  },
  {
    id: 'kmp_05',
    nama: 'Institut Teknologi Bandung (ITB)',
    tipe: 'kampus',
    wilayah: 'Bandung',
    total_siswa: 28000,
  },
  {
    id: 'kmp_06',
    nama: 'Universitas Gadjah Mada (UGM)',
    tipe: 'kampus',
    wilayah: 'Yogyakarta',
    total_siswa: 48000,
  },
  {
    id: 'kmp_07',
    nama: 'Institut Teknologi Sepuluh Nopember (ITS)',
    tipe: 'kampus',
    wilayah: 'Surabaya',
    total_siswa: 25000,
  },
];

export const ALL_SCHOOLS_CAMPUSES = DAFTAR_SEKOLAH_KAMPUS;
