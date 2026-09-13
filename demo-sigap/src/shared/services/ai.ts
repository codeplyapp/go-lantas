// Dual-Engine AI Service: Gemini LLM (Google AI Studio) + Bulletproof Rule-Based Fallback

import { AIService, AIChatMessage } from '../../core/types';
import { AI_STORAGE_KEYS, DEFAULT_AI_MODEL, SIGAP_SYSTEM_PROMPT_HEADER } from '../../core/ai-config';
import { BANYUWANGI_HOTSPOTS, BANYUWANGI_INCIDENTS, BANYUWANGI_SAFE_ROUTES } from '../../data/banyuwangi_traffic';
import { SIMULATED_ACCIDENT_REPORTS } from '../../data/accidents';
import { EDUKASI_KNOWLEDGE_BASE } from '../../data/edukasi_kb';

// --- INJECTED KNOWLEDGE SNAPSHOT ---
function buildInjectedContext(): string {
  const trafficSummary = BANYUWANGI_HOTSPOTS.map(
    (h) => `- ${h.nama_jalan} (${h.wilayah}): Status [${h.level_kemacetan.toUpperCase()}], Rawan: ${h.jam_rawan}, Kecepatan: ${h.kecepatan_rata_rata}. Penyebab: ${h.penyebab}. Solusi Rute: ${h.saran_rute}`
  ).join('\n');

  const incidentsSummary = BANYUWANGI_INCIDENTS.map(
    (i) => `- [${i.tipe.toUpperCase()}] di ${i.lokasi} (${i.waktu}): ${i.deskripsi}`
  ).join('\n');

  const safeRoutesSummary = BANYUWANGI_SAFE_ROUTES.map(
    (r) => `- ${r.nama}: Jarak ${r.jarak}, Est: ${r.estimasi_waktu}. Panduan: ${r.rekomendasi}`
  ).join('\n');

  const accidentsSummary = SIMULATED_ACCIDENT_REPORTS.map(
    (a) => `- Kasus ${a.nomor_laporan} (${a.lokasi}): ${a.kronologi_singkat} | Faktor: ${a.faktor_penyebab} | Edukasi: ${a.edukasi_pencegahan}`
  ).join('\n');

  const lawSummary = EDUKASI_KNOWLEDGE_BASE.map(
    (e) => `- ${e.judul} (${e.referensi_uu}): ${e.poin_kunci.join('; ')}`
  ).join('\n');

  return `
=== DATA LAPANGAN LALU LINTAS KABUPATEN BANYUWANGI (REAL-TIME SNAPSHOT) ===
${trafficSummary}

=== INSIDEN & REKAYASA LALU LINTAS BANYUWANGI ===
${incidentsSummary}

=== RUTE AMAN PELAJAR & MAHASISWA BANYUWANGI ===
${safeRoutesSummary}

=== SIMULASI LAPORAN KECELAKAAN EDUKATIF KORLANTAS ===
${accidentsSummary}

=== DASAR HUKUM & TUGAS KORLANTAS POLRI (UU 22/2009) ===
${lawSummary}
`;
}

// --- RULE-BASED FALLBACK ENGINE ---
export class RuleBasedFallbackService implements AIService {
  async sendMessage(prompt: string): Promise<{ text: string; isFallback: boolean }> {
    const q = prompt.toLowerCase();

    // 1. Jalur Padat / Gajah Mada / Banyuwangi Macet
    if (q.includes('gajah mada') || q.includes('macet') || q.includes('padat') || q.includes('lalu lintas') || q.includes('kondisi jalan')) {
      const gajahMada = BANYUWANGI_HOTSPOTS.find((h) => h.id === 'bwi_spot_02');
      const simpangLima = BANYUWANGI_HOTSPOTS.find((h) => h.id === 'bwi_spot_01');
      const ketapang = BANYUWANGI_HOTSPOTS.find((h) => h.id === 'bwi_spot_03');

      return {
        text: `🚦 **Laporan Kondisi Lalu Lintas Banyuwangi Terkini:**

1. **Jl. Gajah Mada (Pusat Kota)**:
   - Status: **Padat Merayap** (Kecepatan ~${gajahMada?.kecepatan_rata_rata || '18 km/jam'})
   - Penyebab: Aktivitas pertokoan, parkir bahu jalan, dan jam antar-jemput sekolah.
   - 💡 **Rute Alternatif**: Alihkan ke **Jl. Brawijaya** atau lajur timur lingkar **Jl. Kepiting**.

2. **Simpang Lima Banyuwangi**:
   - Status: **Padat Merayap** pada jam 06:45–07:45 & 16:30–18:00 WIB.
   - 💡 **Saran**: Gunakan Jl. MT Haryono / Jl. Veteran.

3. **Lingkar Pelabuhan Ketapang**:
   - Status: **Macet Total / Antrean Truk Logistik**. Mohon pengendara motor selalu berada di lajur kiri.

*Gunakan fitur Peta di aplikasi SIGAP untuk visualisasi interaktif per jam!*`,
        isFallback: true,
      };
    }

    // 2. Rute Aman ke Sekolah / Kampus
    if (q.includes('rute aman') || q.includes('sekolah') || q.includes('kampus') || q.includes('ke sman') || q.includes('poliwangi')) {
      return {
        text: `🛵 **Rekomendasi Rute Aman Berkendara Pelajar Banyuwangi:**

✅ **Rute Pelajar Hijau (Pusat Kota ke SMAN 1 Giri):**
- **Jalur**: Taman Blambangan ➔ Jl. Veteran ➔ Jl. HOS Cokroaminoto ➔ SMAN 1 Giri (3.4 km, ~8 menit).
- **Keunggulan**: Menghindari kepadatan Simpang Lima dan terhubung dengan 4 titik **Zona Selamat Sekolah (ZOSS)** berpemandu.

✅ **Rute Kampus Aman (Kota ke Politeknik Negeri Banyuwangi / Poliwangi):**
- **Jalur**: Stasiun Banyuwangi Kota ➔ Jl. Raya Jember - Kabat (8.2 km, ~16 menit).
- **Panduan**: Gunakan lajur khusus roda dua, batas kecepatan maksimal 40 km/jam, dan pastikan menyalakan lampu utama.

🛡️ *Patuhi batas kecepatan dan jangan menyalip dari kiri ya sahabat!*`,
        isFallback: true,
      };
    }

    // 3. Kasus Kecelakaan / Laka / Evaluasi
    if (q.includes('kecelakaan') || q.includes('laka') || q.includes('kasus') || q.includes('korban') || q.includes('insiden')) {
      return {
        text: `💥 **Informasi Simulasi Kasus Kecelakaan & Evaluasi Korlantas Polri:**

⚠️ *(Catatan: Data di bawah merupakan simulasi edukatif untuk pembelajaran bersama)*

📋 **Kasus Terkini (Jl. Gajah Mada, Banyuwangi Kota):**
- **Kejadian**: Senggolan motor matic vs motor bebek saat mendahului.
- **Faktor Utama**: **Menyalip dari sisi kiri** tanpa menyalakan lampu isyarat sein dan berada di titik buta (*blind spot*).
- **Tingkat Keparahan**: Luka ringan / lecet.

🛑 **Edukasi Pencegahan (Pasal 112 UU No. 22/2009):**
1. Wajib mendahului dari sisi kanan jalan dengan ruang pandang bebas.
2. Nyalakan sein minimal **30 meter** sebelum manuver.
3. Selalu klik helm SNI hingga berbunyi "KLIK"!`,
        isFallback: true,
      };
    }

    // 4. Korlantas Polri / Apa itu Polri / Tugas Polisi
    if (q.includes('polri') || q.includes('korlantas') || q.includes('polantas') || q.includes('tugas polisi') || q.includes('presisi')) {
      return {
        text: `👮 **Tugas Pokok & Peran Korlantas POLRI:**

**Korps Lalu Lintas Kepolisian Negara Republik Indonesia (Korlantas Polri)** bertugas menyelenggarakan:
1. **Penegakan Hukum & Disiplin**: Mencegah pelanggaran lalu lintas demi keselamatan bersama.
2. **Rekayasa & Manajemen Lalu Lintas**: Mengurai kemacetan, sistem buka-tutup, dan Zona Selamat Sekolah (ZOSS).
3. **Edukasi & Perlindungan Generasi Muda**: Program Polsanak, Patroli Keamanan Sekolah (PKS), dan integrasi aplikasi cerdas seperti **SIGAP**.
4. **Layanan Darurat Terpadu 110**: Siaga 24 jam bebas pulsa merespons panggilan darurat masyarakat di jalan raya.

🌟 *Semboyan kami: Menuju Polri Presisi (Prediktif, Responsibilitas, Transparansi Berkeadilan) untuk Keselamatan Kemanusiaan!*`,
        isFallback: true,
      };
    }

    // 5. Helm SNI / Aturan Boncengan / Hukum
    if (q.includes('helm') || q.includes('sni') || q.includes('bonceng') || q.includes('hukum') || q.includes('pasal') || q.includes('uu')) {
      return {
        text: `🪖 **Dasar Hukum & Kewajiban Helm SNI (UU No. 22 Tahun 2009):**

📌 **Pasal 106 Ayat 8**:
*"Setiap orang yang mengemudikan Sepeda Motor dan Penumpang Sepeda Motor wajib mengenakan helm yang memenuhi standar nasional Indonesia."*

📌 **Pasal 291 Ayat 1 & 2**:
- Pengendara tanpa helm SNI dipidana kurungan paling lama 1 bulan atau denda paling banyak **Rp250.000**.
- Pengendara yang membiarkan penumpangnya tidak memakai helm dikenakan sanksi denda yang sama.

💡 **Fakta Medis**: Helm SNI menyerap benturan kepala hingga 70% dan menurunkan risiko gegar otak fatal secara drastis!`,
        isFallback: true,
      };
    }

    // 6. SOS / Darurat / 110
    if (q.includes('sos') || q.includes('darurat') || q.includes('110') || q.includes('tolong')) {
      return {
        text: `🚨 **Fitur Darurat SOS 110 SIGAP:**

Jika Anda atau orang terdekat mengalami kecelakaan/keadaan bahaya di jalan raya:
1. Buka tab **SOS** di aplikasi SIGAP.
2. **Tahan tombol merah selama 3 detik** (sistem anti-salah-pencet).
3. Titik GPS presisi Anda akan tercatat otomatis di sistem ` + "`sos_alerts`" + ` dan aplikasi langsung menghubungkan ke hotline **110 Contact Center Polri**.
4. Tetap tenang dan cari posisi aman di tepi jalan.`,
        isFallback: true,
      };
    }

    // Default Fallback
    return {
      text: `👋 Halo Sahabat SIGAP! Saya **Si SIGAP**, asisten keselamatan Korlantas Polri.

Saya dapat membantu Anda dengan:
- 🚦 Info titik macet & rute alternatif di Kabupaten Banyuwangi (Jl. Gajah Mada, Simpang Lima, Ketapang).
- 🛵 Rekomendasi rute aman untuk pelajar ke sekolah & kampus.
- 📋 Simulasi kasus kecelakaan dan edukasi pencegahan.
- 👮 Pemahaman aturan UU No. 22/2009 & peran Polri.

*Silakan klik salah satu tombol rekomendasi pertanyaan di bawah atau ketik pertanyaan Anda!*`,
      isFallback: true,
    };
  }
}

// --- GEMINI SERVICE IMPLEMENTATION ---
export class GeminiServiceImpl implements AIService {
  private fallbackService = new RuleBasedFallbackService();

  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AI_STORAGE_KEYS.API_KEY) || '';
    }
    return '';
  }

  async sendMessage(prompt: string, history: AIChatMessage[] = []): Promise<{ text: string; isFallback: boolean }> {
    const apiKey = this.getApiKey();

    // If no API key provided, seamlessly use Rule-Based Fallback
    if (!apiKey || apiKey.trim() === '') {
      return this.fallbackService.sendMessage(prompt);
    }

    try {
      const systemInstruction = SIGAP_SYSTEM_PROMPT_HEADER + '\n\n' + buildInjectedContext();
      const model = (typeof window !== 'undefined' && localStorage.getItem(AI_STORAGE_KEYS.MODEL)) || DEFAULT_AI_MODEL;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      // Build conversation contents
      const contents = [
        {
          role: 'user',
          parts: [{ text: `[INSTRUKSI SISTEM & DATA REFERENSI KORLANTAS POLRI BANYUWANGI]:\n${systemInstruction}\n\nPengguna bertanya: ${prompt}` }]
        }
      ];

      // Add recent history if available
      if (history.length > 0) {
        const recentHistory = history.slice(-4).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
        contents.splice(0, 0, ...recentHistory);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        }),
      });

      if (!response.ok) {
        console.warn('Gemini API response not OK, falling back to rule-based engine:', response.status);
        return this.fallbackService.sendMessage(prompt);
      }

      const data = await response.json();
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answerText) {
        return this.fallbackService.sendMessage(prompt);
      }

      return { text: answerText, isFallback: false };
    } catch (err) {
      console.warn('Gemini API fetch error, using fallback:', err);
      return this.fallbackService.sendMessage(prompt);
    }
  }
}

export const aiService = new GeminiServiceImpl();
