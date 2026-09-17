// AI-Powered Curriculum Generator for Go Lantas using Gemini API
// Generates structured curriculum modules for Menengah, Lanjutan, and Continuous Learning Mode

import { ModuleData, QuizQuestion, CurriculumTier } from '../core/types';
import { getGeminiApiKey, DEFAULT_AI_MODEL, AI_STORAGE_KEYS } from '../core/ai-config';
import { CURRICULUM_TIERS } from '../data/tiers';
import { firestoreService } from './firestore';

export interface GenerationResult {
  success: boolean;
  modules?: ModuleData[];
  quizzes?: Record<string, QuizQuestion[]>;
  error?: string;
  requiresApiKey?: boolean;
}

export class CurriculumAiService {
  /**
   * Generate 2 tailored AI curriculum modules + quizzes for a specific tier
   */
  async generateTierModules(
    uid: string,
    tier: 'menengah' | 'lanjutan' | 'berkelanjutan',
    batchIndex = 1
  ): Promise<GenerationResult> {
    const apiKey = getGeminiApiKey();

    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        requiresApiKey: true,
        error: `Aktifkan Kunci Akses API Key untuk membuka ${CURRICULUM_TIERS[tier]?.nama || 'tingkat ini'}.`,
      };
    }

    const tierConfig = CURRICULUM_TIERS[tier];
    const tierName = tierConfig.nama;
    const passingGrade = tierConfig.passingGrade;
    const bonusPoints = tierConfig.bonusPoints;
    const pointPerQ = tierConfig.pointPerQuestion;

    // Build custom focus topics per tier
    let focusDirective = '';
    let startModuleNumber = 7;

    if (tier === 'menengah') {
      startModuleNumber = 7;
      focusDirective = `
Topik untuk 2 Modul Tingkat Menengah:
- Modul #7: Defensive Riding Lanjutan, Titik Buta (Blind Spot) Truk/Bus Besar, dan Pengendalian Jarak Pengereman Dinamis (Prinsip 4 Detik saat Hujan).
- Modul #8: Navigasi Persimpangan Rumit, Perilaku Jalur Cepat Jalan Tol & Arteri, serta Penanganan Road Rage & Emosi Pengendara.
      `;
    } else if (tier === 'lanjutan') {
      startModuleNumber = 9;
      focusDirective = `
Topik untuk 2 Modul Tingkat Lanjutan:
- Modul #9: Teknik Pengereman Darurat (Threshold & Cadence Braking), Kontrol Selip (Understeer/Oversteer), dan Manajemen Risiko Konvoi/Touring.
- Modul #10: Bedah Yurisprudensi Hukum Laka Lantas (UU 22/2009 Pasal 310 & 311), Rekonstruksi TKP Kecelakaan, dan Aspek Pidana Kelalaian Berat.
      `;
    } else {
      startModuleNumber = 10 + (batchIndex * 2) - 1;
      focusDirective = `
Topik untuk 2 Modul Mode Berkelanjutan (Batch #${batchIndex}):
- Modul #${startModuleNumber}: Keselamatan Kendaraan Listrik (EV Fire Safety & Silent Vehicle Hazard) dan Etika Sistem Otomasi ADAS.
- Modul #${startModuleNumber + 1}: Standar Keselamatan Lalu Lintas Terpadu Masa Depan (Smart Mobility, ETLE Nasional Generasi Terbaru, dan Mitigasi Fatalitas Nol/Vision Zero).
      `;
    }

    const prompt = `
Kamu adalah Sistem Kurikulum Cerdas Korlantas POLRI untuk Aplikasi "Go Lantas".
Tugasmu adalah menghasilkan data JSON LENGKAP dan VALID untuk 2 modul pembelajaran ${tierName} beserta kuis evaluasinya.

PANDUAN MATERI:
${focusDirective}

PERSYARATAN STRUKTUR JSON (WAJIB DIPATUHI):
Kembalikan HANYA format JSON murni (tanpa teks pembuka atau penutup) dengan struktur:
{
  "modules": [
    {
      "id": "modul_${tier}_${startModuleNumber}",
      "nomor": ${startModuleNumber},
      "judul": "Judul Modul Lengkap",
      "deskripsi": "Deskripsi mendalam materi modul ini (2-3 kalimat).",
      "icon_name": "ShieldCheck", // Pilih dari: ShieldCheck, AlertTriangle, Brain, Layers, Compass, Zap
      "warna": "${tierConfig.warna}",
      "durasi_estimasi": "14 Menit",
      "tier": "${tier}",
      "passing_grade": ${passingGrade},
      "bonus_points": {
        "first_pass": ${bonusPoints.first_pass},
        "repeat_pass": ${bonusPoints.repeat_pass},
        "fail": ${bonusPoints.fail}
      },
      "is_ai_generated": true,
      "batch_index": ${batchIndex},
      "lessons": [
        {
          "id": "les_${tier}_${startModuleNumber}_1",
          "judul": "Judul Materi 1",
          "durasi_menit": 7,
          "youtubeId": "W3_KjT7aP0M", // YouTube video ID referensi edukasi
          "deskripsi": "Deskripsi pembelajaran materi 1",
          "ringkasan": [
            "Poin ringkasan 1 yang padat dan mendalam",
            "Poin ringkasan 2",
            "Poin ringkasan 3",
            "Poin ringkasan 4"
          ],
          "poinPenting": [
            "Poin krusial 1",
            "Poin krusial 2",
            "Poin krusial 3"
          ],
          "hukumTerkait": "UU No. 22/2009 Pasal ..."
        },
        {
          "id": "les_${tier}_${startModuleNumber}_2",
          "judul": "Judul Materi 2",
          "durasi_menit": 7,
          "youtubeId": "k7fVj3Y7T0I",
          "deskripsi": "Deskripsi pembelajaran materi 2",
          "ringkasan": [
            "Poin ringkasan 1",
            "Poin ringkasan 2",
            "Poin ringkasan 3",
            "Poin ringkasan 4"
          ],
          "poinPenting": [
            "Poin krusial 1",
            "Poin krusial 2",
            "Poin krusial 3"
          ],
          "hukumTerkait": "UU No. 22/2009 Pasal ..."
        }
      ],
      "flashcards": [
        {
          "id": "fc_${tier}_${startModuleNumber}_1",
          "judul": "Judul Kartu 1",
          "kategori": "aturan", // 'peringatan' | 'larangan' | 'perintah' | 'petunjuk' | 'marka' | 'aturan'
          "gambar_simbol": "⚠️",
          "arti": "Arti dan Makna Singkat",
          "penjelasan": "Penjelasan detail aturan atau rambu ini.",
          "pasal_hukum": "UU No. 22/2009 Pasal ..."
        },
        {
          "id": "fc_${tier}_${startModuleNumber}_2",
          "judul": "Judul Kartu 2",
          "kategori": "peringatan",
          "gambar_simbol": "🛑",
          "arti": "Arti Singkat",
          "penjelasan": "Penjelasan detail.",
          "pasal_hukum": "UU No. 22/2009 Pasal ..."
        },
        {
          "id": "fc_${tier}_${startModuleNumber}_3",
          "judul": "Judul Kartu 3",
          "kategori": "larangan",
          "gambar_simbol": "⛔",
          "arti": "Arti Singkat",
          "penjelasan": "Penjelasan detail.",
          "pasal_hukum": "UU No. 22/2009 Pasal ..."
        },
        {
          "id": "fc_${tier}_${startModuleNumber}_4",
          "judul": "Judul Kartu 4",
          "kategori": "perintah",
          "gambar_simbol": "🔄",
          "arti": "Arti Singkat",
          "penjelasan": "Penjelasan detail.",
          "pasal_hukum": "UU No. 22/2009 Pasal ..."
        }
      ],
      "kasus": [
        {
          "id": "case_${tier}_${startModuleNumber}_1",
          "judul": "Judul Kasus Nyata di Jalan Raya",
          "skenario": "Deskripsi situasi insiden atau dilema berkendara yang realistis dan menantang.",
          "opsi": [
            {
              "text": "Opsi tindakan keliru atau berisiko",
              "skor_aman": 0,
              "feedback": "Penjelasan mengapa tindakan ini salah dan berisiko tinggi."
            },
            {
              "text": "Opsi tindakan tepat berstandar defensive driving Korlantas",
              "skor_aman": 100,
              "feedback": "Penjelasan mengapa ini adalah tindakan yang paling aman dan taat hukum."
            },
            {
              "text": "Opsi tindakan kompromi tapi kurang ideal",
              "skor_aman": 30,
              "feedback": "Penjelasan evaluasi tindakan."
            }
          ],
          "analisis_behavioral": "Analisis psikologi/kognitif pengendara saat menghadapi situasi ini.",
          "rekomendasi_korlantas": "Rekomendasi taktis Korlantas Polri untuk mencegah kecelakaan serupa."
        }
      ]
    },
    {
      "id": "modul_${tier}_${startModuleNumber + 1}",
      "nomor": ${startModuleNumber + 1},
      "judul": "Judul Modul Kedua",
      "deskripsi": "Deskripsi modul kedua...",
      "icon_name": "Brain",
      "warna": "${tierConfig.warna}",
      "durasi_estimasi": "14 Menit",
      "tier": "${tier}",
      "passing_grade": ${passingGrade},
      "bonus_points": {
        "first_pass": ${bonusPoints.first_pass},
        "repeat_pass": ${bonusPoints.repeat_pass},
        "fail": ${bonusPoints.fail}
      },
      "is_ai_generated": true,
      "batch_index": ${batchIndex},
      "lessons": [ ... ], // 2 LessonItem
      "flashcards": [ ... ], // 4 FlashcardItem
      "kasus": [ ... ] // 1 CaseStudyItem
    }
  ],
  "quizzes": {
    "modul_${tier}_${startModuleNumber}": [
      {
        "id": "q_${tier}_${startModuleNumber}_1",
        "level": 3,
        "kategori": "etika",
        "pertanyaan": "Pertanyaan kuis tingkat tinggi nomor 1?",
        "opsi": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
        "jawaban_benar": 1, // index 0, 1, 2, atau 3
        "poin": ${pointPerQ},
        "penjelasan": "Pembahasan ilmiah dan taktis mengapa jawaban ini benar.",
        "pasal_hukum": "UU No. 22/2009 Pasal ..."
      },
      // ... 4 soal berikutnya (total 5 soal per modul)
    ],
    "modul_${tier}_${startModuleNumber + 1}": [
      // ... 5 soal untuk modul kedua
    ]
  }
}
`;

    const requestedModel = (typeof window !== 'undefined' && localStorage.getItem(AI_STORAGE_KEYS.MODEL)) || DEFAULT_AI_MODEL;
    const candidateModels = Array.from(new Set([requestedModel, 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-1.5-flash']));

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
        const requestBody = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          console.warn(`[CurriculumAI] Model ${model} returned HTTP ${response.status}. Trying next candidate...`);
          continue;
        }

        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawJsonText) {
          continue;
        }

        // Clean any potential markdown wrapper
        const cleanedText = rawJsonText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        const parsed = JSON.parse(cleanedText);

        if (!parsed.modules || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
          console.warn('[CurriculumAI] Parsed JSON missing modules array');
          continue;
        }

        const modules: ModuleData[] = parsed.modules.map((m: any, idx: number) => ({
          id: m.id || `modul_${tier}_${startModuleNumber + idx}`,
          nomor: m.nomor || (startModuleNumber + idx),
          judul: m.judul || `Modul ${tierName} #${idx + 1}`,
          deskripsi: m.deskripsi || 'Materi kurikulum terstruktur Korlantas POLRI.',
          icon_name: m.icon_name || 'ShieldCheck',
          warna: m.warna || tierConfig.warna,
          durasi_estimasi: m.durasi_estimasi || '14 Menit',
          tier,
          passing_grade: passingGrade,
          bonus_points: bonusPoints,
          is_ai_generated: true,
          batch_index: batchIndex,
          lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
            id: l.id || `les_${tier}_${startModuleNumber + idx}_${lIdx + 1}`,
            judul: l.judul || `Topik ${lIdx + 1}`,
            durasi_menit: l.durasi_menit || 7,
            youtubeId: l.youtubeId || 'W3_KjT7aP0M',
            deskripsi: l.deskripsi || '',
            ringkasan: l.ringkasan || [],
            poinPenting: l.poinPenting || [],
            hukumTerkait: l.hukumTerkait || 'UU No. 22 Tahun 2009',
          })),
          flashcards: (m.flashcards || []).map((f: any, fIdx: number) => ({
            id: f.id || `fc_${tier}_${startModuleNumber + idx}_${fIdx + 1}`,
            judul: f.judul || `Kartu #${fIdx + 1}`,
            kategori: f.kategori || 'aturan',
            gambar_simbol: f.gambar_simbol || '⚠️',
            arti: f.arti || '',
            penjelasan: f.penjelasan || '',
            pasal_hukum: f.pasal_hukum || 'UU No. 22/2009',
          })),
          kasus: (m.kasus || []).map((k: any, kIdx: number) => ({
            id: k.id || `case_${tier}_${startModuleNumber + idx}_${kIdx + 1}`,
            judul: k.judul || 'Studi Kasus Keselamatan',
            skenario: k.skenario || '',
            opsi: k.opsi || [],
            analisis_behavioral: k.analisis_behavioral || '',
            rekomendasi_korlantas: k.rekomendasi_korlantas || '',
          })),
        }));

        const quizzes: Record<string, QuizQuestion[]> = parsed.quizzes || {};

        // Persist generated modules and quizzes
        for (const mod of modules) {
          const modQuestions = quizzes[mod.id] || [];
          await firestoreService.saveExtraModule(uid, mod, modQuestions);
        }

        return {
          success: true,
          modules,
          quizzes,
        };
      } catch (err) {
        console.warn(`[CurriculumAI] Error parsing response from model ${model}:`, err);
      }
    }

    return {
      success: false,
      error: `Gagal memuat modul pembelajaran untuk ${tierName}. Pastikan koneksi internet dan API key Anda aktif.`,
    };
  }
}

export const curriculumAiService = new CurriculumAiService();
