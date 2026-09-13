# Technical Specification Document (TSD)
## SIGAP — Sistem Inovasi Generasi Aman berlalu lintas dan Peduli

*Pasangan dokumen dari `PRD-SIGAP.md`*

---

## 0. Catatan Asumsi Tech Stack

Flutter adalah framework aplikasi mobile (Dart) — bukan berbasis CSS, jadi Tailwind tidak dipakai langsung di dalamnya. Kombinasi yang paling masuk akal dari dua teknologi yang kamu sebut adalah:

- **Flutter** → aplikasi mobile utama (Android/iOS) yang dipakai pelajar/mahasiswa/orang tua.
- **Tailwind CSS v4** → dipakai di **web dashboard** pendamping (mis. panel admin sekolah/Korlantas untuk melihat data agregat, kurasi konten Eksplorasi, dan laporan SOS), dibangun dengan framework web (mis. Next.js) yang di-styling Tailwind v4.

Dokumen ini mengasumsikan arsitektur dua-klien tersebut. Kalau maksudnya beda (mis. Tailwind hanya untuk landing page promosi, atau Flutter Web dijadikan satu-satunya klien), tinggal bilang dan strukturnya saya sesuaikan.

## 1. Arsitektur Sistem (High-Level)

```
┌─────────────────┐        ┌──────────────────┐
│  Flutter App     │        │  Web Dashboard     │
│  (Android/iOS)   │        │  (Next.js +        │
│                  │        │   Tailwind v4)     │
└────────┬─────────┘        └────────┬───────────┘
         │  REST / Firestore SDK     │  REST
         ▼                            ▼
┌─────────────────────────────────────────────┐
│            Backend (Firebase)                │
│  Auth · Firestore · Cloud Functions · FCM     │
└───────────────┬───────────────────────────────┘
                 │
     ┌───────────┼───────────────┐
     ▼           ▼               ▼
Google Maps   Dialer/Telepon   (Fase lanjut)
Platform      (SOS ke 110)     Data resmi Korlantas
```

**Mengapa Firebase (Backend-as-a-Service):** untuk skala kompetisi/MVP, Firebase memangkas waktu implementasi (auth, database realtime, push notification, hosting siap pakai) tanpa perlu mengelola server sendiri — memperkuat poin "Kelayakan Implementasi" karena bisa dibuktikan berjalan nyata dalam waktu terbatas. Kalau nanti scale-up, migrasi ke backend custom (mis. NestJS + PostgreSQL) tetap memungkinkan karena struktur data tetap terdokumentasi di §4.

## 2. Rincian Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Mobile app | Flutter (Dart) | Satu codebase Android + iOS |
| State management | Riverpod | Ringan, testable |
| Navigasi | go_router | Deep-link ke tab SOS/notifikasi |
| Local storage/offline | Hive | Cache kuis & progres offline |
| Web dashboard | Next.js + Tailwind v4 | Cepat dibangun, styling utility-first |
| Backend | Firebase (Auth, Firestore, Cloud Functions) | BaaS, minim setup |
| Push notification | Firebase Cloud Messaging (FCM) | Notifikasi event & leaderboard |
| Notifikasi lokal terjadwal | flutter_local_notifications | Pengingat jam berangkat/pulang tanpa perlu selalu online |
| Peta & lalu lintas | Google Maps Platform (Maps SDK + Traffic Layer) | Data kemacetan real-time tanpa membangun sensor sendiri |
| Lokasi | Geolocator (Flutter) | Lokasi untuk SOS & pemantauan keluarga |
| Panggilan darurat | url_launcher (tel:110) | Simulasi "no contact call" di MVP |

## 3. Modul Flutter per Fitur

| Fitur | Modul/Package utama |
|---|---|
| Game & Kuis SIM | `riverpod` (state skor), `hive` (cache offline), Cloud Function `calculatePoints` |
| Eksplorasi & Leaderboard | Firestore collection `events`, Cloud Function terjadwal `aggregateLeaderboard` |
| Notifikasi kontekstual | `flutter_local_notifications` + penjadwalan lokal berbasis preferensi user |
| SOS | `geolocator` + `url_launcher` + Firestore collection `sos_alerts` |
| Peta Kemacetan | `google_maps_flutter` + Traffic Layer API |
| Pemantauan Keluarga | `geolocator` (share lokasi berkala) + Firestore realtime listener + alur pairing consent |

## 4. Struktur Data (Firestore)

```
users/{uid}
  role: "pelajar" | "mahasiswa" | "orang_tua"
  nama, sekolah_kampus, poin_total, streak_hari

quiz_questions/{id}
  level, pertanyaan, opsi[], jawaban_benar, poin

quiz_attempts/{id}
  uid, question_id, benar (bool), timestamp

events/{id}                      // konten Eksplorasi, dikurasi admin
  judul, kategori ("viral"|"info"|"event"), sumber, tanggal

leaderboard_weekly/{uid}
  poin_minggu_ini, peringkat

family_links/{id}
  parent_uid, child_uid, status ("pending"|"disetujui"|"dicabut"), created_at

sos_alerts/{id}
  uid, lokasi (geopoint), waktu, status ("terkirim"|"ditangani")

notification_prefs/{uid}
  jadwal[]: { jenis, jam, aktif }

traffic_reports (cache)          // hasil pull dari Google Maps Traffic Layer
  ruas_jalan, level_kemacetan, updated_at
```

## 5. Alur Data Kunci

- **Kuis:** app baca `quiz_questions` (cache Hive) → user jawab offline-capable → saat online, tulis ke `quiz_attempts` → Cloud Function `calculatePoints` update `users.poin_total`.
- **Leaderboard:** Cloud Function terjadwal (mis. tiap jam) agregasi `quiz_attempts` → tulis ke `leaderboard_weekly`.
- **SOS:** tombol ditahan 3 detik → ambil lokasi (`geolocator`) → tulis `sos_alerts` → trigger `url_launcher` buka dialer ke 110.
- **Pemantauan Keluarga:** orang tua kirim kode pairing → anak approve di app → `family_links.status = disetujui` → lokasi anak dibagikan berkala **hanya** selama status disetujui; anak bisa cabut kapan saja (`status = dicabut`, listener otomatis berhenti).
- **Notifikasi kontekstual:** dijadwalkan lokal di device berdasarkan `notification_prefs`, tidak bergantung server (tetap jalan walau offline).

## 6. Keamanan & Privasi

- **Autentikasi:** Firebase Auth (email/HP + OTP).
- **Firestore Security Rules:** berbasis role — `orang_tua` hanya bisa baca lokasi `child_uid` yang statusnya `disetujui`; siswa hanya bisa baca/tulis datanya sendiri.
- **Consent lokasi:** wajib approval eksplisit dari akun anak sebelum `family_links` aktif; dicatat waktu persetujuan untuk audit trail.
- **Kepatuhan UU PDP:** data lokasi disimpan dengan retensi terbatas (mis. 30 hari rolling), dapat dihapus atas permintaan pengguna.
- **Data SOS:** hanya diakses oleh sistem internal, tidak ditampilkan publik.

## 7. Integrasi Pihak Ketiga

| Layanan | Fungsi |
|---|---|
| Google Maps Platform | Traffic Layer untuk Peta Kemacetan |
| Firebase Cloud Messaging | Notifikasi event/leaderboard |
| Dialer bawaan (tel:110) | Simulasi SOS no-contact pada MVP |
| *(Fase lanjut)* API resmi Korlantas/command center 110 | Integrasi panggilan darurat sesungguhnya — butuh kerja sama kelembagaan |

## 8. Kebutuhan Non-Fungsional (Teknis)

- **Offline-first** untuk modul kuis (Hive cache + sync queue).
- **Skalabilitas:** Firestore + Cloud Functions auto-scale untuk kebutuhan MVP–regional; migrasi ke backend custom jika skala nasional.
- **Target performa:** cold start app < 3 detik; sinkronisasi leaderboard < 2 detik pada 4G.

## 9. Environment & Deployment

- **Environment:** `dev` → `staging` → `prod` (project Firebase terpisah per environment).
- **CI/CD:** GitHub Actions — lint & test otomatis tiap push, build APK/IPA otomatis untuk staging.
- **Distribusi awal (demo lomba):** Android APK langsung / Firebase App Distribution; web dashboard di-deploy ke Vercel.

## 10. Strategi Pengujian

- Unit test: logika poin & kuis (`flutter test`).
- Widget test: layar Kuis, SOS, Profil.
- Integration test: alur pairing orang tua–anak end-to-end.
- UAT: uji coba terbatas dengan beberapa pelajar sebelum submission naskah, hasilnya bisa dicantumkan sebagai data dukung di BAB III naskah (dampak & kelayakan).

## 11. Roadmap Teknis (selaras PRD §9)

| Fase | Fokus teknis |
|---|---|
| Fase 1 — MVP | Setup Firebase, modul Kuis + Leaderboard + Notifikasi + SOS (dial-based) |
| Fase 2 | Integrasi Google Maps Traffic Layer, alur consent pemantauan keluarga |
| Fase 3 | Web dashboard admin (Next.js + Tailwind v4), eksplorasi kolaborasi data resmi Korlantas |

## 12. Struktur Folder Flutter (usulan)

```
lib/
  main.dart
  core/            // konstanta, tema, router
  features/
    beranda/
    game_kuis/
    peta/
    sos/
    profil/
  shared/
    widgets/
    services/      // firestore_service, location_service, notification_service
```
