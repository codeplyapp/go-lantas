# Panduan Kustomisasi Maskot Robot SIGAP

File ini menjelaskan cara mengganti gambar/wajah Maskot Robot AI SIGAP untuk keperluan lomba atau branding institusi:

## Cara Mengganti Maskot:
1. Siapkan file gambar maskot Anda (format `.svg`, `.png`, atau `.webp`).
2. Ganti file `public/mascot/mascot.svg` dengan file gambar maskot baru Anda (disarankan format SVG rasio 1:1, atau PNG transparan minimal resolusi 256x256 px).
3. Jika Anda menggunakan format PNG atau nama file lain, Anda cukup memperbarui path di file `src/core/mascot.ts`:
   ```ts
   export const MASCOT_CONFIG = {
     name: "Si SIGAP",
     avatarUrl: "/mascot/mascot.svg", // ganti sesuai nama file baru di folder public/mascot/
     title: "Asisten Edukasi & Keselamatan Korlantas Polri",
   };
   ```
4. Simpan file dan refresh browser. Maskot akan otomatis berubah pada floating chat bubble, header chatbot, dan dialog edukasi di seluruh aplikasi.
