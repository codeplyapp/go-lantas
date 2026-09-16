# 🛡️ SIGAP — Sistem Inovasi Generasi Aman berlalu lintas dan Peduli

> **Prototipe Web Interaktif & Lampiran Data Pendukung LKTI Keselamatan Lalu Lintas Korlantas Polri 2026**  
> *Membuktikan Kelayakan Implementasi (Bobot Penilaian 25%), Offline-Ready, Tanpa Ketergantungan API Key Wajib, Selaras 100% dengan Skema Firestore TSD §4.*

---

## 🎨 Identitas Visual — Blueprint GoWapit × Palet SIGAP

Aplikasi mengimplementasikan pola desain GoWapit 1-ke-1 dengan palet resmi SIGAP:
- **Primary**: `#0077C0` (Bright Teal Blue) — Warna utama kepolisian presisi & identitas SIGAP.
- **Tint/Sky**: `#C7EEFF` (Pale Sky) — Aksen sekunder, latar pil aktif, dan highlight.
- **Background**: `#FAFAFA` (Bright Snow) — Latar permukaan bersih, lega dengan whitespace optimal.
- **Ink / Teks**: `#000000` (Deep Ink) — Keterbacaan kontras tinggi untuk teks utama.
- **Danger**: `#DC2626` — Tombol darurat SOS 110.
- **Warning/CTA**: `#F59E0B` — Aksen edukasi & tombol aksi penting.

### Karakteristik Desain GoWapit:
1. **Header + Pil**: Avatar persona, pil streak harian, pil total poin, toggle dark/light mode (`Sun`/`Moon`), dan panduan presentasi juri (`BookOpen`).
2. **Search Bar Cerdas**: Kotak pencarian interaktif dengan 5 filter chip cepat (Gajah Mada, ZOSS Giri, Helm SNI, SIM C, Darurat 110) yang terhubung ke Robot AI.
3. **Carousel Informasi**: Banner event & edukasi bergulir otomatis dengan indikator pagination dan kontrol navigasi.
4. **Horizontal Menu (6 Ikon)**: Akses instan ke Belajar Kuis, 4 Level SIM, Peta Live, SOS 110, Keluarga PDP, dan Si SIGAP AI.
5. **Kartu Kaca & Stat**: Format GoWapit radius 16px (`rounded-[16px]`), border halus `#e5ebe8`, dan elevasi shadow biru lembut `0 4px 16px rgba(0,119,192,0.08)`.
6. **Bottom Dock 5-Tab (Glassmorphism)**: Beranda · Belajar · SOS 110 (tombol merah menonjol di tengah) · Peta · Profil.
7. **Watermark Emboss**: Pola lambang perisai Korlantas & logo code `{}` berbayang lembut (~4% opacity) di latar belakang.

---

## 📌 Ringkasan Fitur Utama

1. **Gamifikasi & Belajar SIM Berjenjang**: 4 Level bertema (Rambu, Marka, Etika, Darurat) dengan pembahasan pasal hukum UU No. 22 Tahun 2009 serta leaderboard dinamis (Nasional, Sekolah SMAN 1 Giri, Kampus Poliwangi).
2. **Robot AI Asisten Keselamatan ("Si SIGAP")**: Chatbot terintegrasi LLM Google Gemini + Rule-Based Fallback dengan injeksi konteks lokal Kabupaten Banyuwangi (Jl. Gajah Mada, Simpang Lima, Ketapang) dan edukasi kepolisian. Slot gambar di `public/mascot/mascot.svg`.
3. **SOS No-Contact 110**: Tombol darurat anti-salah-pencet (*hold 3 seconds*), penangkap koordinat GPS nyata browser, logging ke `sos_alerts`, dan deep-link dialer 110.
4. **Peta Kemacetan & Rute Aman**: Peta Leaflet (bebas biaya) tersimulasi per jam (Pagi/Siang/Sore/Malam), titik laka, dan rute aman Zona Selamat Sekolah (ZOSS).
5. **Pemantauan Keluarga Berbasis Consent**: Kode pairing 6-digit, persetujuan dua arah, transparansi audit log akses, dan hak cabut izin seketika (Kepatuhan UU PDP No. 27/2022).

---

## 🚀 Cara Menjalankan Prototipe

### Prasyarat
- Node.js versi 18 ke atas
- Browser modern (Chrome / Edge / Firefox / Safari)

### Langkah Instalasi & Menjalankan:
```bash
# 1. Masuk ke direktori aplikasi
cd demo-sigap

# 2. Instal dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Buka URL yang tertera di terminal (`http://localhost:5173`) pada browser Anda.

---

## 🎬 Skrip Presentasi & Alur Demo Juri LKTI (~5 Menit)

Gunakan alur demonstrasi berikut di hadapan Dewan Juri/Reviewer:

| Menit | Aksi / Layar | Narasi & Poin Kunci Presenter |
|---|---|---|
| **00:00 – 00:45** | **Beranda** (Persona: Pelajar Rian) | *"Dewan juri yang terhormat, inilah SIGAP — prototipe aplikasi terpadu berdesain GoWapit dengan palet resmi Korlantas. Di Beranda, pelajar langsung disambut search bar, carousel info, menu cepat horizontal, kartu pantauan jalan, dan statistik streak harian."* |
| **00:45 – 01:30** | **Tab Belajar (Kuis SIM)** | *"Kami menyajikan 4 level bertema. Saat Rian menjawab soal rambu/marka secara tepat, poin bertambah +20, penjelasan pasal UU No. 22/2009 ditampilkan, dan posisi peringkat Rian di Leaderboard Sekolah langsung naik secara real-time."* |
| **01:30 – 02:15** | **Robot AI Si SIGAP** (Floating Bubble) | *"Inilah asisten cerdas Si SIGAP. Kami menguji suggestion chip 'Macet di Gajah Mada?'. Robot langsung menjawab status kepadatan Jl. Gajah Mada, rute alternatif Jl. Brawijaya, serta pasal hukum terkait dengan ramah khas Polantas Presisi."* |
| **02:15 – 03:00** | **Tab SOS 110** | *"Ketika terjadi situasi darurat, pengguna menahan tombol SOS selama 3 detik. Mekanisme ini mencegah false alarm. Seketika koordinat GPS browser tercatat di log `sos_alerts` dan aplikasi membuka dialog cepat ke Call Center 110 Polri."* |
| **03:00 – 03:45** | **Tab Peta** | *"Peta interaktif Leaflet kami menyajikan data lalu lintas Banyuwangi. Juri dapat mensimulasikan perubahan jam (Pagi 07:00, Siang, Sore 17:30, Malam) dan melihat rute aman ber-ZOSS menuju sekolah."* |
| **03:45 – 04:30** | **Fitur Keluarga (Consent UU PDP)** | *"Diakses melalui menu cepat Beranda atau Profil. Orang tua memasukkan kode pairing `SGP-8821`, anak memberikan persetujuan, dan anak berhak mencabut izin kapan saja sesuai amanat UU PDP No. 27/2022."* |
| **04:30 – 05:00** | **Tab Profil** & Toggle Dark/Light | *"Di tab Profil, juri dapat menguji integrasi Google AI Studio Gemini API key serta menguji tema gelap-terang instan. Seluruh data selaras dengan dokumen PRD & TSD LKTI Korlantas 2026."* |

---

## 🤖 Panduan Integrasi Robot AI & Penggantian Maskot

### 1. Menghubungkan Google AI Studio (Gemini API Key)
1. Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Buka tab **Profil** di aplikasi SIGAP.
3. Tempel API key ke kolom **Konfigurasi Gemini API Key** dan klik **Simpan Key**.
4. Robot AI akan langsung menggunakan model LLM Gemini asli!
> *Catatan: Jika API key tidak diisi atau perangkat offline, Robot AI tetap menjawab 100% mulus menggunakan **Rule-Based Fallback Engine**.*

### 2. Cara Mengganti Gambar Maskot Robot
1. Siapkan file avatar/maskot baru (format `.svg`, `.png`, atau `.webp`).
2. Ganti file di `public/mascot/mascot.svg`.
3. Jika menggunakan nama file berbeda, sesuaikan di `src/core/mascot.ts`:
   ```ts
   export const MASCOT_CONFIG = {
     name: "Si SIGAP",
     avatarUrl: "/mascot/maskot-baru.svg",
     title: "Asisten AI Keselamatan Korlantas Polri",
   };
   ```

---

## 📂 Struktur Direktori Proyek

```
demo-sigap/
├── public/
│   ├── mascot/
│   │   ├── mascot.svg            # Gambar Maskot Si SIGAP (bisa diganti)
│   │   └── README.md             # Panduan kustomisasi maskot
│   └── favicon.svg               # Lambang Korlantas SIGAP
├── src/
│   ├── core/
│   │   ├── types.ts              # TypeScript interface selaras TSD §4
│   │   ├── db.ts                 # Mock Firestore DB Engine (LocalStorage + Event Dispatcher)
│   │   ├── tema.ts               # Desain token Korlantas Polri
│   │   ├── mascot.ts             # Konfigurasi maskot & prompt chips
│   │   └── ai-config.ts          # System prompt & storage keys
│   ├── data/
│   │   ├── quiz_questions.ts     # 24 Bank Soal SIM Korlantas (4 Level)
│   │   ├── banyuwangi_traffic.ts # Data titik macet & rute aman Banyuwangi
│   │   ├── accidents.ts          # Kasus simulasi laka & pencegahan
│   │   ├── edukasi_kb.ts         # Basis pengetahuan UU 22/2009
│   │   └── mock_leaderboard.ts   # Data leaderboard sekolah & kampus
│   ├── features/
│   │   ├── beranda/              # Ringkasan persona, streak, CTA cepat
│   │   ├── game_kuis/            # Kuis interaktif, 4 level, leaderboard
│   │   ├── peta/                 # Peta kemacetan Leaflet Banyuwangi per jam
│   │   ├── sos/                  # Tombol SOS 3 detik, GPS capture, 110 dialer
│   │   ├── keluarga/             # Alur consent pairing orang tua - anak
│   │   ├── profil/               # Statistik akurasi, notifikasi, form API key
│   │   └── robot/                # Floating mascot bubble & chat modal
│   ├── shared/
│   │   ├── components/           # Header, BottomNavBar, PersonaSwitcher, DemoGuideModal, Toast
│   │   └── services/             # ai.ts (Gemini + Fallback), location.ts, notification.ts, sound.ts
│   ├── App.tsx                   # App Shell & State Providers
│   ├── main.tsx                  # Entry point React
│   └── index.css                 # Styling Tailwind & Glassmorphism
└── README.md
```

---

## 🏆 Kaitan dengan Kriteria Penilaian LKTI

- **Kelayakan Implementasi (25%)**: Terbukti melalui prototipe web fungsional yang responsif, zero-cost architecture, dan siap migrasi ke backend Firebase/Cloud Functions.
- **Inovasi & Kreativitas**: Penggabungan gamifikasi SIM berjenjang, integrasi chatbot AI kontekstual daerah, dan alur keselamatan keluarga berbasis UU PDP.
- **Dampak Sosial**: Menurunkan angka kecelakaan fatal pada kelompok usia produktif (pelajar/mahasiswa) melalui edukasi preventif dan respons darurat 110 dalam hitungan detik.

---
*Dibuat dengan dedikasi untuk Tim LKTI Korlantas POLRI 2026.*
