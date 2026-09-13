# Product Requirement Document (PRD)
## SIGAP — Sistem Inovasi Generasi Aman berlalu lintas dan Peduli

*Dokumen pendukung LKTI Keselamatan Lalu Lintas — Korlantas Polri 2026*

> **Catatan penamaan:** "SIGAP" adalah nama kerja (working title) yang saya usulkan agar dokumen konsisten. Ganti bebas sesuai selera — semua istilah di dokumen ini bisa di-find & replace.

---

## 1. Latar Belakang

Pelanggaran dan kecelakaan lalu lintas pada generasi muda sebagian besar dipicu oleh dua hal: **rendahnya kesadaran/edukasi** (tidak tahu atau menyepelekan risiko) dan **minimnya pengingat kontekstual** di momen-momen rawan (berangkat/pulang, jam macet). SIGAP dirancang sebagai aplikasi yang menggabungkan edukasi berbasis permainan, informasi kondisi jalan real-time, pengingat kontekstual, keterlibatan keluarga, dan akses darurat cepat — dalam satu ekosistem.

## 2. Tujuan Produk

1. Meningkatkan pemahaman dan kepatuhan pelajar/mahasiswa terhadap aturan lalu lintas melalui edukasi berbasis gamifikasi.
2. Memberi kesadaran situasional (kondisi jalan, kemacetan) sebelum berkendara.
3. Menghadirkan pengingat kontekstual di waktu-waktu rawan pelanggaran.
4. Memperkuat peran keluarga dalam mengawasi keselamatan anak di jalan, dengan basis persetujuan bersama (bukan pengawasan sepihak).
5. Mempercepat respons darurat lalu lintas melalui akses SOS langsung ke layanan 110.

## 3. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan utama |
|---|---|---|
| Pelajar (13–18 th) | Pengendara motor pemula, aktif media sosial | Edukasi ringan, gamifikasi, reward |
| Mahasiswa (18–24 th) | Mobilitas tinggi, sering terjebak macet | Info kondisi jalan, efisiensi rute |
| Orang tua | Ingin memastikan anak aman di jalan | Visibilitas lokasi anak (dengan izin), notifikasi risiko |
| Admin sekolah / Korlantas *(fase lanjut)* | Memantau partisipasi & tren wilayah | Dashboard agregat, laporan |

## 4. Ruang Lingkup Fitur (MVP) & Prioritas

| # | Fitur | Prioritas (MoSCoW) | Alasan |
|---|---|---|---|
| 1 | Game Interaktif & Kuis SIM | Must | Inti edukasi + engagement harian |
| 2 | Eksplorasi (Event & Leaderboard) | Must | Mendorong partisipasi & viralitas positif |
| 3 | Notifikasi kontekstual | Must | Low-effort, dampak langsung ke perilaku |
| 4 | SOS (No Contact ke 110) | Must | Nilai keselamatan & dampak nyata tinggi |
| 5 | Peta Kemacetan | Should | Bergantung ketersediaan data pihak ketiga |
| 6 | Pemantauan Akses Orang Tua | Should | Butuh alur consent yang matang sebelum rilis penuh |

## 5. User Stories & Acceptance Criteria

### 5.1 Game Interaktif & Kuis SIM
- *Sebagai pelajar, saya ingin menjawab kuis harian agar mendapat poin dan memahami rambu lalu lintas.*
  - AC: kuis baru tersedia tiap hari; jawaban benar menambah poin; progres tersimpan meski offline lalu sinkron saat online.
- *Sebagai pengguna, saya ingin melihat progres belajar saya dalam bentuk level/jalur.*
  - AC: jalur terdiri dari beberapa level bertema (rambu, marka, etika berkendara); level terkunci sampai level sebelumnya selesai.

### 5.2 Eksplorasi (Event & Leaderboard)
- *Sebagai pengguna, saya ingin melihat kasus lalu lintas yang sedang ramai di medsos sebagai bahan diskusi/edukasi.*
  - AC: konten dikurasi tim admin (bukan otomatis dari medsos mentah) untuk menghindari misinformasi.
- *Sebagai pengguna kompetitif, saya ingin melihat peringkat saya dibanding pengguna lain.*
  - AC: leaderboard mingguan reset otomatis; ada leaderboard nasional & per sekolah/kampus.

### 5.3 Notifikasi Kontekstual
- *Sebagai pengguna, saya ingin diingatkan memakai helm/membawa surat saat jam berangkat-pulang.*
  - AC: pengguna bisa atur jadwal sendiri; notifikasi bisa dimatikan per jenis.

### 5.4 SOS (No Contact)
- *Sebagai pengguna dalam kondisi darurat, saya ingin menghubungi layanan 110 tanpa perlu mengetik/bicara panjang.*
  - AC: tekan-tahan tombol SOS mengirim lokasi otomatis + memulai panggilan ke 110; ada konfirmasi anti-salah-pencet (tahan 3 detik).

### 5.5 Peta Kemacetan
- *Sebagai pengguna, saya ingin tahu titik macet sebelum berangkat.*
  - AC: data kemacetan bersumber dari layanan peta pihak ketiga (bukan dibangun dari nol); update near real-time.

### 5.6 Pemantauan Akses Orang Tua
- *Sebagai orang tua, saya ingin tahu anak saya sampai tujuan dengan aman, dengan sepengetahuan anak.*
  - AC: fitur aktif hanya setelah anak menyetujui undangan pairing; anak bisa melihat kapan lokasinya diakses; anak bisa mencabut izin kapan saja.

## 6. Kebutuhan Non-Fungsional

- **Bahasa:** Bahasa Indonesia (v1); struktur teks siap untuk lokalisasi lanjut.
- **Privasi & Consent:** sesuai prinsip UU PDP (Pelindungan Data Pribadi) — data lokasi anak tidak dibagikan tanpa persetujuan eksplisit dan dapat dicabut.
- **Ketersediaan offline:** materi kuis dan progres tetap bisa diakses tanpa koneksi, sinkron saat online.
- **Performa:** waktu muat halaman utama < 3 detik pada jaringan 4G.
- **Aksesibilitas:** kontras warna memadai, ukuran tap-target minimum 44px.

## 7. Metrik Keberhasilan (KPI)

| Metrik | Target indikatif |
|---|---|
| Kuis diselesaikan / pengguna / minggu | ≥ 3 |
| Retensi 30 hari | ≥ 35% |
| Adopsi fitur pemantauan keluarga (dari pengguna pelajar) | ≥ 20% |
| Waktu rata-rata dari tekan SOS ke tersambung 110 | < 5 detik |

## 8. Asumsi & Batasan

- Data kemacetan **memanfaatkan API peta pihak ketiga** (mis. Google Maps Platform), bukan sensor/infrastruktur baru — realistis untuk skala kompetisi/MVP.
- Integrasi langsung ke basis data SIM/STNK Korlantas **di luar cakupan MVP**; disebut sebagai peluang kolaborasi kelembagaan pada fase lanjut (mendukung poin "skema kolaborasi antar-instansi" di kriteria penilaian).
- Sambungan SOS ke 110 pada MVP disimulasikan melalui fungsi telepon standar (deep-link ke dialer); integrasi resmi ke command center 110 memerlukan kerja sama institusional.

## 9. Roadmap Fase

| Fase | Cakupan |
|---|---|
| Fase 1 — MVP | Kuis & gamifikasi, notifikasi kontekstual, Eksplorasi & leaderboard, SOS (dial-based) |
| Fase 2 | Peta kemacetan (integrasi API peta), pemantauan keluarga (consent-based) |
| Fase 3 | Dashboard admin sekolah/Korlantas, kolaborasi data resmi, integrasi command center 110 |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Fitur pemantauan lokasi dianggap invasif | Desain consent dua arah + transparansi akses (lihat §5.6) |
| Konten "Eksplorasi" dari medsos berpotensi hoaks | Kurasi manual/editorial sebelum tayang |
| Ketergantungan pada API pihak ketiga (peta) | Fallback tampilan info umum bila API tidak tersedia |
| Penyalahgunaan tombol SOS (panggilan palsu) | Mekanisme tahan-3-detik + rate limit + konfirmasi lokasi |

## 11. Lampiran

- Mockup UI: lihat artefak `mockup-app-lantas.jsx` (React/Tailwind) pada percakapan.
- Dokumen teknis terkait: `TSD-SIGAP.md`.
