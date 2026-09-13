import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle, Sparkles, Play, ShieldAlert, Award } from 'lucide-react';
import { TabType } from './BottomNavBar';
import { sound } from '../services/sound';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenRobotChat?: () => void;
}

interface DemoStep {
  id: number;
  title: string;
  tab: TabType;
  speakerScript: string;
  keyPoints: string[];
  actionLabel?: string;
  triggerAction?: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateTab,
  onOpenRobotChat 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: '1. Pengantar & Beranda SIGAP',
      tab: 'beranda',
      speakerScript: '"Dewan Juri yang terhormat, inilah SIGAP — prototipe aplikasi terpadu pendukung naskah LKTI Korlantas Polri 2026. Di halaman Beranda, pelajar langsung disambut pengingat keselamatan, streak kuis harian, dan ringkasan kondisi jalan Kabupaten Banyuwangi."',
      keyPoints: [
        'Membuktikan kelayakan implementasi (bobot 25%)',
        'Struktur data 100% selaras dengan skema Firestore TSD §4',
        'Offline-capable dan tidak memerlukan registrasi berbayar'
      ],
      actionLabel: 'Lihat Beranda',
      triggerAction: () => onNavigateTab('beranda'),
    },
    {
      id: 2,
      title: '2. Kuis SIM & Gamifikasi Berjenjang',
      tab: 'kuis',
      speakerScript: '"Fitur Kuis SIM menghadirkan 4 level bertema (Rambu, Marka, Etika, Darurat). Ketika pengguna menjawab benar, poin bertambah, pembahasan pasal UU 22/2009 ditampilkan, dan peringkat di Leaderboard sekolah/kampus langsung naik secara real-time."',
      keyPoints: [
        'Tantangan harian & sistem streak untuk retensi pengguna muda',
        'Pembahasan edukatif berbasis pasal UU No. 22/2009',
        'Leaderboard dinamis per sekolah (SMAN 1 Giri) dan kampus (Poliwangi)'
      ],
      actionLabel: 'Buka Kuis SIM & Leaderboard',
      triggerAction: () => onNavigateTab('kuis'),
    },
    {
      id: 3,
      title: '3. Robot AI Maskot Si SIGAP',
      tab: 'beranda',
      speakerScript: '"Kami mengintegrasikan Robot AI Si SIGAP dengan LLM Gemini + Rule-based fallback. Robot telah diinjeksi konteks lokal lalu lintas Banyuwangi (Jl. Gajah Mada, Simpang Lima, Ketapang), info simulasi kecelakaan, dan basis pengetahuan Korlantas Polri."',
      keyPoints: [
        'Bisa dicoba langsung via suggestion chip pertanyaan instan',
        'Dual-engine: Gemini API (Google AI Studio) + Offline Rule-based fallback',
        'Slot gambar maskot di public/mascot/mascot.svg yang mudah dikustomisasi'
      ],
      actionLabel: 'Buka Chat Si SIGAP',
      triggerAction: () => {
        onNavigateTab('beranda');
        if (onOpenRobotChat) onOpenRobotChat();
      },
    },
    {
      id: 4,
      title: '4. SOS No-Contact 110 (Aksi 3 Detik)',
      tab: 'sos',
      speakerScript: '"Pada situasi darurat laka atau bahaya di jalan raya, korban menahan tombol SOS selama 3 detik untuk mencegah false alarm. Sistem merekam titik GPS browser, mencatat ke log sos_alerts, dan langsung membuka sambungan ke Layanan 110 Polri."',
      keyPoints: [
        'Hold-3-seconds countdown mencegah alarm palsu',
        'Browser Geolocation API menangkap koordinat presisi',
        'Tercatat otomatis di database log sos_alerts'
      ],
      actionLabel: 'Uji Fitur SOS 110',
      triggerAction: () => onNavigateTab('sos'),
    },
    {
      id: 5,
      title: '5. Peta Kemacetan & Rute Aman Banyuwangi',
      tab: 'peta',
      speakerScript: '"Peta interaktif berbasis Leaflet (bebas API key) menyajikan titik kemacetan di Banyuwangi tersimulasi per jam (Pagi 07:00, Siang, Sore, Malam), titik insiden, serta rute aman ber-ZOSS untuk pelajar menuju sekolah."',
      keyPoints: [
        'Peta Leaflet dark theme tanpa ketergantungan API key Google Maps berbayar',
        'Filter jam (Pagi/Siang/Sore/Malam) mengubah level kepadatan jalan',
        'Rute aman pelajar yang menghindari titik rawan laka'
      ],
      actionLabel: 'Buka Peta Banyuwangi',
      triggerAction: () => onNavigateTab('peta'),
    },
    {
      id: 6,
      title: '6. Pemantauan Orang Tua (Consent-First UU PDP)',
      tab: 'keluarga',
      speakerScript: '"Fitur pemantauan keluarga dibangun atas asas persetujuan dua arah sesuai UU Perlindungan Data Pribadi (PDP). Orang tua memasukkan kode pairing, anak memberikan izin di aplikasinya, dan anak bisa mencabut izin pemantauan kapan saja."',
      keyPoints: [
        'Kode pairing 6-digit (misal: SGP-8821)',
        'Lokasi hanya dibagikan saat status "Disetujui"',
        'Audit trail log akses transparan + tombol Cabut Izin instan'
      ],
      actionLabel: 'Buka Pemantauan Keluarga',
      triggerAction: () => onNavigateTab('keluarga'),
    },
    {
      id: 7,
      title: '7. Profil & Konfigurasi Gemini API Key',
      tab: 'profil',
      speakerScript: '"Di menu Profil, pengguna dapat melihat statistik akurasi belajar, progres jalur SIM, riwayat SOS, serta form input Gemini API Key yang tersimpan aman di localStorage browser."',
      keyPoints: [
        'Statistik akurasi kuis dan riwayat laporan',
        'Form API Key Google AI Studio langsung aktif tanpa rebuild',
        'Tombol reset database untuk demonstrasi berulang'
      ],
      actionLabel: 'Buka Tab Profil',
      triggerAction: () => onNavigateTab('profil'),
    },
  ];

  const currentStep = demoSteps[currentStepIndex];

  const handleNext = () => {
    sound.playClick();
    if (currentStepIndex < demoSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      demoSteps[nextIdx].triggerAction?.();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      demoSteps[prevIdx].triggerAction?.();
    }
  };

  const handleExecuteAction = () => {
    sound.playClick();
    currentStep.triggerAction?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-2xl p-5 border border-amber-500/40 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-extrabold text-white flex items-center gap-1.5">
                Panduan Presentasi Demo Juri LKTI
              </h2>
              <p className="text-[10px] text-amber-300/80 font-medium">
                Langkah {currentStep.id} dari {demoSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto py-2.5 no-scrollbar">
          {demoSteps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                sound.playClick();
                setCurrentStepIndex(idx);
                step.triggerAction?.();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                currentStepIndex === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Step {step.id}
            </button>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="my-2 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {currentStep.title}
            </h3>
          </div>

          {/* Script Box */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
              🎙️ Skrip Presenter (Bisa Dibaca Langsung):
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              {currentStep.speakerScript}
            </p>
          </div>

          {/* Key Bullet Points */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ⭐ Poin Penilaian Dewan Juri:
            </span>
            {currentStep.keyPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button & Next/Prev Navigation */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          {currentStep.actionLabel && (
            <button
              onClick={handleExecuteAction}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {currentStep.actionLabel} & Tutup Panduan
            </button>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                currentStepIndex === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Sebelumnya
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === demoSteps.length - 1}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                currentStepIndex === demoSteps.length - 1
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
              }`}
            >
              Selanjutnya
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
