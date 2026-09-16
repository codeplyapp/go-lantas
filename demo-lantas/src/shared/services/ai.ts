// Dual-Engine AI Service: Gemini LLM (Google AI Studio) + Bulletproof Rule-Based Fallback

import { AIService, AIChatMessage } from '../../core/types';
import { 
  AI_STORAGE_KEYS, 
  DEFAULT_AI_MODEL, 
  SIGAP_SYSTEM_PROMPT_HEADER, 
  getGeminiApiKey 
} from '../../core/ai-config';
import { locationService } from './location';
import { BANYUWANGI_HOTSPOTS, BANYUWANGI_INCIDENTS, BANYUWANGI_SAFE_ROUTES } from '../../data/banyuwangi_traffic';
import { SIMULATED_ACCIDENT_REPORTS } from '../../data/accidents';
import { EDUKASI_KNOWLEDGE_BASE } from '../../data/edukasi_kb';

// --- INJECTED KNOWLEDGE SNAPSHOT ---
function buildInjectedContext(): string {
  const currentLoc = locationService.getLocation();

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
=== LOKASI REAL-TIME PENGGUNA SAAT INI ===
- Wilayah / Kota: ${currentLoc.cityName} (${currentLoc.province})
- Area Terdekat: ${currentLoc.subdistrict}
- Alamat Terdeteksi: ${currentLoc.formattedAddress}
- Koordinat GPS: Lat ${currentLoc.latitude.toFixed(5)}, Lng ${currentLoc.longitude.toFixed(5)} (Status GPS: ${currentLoc.isGPS ? 'Live Geolocation' : 'Preset Terpilih'})

=== DATA LALU LINTAS & RUTE KORLANTAS POLRI ===
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

      return {
        text: `🚦 **Kondisi Lalu Lintas Banyuwangi Terkini:**

1. **Jl. Gajah Mada (Pusat Kota)**
   - Status: **Padat Merayap** (~${gajahMada?.kecepatan_rata_rata || '18 km/jam'})
   - Penyebab: Parkir bahu jalan & jam antar-jemput sekolah.
   - 💡 **Rute Alternatif**: Lewat **Jl. Brawijaya** atau lingkar **Jl. Kepiting**.

2. **Simpang Lima Banyuwangi**
   - Status: **Padat Merayap** (Jam sibuk: 06.45–07.45 & 16.30–18.00 WIB).
   - 💡 **Rute Alternatif**: Lewat **Jl. Veteran** / **Jl. HOS Cokroaminoto**.

3. **Pelabuhan Ketapang**
   - Status: **Antrean Truk Logistik**. Roda dua wajib di lajur kiri.`,
        isFallback: true,
      };
    }

    // 2. Rute Aman ke Sekolah / Kampus
    if (q.includes('rute aman') || q.includes('sekolah') || q.includes('kampus') || q.includes('taruna') || q.includes('bhayangkara') || q.includes('ke sman') || q.includes('poliwangi')) {
      return {
        text: `🛵 **Rute Aman Berkendara Pelajar Banyuwangi:**

1. **Menuju SMAN 2 Taruna Bhayangkara (Genteng)**
   - **Jalur**: Taman Blambangan / RTH Genteng ➔ Jl. Raya Genteng ➔ Jl. Pandan (4.2 km, ~8 menit).
   - **Fasilitas Keselamatan**: Terhubung dengan 4 titik **Zona Selamat Sekolah (ZOSS)** & kamera pantau Korlantas.

2. **Menuju Poliwangi (Kabat)**
   - **Jalur**: Pusat Kota ➔ Jl. Raya Jember - Kabat (8.2 km, ~16 menit).
   - **Panduan**: Gunakan lajur kiri khusus roda dua, batas kecepatan maksimal 40 km/jam, lampu utama wajib menyala.`,
        isFallback: true,
      };
    }

    // 3. Kasus Kecelakaan / Laka / Evaluasi
    if (q.includes('kecelakaan') || q.includes('laka') || q.includes('kasus') || q.includes('korban') || q.includes('insiden')) {
      return {
        text: `💥 **Evaluasi Kasus Laka Lantas *(Simulasi Edukasi)*:**

- **Lokasi**: Jl. Gajah Mada (Depan Toko Buah Asri, Banyuwangi Kota).
- **Kronologi**: Senggolan sepeda motor saat mendahului angkutan kota.
- **Faktor Penyebab**: Menyalip dari sisi kiri tanpa menyalakan sein & berada di titik buta (*blind spot*).
- **Pencegahan (Pasal 112 UU No. 22/2009)**:
  1. Wajib mendahului dari sisi kanan jalan.
  2. Berikan isyarat lampu sein minimal 30 meter sebelumnya.
  3. Gunakan helm SNI terkunci "KLIK".`,
        isFallback: true,
      };
    }

    // 4. Korlantas Polri / Apa itu Polri / Tugas Polisi
    if (q.includes('polri') || q.includes('korlantas') || q.includes('polantas') || q.includes('tugas polisi') || q.includes('presisi')) {
      return {
        text: `👮 **Tugas Pokok Korlantas Polri:**

1. **Penegakan Hukum (Gakkum)**: Pengawasan kepatuhan aturan jalan raya berbasis ETLE dan humanis.
2. **Rekayasa Lalu Lintas**: Manajemen arus kendaraan, penguraian titik macet, dan standardisasi ZOSS sekolah.
3. **Edukasi & Pelayanan**: Uji kompetensi SIM, edukasi tertib berkendara, dan digitalisasi layanan Go Lantas.
4. **Tanggap Darurat 110**: Siaga 24 jam penanganan insiden dan kecelakaan di jalan raya.`,
        isFallback: true,
      };
    }

    // 5. Helm SNI / Aturan Boncengan / Hukum
    if (q.includes('helm') || q.includes('sni') || q.includes('bonceng') || q.includes('hukum') || q.includes('pasal') || q.includes('uu')) {
      return {
        text: `🪖 **Aturan & Sanksi Helm SNI (UU No. 22 Tahun 2009):**

- **Pasal 106 Ayat 8**: Pengemudi dan penumpang sepeda motor wajib mengenakan helm berstandar SNI.
- **Pasal 291 Ayat 1 & 2**: Sanksi pidana kurungan maksimal 1 bulan atau denda paling banyak **Rp250.000** bagi pengendara maupun penumpang yang tidak memakai helm SNI.
- **Fungsi Keselamatan**: Meredam hingga 70% benturan kepala dan mencegah cedera fatal.`,
        isFallback: true,
      };
    }

    // 6. SOS / Darurat / 110
    if (q.includes('sos') || q.includes('darurat') || q.includes('110') || q.includes('tolong')) {
      return {
        text: `🚨 **Prosedur Darurat SOS 110:**

1. Buka menu **SOS** pada aplikasi Go Lantas.
2. **Tahan tombol 3 detik** untuk aktivasi siaga.
3. Koordinat GPS presisi Anda otomatis terkirim ke Command Center dan tersambung ke **Call Center 110 Polri**.`,
        isFallback: true,
      };
    }

    // Default Fallback
    return {
      text: `👋 **Go Lantas AI — Asisten Korlantas Polri**

Topik yang dapat langsung ditanyakan:
- 🚦 **Lalu Lintas**: Kondisi Jl. Gajah Mada, Simpang Lima, Ketapang & rute alternatif.
- 🛵 **Rute Pelajar**: Jalur aman ke sekolah & kampus di Banyuwangi.
- 🪖 **Aturan & SIM**: Ketentuan helm SNI, syarat SIM, & UU 22/2009.
- 🚨 **Darurat**: Penanganan laka & tombol SOS 110.`,
      isFallback: true,
    };
  }
}

// --- GEMINI SERVICE IMPLEMENTATION ---
export class GeminiServiceImpl implements AIService {
  private fallbackService = new RuleBasedFallbackService();

  private getApiKey(): string {
    return getGeminiApiKey();
  }

  async sendMessage(prompt: string, history: AIChatMessage[] = []): Promise<{ text: string; isFallback: boolean }> {
    const apiKey = this.getApiKey();

    // If no API key provided, seamlessly use Rule-Based Fallback
    if (!apiKey || apiKey.trim() === '') {
      return this.fallbackService.sendMessage(prompt);
    }

    try {
      const systemInstructionText = SIGAP_SYSTEM_PROMPT_HEADER + '\n\n' + buildInjectedContext();
      
      // Build clean contents ensuring alternating roles starting with 'user'
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Filter previous history (ignore initial greeting if from model)
      const validHistory = history.filter((msg) => msg.text && msg.text.trim().length > 0);
      
      // Skip leading model messages
      let startIndex = 0;
      while (startIndex < validHistory.length && validHistory[startIndex].sender === 'bot') {
        startIndex++;
      }

      const recentItems = validHistory.slice(startIndex, -1).slice(-6); // Take up to last 6 messages excluding current user prompt
      for (const item of recentItems) {
        const role = item.sender === 'user' ? 'user' : 'model';
        // Avoid consecutive same roles
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + item.text;
        } else {
          contents.push({ role, parts: [{ text: item.text }] });
        }
      }

      // Add current prompt as user
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += '\n' + prompt;
      } else {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
      }

      const requestedModel = (typeof window !== 'undefined' && localStorage.getItem(AI_STORAGE_KEYS.MODEL)) || DEFAULT_AI_MODEL;
      const candidateModels = Array.from(new Set([requestedModel, 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']));

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
          
          const requestBody = {
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048,
            }
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            console.warn(`Model ${model} returned status ${response.status}. Trying next candidate...`);
            continue;
          }

          const data = await response.json();
          const candidateParts = data.candidates?.[0]?.content?.parts || [];
          const answerText = candidateParts
            .map((p: { text?: string }) => p.text)
            .filter(Boolean)
            .join('\n')
            .trim();

          if (answerText && answerText.length > 0) {
            return { text: answerText, isFallback: false };
          }
        } catch (modelErr) {
          console.warn(`Error connecting to model ${model}:`, modelErr);
        }
      }

      // If all candidate models failed, return rule-based fallback
      console.warn('All Gemini models exhausted. Falling back to rule-based engine.');
      return this.fallbackService.sendMessage(prompt);
    } catch (err) {
      console.warn('Gemini API fetch error, using fallback:', err);
      return this.fallbackService.sendMessage(prompt);
    }
  }
}

export const aiService = new GeminiServiceImpl();
