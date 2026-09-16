const fs = require('fs');
const path = require('path');

let rawData = fs.readFileSync(path.join(__dirname, 'osrm_precise_data.json'), 'utf8');
if (rawData.charCodeAt(0) === 0xFEFF) {
  rawData = rawData.slice(1);
}
const osrm = JSON.parse(rawData);

const tsContent = `import { TrafficHotspot, TrafficIncident, TrafficSegment } from '../core/types';

export const BANYUWANGI_CENTER: [number, number] = [-8.2215, 114.3646]; // Koordinat Presisi Banyuwangi (8°13'17" LS, 114°21'53" BT, 16 mdpl)

/**
 * Rute Navigasi Google Maps Presisi Tinggi (Mengikuti Setiap Lekukan Jalan Asli)
 * Total: ${osrm.navRoute.length} Titik Geometri Jalan Terverifikasi OpenStreetMap / Carto
 */
export const BANYUWANGI_NAVIGATION_ROUTE: [number, number][] = ${JSON.stringify(osrm.navRoute, null, 2)};

/**
 * Segmen Lalu Lintas Jalan Raya Banyuwangi (Google Maps Traffic Style)
 * Garis polyline 100% menempel dan melengkung tepat di atas badan jalan peta.
 */
export const BANYUWANGI_TRAFFIC_SEGMENTS: TrafficSegment[] = [
  {
    id: 'seg_ahmad_yani',
    nama_jalan: 'Jl. Ahmad Yani (Taman Blambangan — Simpang Lima)',
    polyline: ${JSON.stringify(osrm.segAhmadYani, null, 2)},
    kondisi: {
      pagi: 'padat',
      siang: 'sedang',
      sore: 'padat',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '15 km/jam',
      siang: '28 km/jam',
      sore: '18 km/jam',
      malam: '45 km/jam',
    },
    keterangan: 'Arteri utama pusat kota, akses perkantoran & pertokoan.',
  },
  {
    id: 'seg_dr_soetomo',
    nama_jalan: 'Jl. dr. Soetomo (Simpang Lima — Pasar Banyuwangi)',
    polyline: ${JSON.stringify(osrm.segDrSoetomo, null, 2)},
    kondisi: {
      pagi: 'macet_total',
      siang: 'padat',
      sore: 'sedang',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '8 km/jam',
      siang: '16 km/jam',
      sore: '24 km/jam',
      malam: '42 km/jam',
    },
    keterangan: 'Pekerjaan drainase & aktivitas pasar tradisional.',
  },
  {
    id: 'seg_jaksa_agung',
    nama_jalan: 'Jl. Jaksa Agung Suprapto (Simpang Lima — Kantor Bupati)',
    polyline: ${JSON.stringify(osrm.segJaksaAgung, null, 2)},
    kondisi: {
      pagi: 'sedang',
      siang: 'lancar',
      sore: 'sedang',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '25 km/jam',
      siang: '38 km/jam',
      sore: '26 km/jam',
      malam: '48 km/jam',
    },
    keterangan: 'Jalur penghubung pusat pemerintahan & perkantoran.',
  },
  {
    id: 'seg_pb_sudirman',
    nama_jalan: 'Jl. PB Sudirman (Simpang Lima — Lateng / Pertokoan)',
    polyline: ${JSON.stringify(osrm.segPbSudirman, null, 2)},
    kondisi: {
      pagi: 'sedang',
      siang: 'padat',
      sore: 'padat',
      malam: 'sedang',
    },
    kecepatan: {
      pagi: '22 km/jam',
      siang: '16 km/jam',
      sore: '14 km/jam',
      malam: '30 km/jam',
    },
    keterangan: 'Pusat niaga & pertokoan kota.',
  },
  {
    id: 'seg_gajah_mada',
    nama_jalan: 'Jl. Gajah Mada (Mojopanggung — Kawasan Kuliner & Kampus)',
    polyline: ${JSON.stringify(osrm.segGajahMada, null, 2)},
    kondisi: {
      pagi: 'padat',
      siang: 'padat',
      sore: 'padat',
      malam: 'sedang',
    },
    kecepatan: {
      pagi: '16 km/jam',
      siang: '18 km/jam',
      sore: '15 km/jam',
      malam: '32 km/jam',
    },
    keterangan: 'Kawasan padat sekolah, kampus, dan pertokoan kuliner.',
  },
  {
    id: 'seg_brawijaya',
    nama_jalan: 'Jl. Brawijaya (Ring Road Barat)',
    polyline: ${JSON.stringify(osrm.segBrawijaya, null, 2)},
    kondisi: {
      pagi: 'lancar',
      siang: 'lancar',
      sore: 'lancar',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '45 km/jam',
      siang: '48 km/jam',
      sore: '42 km/jam',
      malam: '55 km/jam',
    },
    keterangan: 'Jalur lingkar barat cepat bebas hambatan antar kecamatan.',
  },
  {
    id: 'seg_cokroaminoto_giri',
    nama_jalan: 'Jl. HOS Cokroaminoto & Wijaya Kusuma (Rute SMAN 1 Giri)',
    polyline: ${JSON.stringify(osrm.segCokroaminoto, null, 2)},
    kondisi: {
      pagi: 'lancar',
      siang: 'lancar',
      sore: 'lancar',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '30 km/jam',
      siang: '35 km/jam',
      sore: '32 km/jam',
      malam: '40 km/jam',
    },
    keterangan: 'Zona Selamat Sekolah (ZOSS) berkecepatan tertib dan aman.',
  },
  {
    id: 'seg_kepiting',
    nama_jalan: 'Jl. Kepiting / Kolonel Sugiono (Ring Road Timur)',
    polyline: ${JSON.stringify(osrm.segKepiting, null, 2)},
    kondisi: {
      pagi: 'lancar',
      siang: 'lancar',
      sore: 'sedang',
      malam: 'lancar',
    },
    kecepatan: {
      pagi: '38 km/jam',
      siang: '40 km/jam',
      sore: '26 km/jam',
      malam: '45 km/jam',
    },
    keterangan: 'Jalur alternatif bebas hambatan sisi timur kota.',
  },
];

export const BANYUWANGI_HOTSPOTS: TrafficHotspot[] = [
  {
    id: 'bwi_spot_01',
    nama_jalan: 'Simpang Lima Banyuwangi',
    wilayah: 'Pusat Kota Banyuwangi',
    koordinat: [-8.219144, 114.369034],
    level_kemacetan: 'padat_merayap',
    jam_rawan: '06:45 - 07:45 & 16:30 - 18:00',
    kecepatan_rata_rata: '15 - 20 km/jam',
    penyebab: 'Titik temu 5 arus utama kota + jam antar jemput sekolah.',
    saran_rute: 'Gunakan Jl. Veteran & Jl. HOS Cokroaminoto untuk memotong ke arah utara.',
    time_slots: ['pagi', 'sore'],
  },
  {
    id: 'bwi_spot_02',
    nama_jalan: 'Jl. Gajah Mada (Kawasan Sekolah & Kuliner)',
    wilayah: 'Banyuwangi Kota',
    koordinat: [-8.2255, 114.3565],
    level_kemacetan: 'padat_merayap',
    jam_rawan: '11:30 - 13:30 & 17:00 - 19:30',
    kecepatan_rata_rata: '18 km/jam',
    penyebab: 'Parkir bahu jalan di pertokoan kuliner & bubaran jam kantor/sekolah.',
    saran_rute: 'Alihkan perjalanan melalui Ring Road Barat Jl. Brawijaya.',
    time_slots: ['siang', 'sore', 'malam'],
  },
];

export const BANYUWANGI_INCIDENTS: TrafficIncident[] = [
  {
    id: 'inc_bwi_01',
    judul: 'Laka Ringan Roda Dua (Tumpahan Pasir)',
    lokasi: 'Jl. Gajah Mada',
    koordinat: [-8.2255, 114.3565],
    tipe: 'kecelakaan',
    status: 'penanganan',
    waktu: '10 mnt lalu',
    deskripsi: 'Ditangani Unit Patroli Lantas Polresta Banyuwangi. Jalur kiri tersendat.',
    label_simulasi: true,
  },
  {
    id: 'inc_bwi_02',
    judul: 'Pekerjaan Drainase & Buka Tutup Jalan',
    lokasi: 'Jl. dr. Soetomo, Simpang Lima',
    koordinat: [-8.2172, 114.3688],
    tipe: 'perbaikan_jalan',
    status: 'aktif',
    waktu: 'Aktif',
    deskripsi: 'Penyempitan lajur dari utara. Petugas Polantas memberlakukan buka-tutup (+6 mnt delay).',
    label_simulasi: true,
  },
  {
    id: 'inc_bwi_03',
    judul: 'Zona Selamat Sekolah (ZOSS) Terpadu',
    lokasi: 'Kawasan SMAN 1 Giri',
    koordinat: [-8.2085, 114.3615],
    tipe: 'contraflow',
    status: 'aktif',
    waktu: '06:30 - 07:30',
    deskripsi: 'ZOSS aktif dengan pendampingan Polantas & PKS di zebra cross sekolah.',
    label_simulasi: true,
  },
];

export const BANYUWANGI_SAFE_ROUTES = [
  {
    id: 'safe_01',
    nama: 'Rute Pelajar Hijau (Pusat Kota ke SMAN 1 Giri)',
    titik_mulai: 'Jl. Ahmad Yani (Taman Blambangan)',
    titik_akhir: 'SMAN 1 Giri (Jl. Wijaya Kusuma)',
    jarak: '3.6 km',
    estimasi_waktu: '6 menit',
    rekomendasi: 'Melintasi Jl. Veteran dan Jl. HOS Cokroaminoto. Jalur aman bebas penyempitan drainase.',
  }
];
`;

fs.writeFileSync(path.join(__dirname, '../src/data/banyuwangi_traffic.ts'), tsContent, 'utf8');
console.log('Successfully generated src/data/banyuwangi_traffic.ts with precision OSM geometry!');
