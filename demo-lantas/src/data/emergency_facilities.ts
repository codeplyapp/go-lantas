import { EmergencyFacility } from '../core/types';

export const BANYUWANGI_EMERGENCY_FACILITIES: EmergencyFacility[] = [
  // 1. KANTOR POLISI / POLSEK / POS LANTAS
  {
    id: 'polsek_bwi_kota',
    nama: 'Polsek Banyuwangi Kota',
    tipe: 'polsek',
    alamat: 'Jl. Letkol Istiqlah No. 42, Singonegaran, Kec. Banyuwangi',
    koordinat: [-8.2178, 114.3638],
    jarak_km: 0.9,
    estimasi_menit: 3,
    nomor_telepon: '110 / (0333) 421110',
    jam_operasional: 'Siaga 24 Jam (SPKT & Patroli)',
    keterangan: 'Pusat komando dan penanganan darurat kamtibmas & laka lantas wilayah Kota Banyuwangi.',
    layanan_unggulan: [
      'SPKT & Pengaduan Darurat 110',
      'Patroli Reaksi Cepat ZOSS',
      'Penanganan Pertama Laka Lantas'
    ]
  },
  {
    id: 'pos_lantas_simpang_lima',
    nama: 'Pos Lantas Simpang Lima Banyuwangi',
    tipe: 'polsek',
    alamat: 'Bundaran Simpang Lima, Kepatihan, Banyuwangi',
    koordinat: [-8.2162, 114.3668],
    jarak_km: 0.8,
    estimasi_menit: 2,
    nomor_telepon: '110',
    jam_operasional: 'Siaga 24 Jam (Pos Pantau)',
    keterangan: 'Pos pengawasan dan pengaturan arus lalu lintas simpul utama Banyuwangi.',
    layanan_unggulan: [
      'Quick Response Kemacetan & Laka',
      'Pengaturan Lampu Lalu Lintas',
      'Bantuan Darurat Pengendara'
    ]
  },
  {
    id: 'satlantas_polresta_bwi',
    nama: 'Satlantas Polresta Banyuwangi',
    tipe: 'polsek',
    alamat: 'Jl. Brawijaya No. 21, Kebalenan, Kec. Banyuwangi',
    koordinat: [-8.2325, 114.3592],
    jarak_km: 2.1,
    estimasi_menit: 6,
    nomor_telepon: '(0333) 421124 / 110',
    jam_operasional: 'Siaga 24 Jam',
    keterangan: 'Markas Satuan Lalu Lintas Polresta Banyuwangi & Unit Gakkum Kecelakaan.',
    layanan_unggulan: [
      'Unit Penegakan Hukum & Olah TKP Laka',
      'Traffic Management Center (TMC)',
      'Pengawalan Medis Darurat'
    ]
  },

  // 2. PEMADAM KEBAKARAN & PENYELAMATAN (DAMKAR)
  {
    id: 'damkar_mako_induk',
    nama: 'Dinas Pemadam Kebakaran & Penyelamatan (Mako Induk)',
    tipe: 'damkar',
    alamat: 'Jl. Adi Sucipto No. 68, Sobo, Kec. Banyuwangi',
    koordinat: [-8.2295, 114.3685],
    jarak_km: 1.4,
    estimasi_menit: 4,
    nomor_telepon: '113 / (0333) 422113',
    jam_operasional: 'Siaga 24 Jam Nonstop',
    keterangan: 'Markas komando armada pemadam kebakaran dan rescue evakuasi kecelakaan lalu lintas.',
    layanan_unggulan: [
      'Evakuasi Kebakaran Kendaraan & Jalan',
      'Peralatan Extrication Korban Terjepit Laka',
      'Pembersihan Tumpahan Bahan Bakar / Oli'
    ]
  },
  {
    id: 'damkar_pos_giri',
    nama: 'Pos Damkar Sektor Giri & Pelajar',
    tipe: 'damkar',
    alamat: 'Jl. Gajah Mada No. 12, Mojopanggung, Giri, Banyuwangi',
    koordinat: [-8.2105, 114.3605],
    jarak_km: 1.8,
    estimasi_menit: 5,
    nomor_telepon: '113 / 0811-3030-113',
    jam_operasional: 'Siaga 24 Jam',
    keterangan: 'Unit response cepat pemadam kebakaran & penyelamatan area utara / jalur sekolah.',
    layanan_unggulan: [
      'Respon Cepat Zona Pendidikan & ZOSS',
      'Armada Water Supply Cepat',
      'Tim Evakuasi Pohon Tumbang'
    ]
  },

  // 3. RUMAH SAKIT & IGD 24 JAM
  {
    id: 'rsud_blambangan',
    nama: 'RSUD Blambangan (IGD & Trauma Center)',
    tipe: 'rumah_sakit',
    alamat: 'Jl. Letkol Istiqlah No. 49, Singonegaran, Kec. Banyuwangi',
    koordinat: [-8.2185, 114.3625],
    jarak_km: 1.1,
    estimasi_menit: 3,
    nomor_telepon: 'IGD: (0333) 421118 / 118',
    jam_operasional: 'IGD & Ambulans 24 Jam',
    keterangan: 'Rumah Sakit Umum Daerah Tipe B dengan instalasi gawat darurat trauma kecelakaan terlengkap.',
    layanan_unggulan: [
      'Trauma Center & Bedah Darurat Laka',
      'Armada Ambulans Siaga 118',
      'ICU & Radiologi CT-Scan 24 Jam'
    ]
  },
  {
    id: 'rs_yasmin',
    nama: 'RS Yasmin Banyuwangi',
    tipe: 'rumah_sakit',
    alamat: 'Jl. Letkol Istiqlah No. 44, Singonegaran, Kec. Banyuwangi',
    koordinat: [-8.2170, 114.3642],
    jarak_km: 1.0,
    estimasi_menit: 3,
    nomor_telepon: 'IGD: (0333) 424671',
    jam_operasional: 'IGD 24 Jam',
    keterangan: 'Rumah sakit swasta dengan penanganan cepat gawat darurat medis di pusat kota.',
    layanan_unggulan: [
      'IGD Cepat Laka Ringan & Sedang',
      'Layanan Ambulans Jemput Pasien',
      'Farmasi & Laboratorium 24 Jam'
    ]
  },
  {
    id: 'rs_islam_fatimah',
    nama: 'RS Islam Fatimah Banyuwangi',
    tipe: 'rumah_sakit',
    alamat: 'Jl. Jember No. 25, Kalipuro, Kec. Kalipuro, Banyuwangi',
    koordinat: [-8.2045, 114.3680],
    jarak_km: 2.8,
    estimasi_menit: 7,
    nomor_telepon: 'IGD: (0333) 421451',
    jam_operasional: 'IGD 24 Jam',
    keterangan: 'Fasilitas rujukan kesehatan di gerbang utara Banyuwangi.',
    layanan_unggulan: [
      'IGD Darurat 24 Jam',
      'Unit Ambulans Siaga',
      'Rawat Inap & Bedah Minor'
    ]
  }
];
