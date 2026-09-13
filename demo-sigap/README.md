# 🛡️ SIGAP — Sistem Inovasi Generasi Aman berlalu lintas dan Peduli

> **Prototipe Web Interaktif & Lampiran Data Pendukung LKTI Keselamatan Lalu Lintas Korlantas Polri 2026**  
> *Membuktikan Kelayakan Implementasi (Bobot Penilaian 25%), Offline-Ready, Tanpa Ketergantungan API Key Wajib, Selaras 100% dengan Skema Firestore TSD §4.*

---

## 📌 Ringkasan Eksekutif

Aplikasi **SIGAP** dirancang sebagai solusi terpadu untuk memutus mata rantai pelanggaran dan kecelakaan lalu lintas pada generasi muda melalui 5 pilar utama:
1. **Gamifikasi & Kuis SIM Berjenjang**: 4 Level bertema (Rambu, Marka, Etika, Darurat) dengan pembahasan pasal hukum UU No. 22 Tahun 2009 serta leaderboard dinamis per sekolah/kampus.
2. **Robot AI Asisten Keselamatan ("Si SIGAP")**: Chatbot terintegrasi LLM Google Gemini + Rule-Based Fallback dengan injeksi konteks lokal Kabupaten Banyuwangi (Jl. Gajah Mada, Simpang Lima, Ketapang) dan edukasi kepolisian.
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

Buka URL yang tertera di terminal (biasanya `http://localhost:5173`) pada browser Anda.

---

## 🎬 Skrip Presentasi & Alur Demo Juri LKTI (~5 Menit)

Gunakan alur demonstrasi berikut di hadapan Dewan Juri/Reviewer:

| Menit | Aksi / Layar | Narasi & Poin Kunci Presenter |
|---|---|---|
| **00:00 – 00:45** | **Beranda** (Persona: Pelajar Rian) | *"Dewan juri yang terhormat, ini adalah Beranda SIGAP. Terlihat kartu identitas Rian dari SMAN 1 Giri Banyuwangi dengan penghitung streak kuis harian, total poin, dan ringkasan pantauan lalu lintas Banyuwangi."* |
| **00:45 – 01:30** | **Tab Kuis SIM** | *"Kami menyajikan 4 level bertema. Saat Rian menjawab soal rambu/marka secara tepat, poin bertambah +20, penjelasan pasal UU No. 22/2009 ditampilkan, dan posisi peringkat Rian di Leaderboard Sekolah langsung naik secara real-time."* |
| **01:30 – 02:15** | **Robot AI Si SIGAP** (Floating Bubble) | *"Inilah asisten cerdas Si SIGAP. Kami menguji suggestion chip 'Macet di Gajah Mada?'. Robot langsung menjawab status kepadatan Jl. Gajah Mada, rute alternatif Jl. Brawijaya, serta pasal hukum terkait dengan ramah khas Polantas Presisi."* |
| **02:15 – 03:00** | **Tab SOS 110** | *"Ketika terjadi situasi darurat, pengguna menahan tombol SOS selama 3 detik. Mekanisme ini mencegah false alarm. Seketika koordinat GPS browser tercatat di log `sos_alerts` dan aplikasi membuka dialog cepat ke Call Center 110 Polri."* |
| **03:00 – 03:45** | **Tab Peta** | *"Peta interaktif Leaflet kami tidak memerlukan API key berbayar. Juri dapat melihat perubahan titik kemacetan dari jam Pagi (07:00) ke jam Sore (17:30), serta rute aman ber-ZOSS menuju SMAN 1 Giri."* |
| **03:45 – 04:30** | **Persona Switcher ➔ Tab Keluarga** | *"Kami beralih persona ke Orang Tua (Bpk. Hendra). Fitur pemantauan keluarga tunduk pada UU PDP No. 27/2022: Orang tua memasukkan kode pairing `SGP-8821`, anak memberikan persetujuan, dan anak berhak mencabut izin kapan saja melalui tombol Cabut Izin."* |
| **04:30 – 05:00** | **Tab Profil** & Penutup | *"Di tab Profil, juri dapat menguji integrasi Google AI Studio Gemini API key secara live. Seluruh data selaras dengan dokumen PRD & TSD, membuktikan kesiapan implementasi nyata SIGAP."* |

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
