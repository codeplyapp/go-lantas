import React, { useRef, useEffect, useState } from 'react';
import { 
  Award, Download, Lock, CheckCircle2, ShieldCheck, 
  ChevronLeft, Check, Sparkles, Zap, Layers 
} from 'lucide-react';
import { CertificateData, ModuleData, UserProfile, ModuleProgress, CurriculumTier } from '../../../core/types';
import { ALL_MODULES } from '../../../data/modules';
import { CURRICULUM_TIERS, TIERS_LIST } from '../../../data/tiers';
import { sound } from '../../../shared/services/sound';

interface CertificateProps {
  onBack: () => void;
  onOpenModule?: (moduleId: string) => void;
  profile?: UserProfile | null;
  progressMap?: Record<string, ModuleProgress>;
  allModules?: ModuleData[];
}

interface TierCertTheme {
  title: string;
  subTitle: string;
  description: string;
  primaryColor: string;
  gradientColors: [string, string, string];
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badges: string[];
  certPrefix: string;
}

const TIER_CERT_THEMES: Record<CurriculumTier, TierCertTheme> = {
  dasar: {
    title: 'SERTIFIKAT KELULUSAN TINGKAT DASAR',
    subTitle: 'Pelopor Keselamatan Jalan Raya Dasar Nasional',
    description: 'Atas keberhasilan menuntaskan seluruh 6 Modul Kurikulum Edukasi Keselamatan Lalu Lintas Dasar dan dinyatakan LULUS sebagai Duta Pelopor Keselamatan Jalan Raya Nasional GO Lantas.',
    primaryColor: '#0077C0',
    gradientColors: ['#005fa3', '#0077c0', '#0284c7'],
    badgeBg: '#F0FDF4',
    badgeBorder: '#86EFAC',
    badgeText: '#166534',
    badges: ['Rambu', 'Marka', 'Etika', 'Regulasi UU', 'Defensive', 'Darurat'],
    certPrefix: 'DASAR',
  },
  menengah: {
    title: 'SERTIFIKAT KELULUSAN TINGKAT MENENGAH',
    subTitle: 'Pelopor Defensive Riding & Navigasi Risiko Dinamis',
    description: 'Atas kompetensi penguasaan teknik berkendara defensif, pengendalian titik buta armada berat, navigasi persimpangan kompleks, dan mitigasi risiko perilaku jalan raya.',
    primaryColor: '#059669',
    gradientColors: ['#047857', '#059669', '#10B981'],
    badgeBg: '#ECFDF5',
    badgeBorder: '#6EE7B7',
    badgeText: '#065F46',
    badges: ['Defensive', 'Blind Spot', 'Navigasi Simpang', 'Road Ethics'],
    certPrefix: 'MENENGAH',
  },
  lanjutan: {
    title: 'SERTIFIKAT KELULUSAN TINGKAT LANJUTAN',
    subTitle: 'Mastery Keselamatan & Rekonstruksi Hukum Lalu Lintas',
    description: 'Atas pencapaian tingkat tertinggi dalam penguasaan teknik pengereman darurat tingkat lanjut (threshold/cadence), kendali selip kendaraan, dan pemahaman yurisprudensi hukum LLAJ Korlantas POLRI.',
    primaryColor: '#7C3AED',
    gradientColors: ['#6D28D9', '#7C3AED', '#A855F7'],
    badgeBg: '#FAF5FF',
    badgeBorder: '#D8B4FE',
    badgeText: '#581C87',
    badges: ['Threshold Brake', 'Slip Control', 'Hukum Laka', 'Mastery'],
    certPrefix: 'LANJUTAN',
  },
  berkelanjutan: {
    title: 'SERTIFIKAT DUTA KESELAMATAN BERKELANJUTAN',
    subTitle: 'Inovasi Mobilitas Cerdas & Edukasi Masa Depan',
    description: 'Atas dedikasi berkelanjutan dalam mengikuti perkembangan teknologi mobilitas baru (Electric Vehicle, ADAS, Smart Traffic AI) dan mempelopori budaya tertib tanpa batas.',
    primaryColor: '#D97706',
    gradientColors: ['#B45309', '#D97706', '#F59E0B'],
    badgeBg: '#FFFBEB',
    badgeBorder: '#FCD34D',
    badgeText: '#78350F',
    badges: ['EV Safety', 'ADAS Ethics', 'Smart Mobility', 'Vision Zero'],
    certPrefix: 'KONTINU',
  },
};

export const Certificate: React.FC<CertificateProps> = ({
  onBack,
  onOpenModule,
  profile,
  progressMap = {},
  allModules = ALL_MODULES,
}) => {
  const [selectedTier, setSelectedTier] = useState<CurriculumTier>('dasar');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = TIER_CERT_THEMES[selectedTier];
  const tierConfig = CURRICULUM_TIERS[selectedTier];

  // Modules for currently selected tier
  const tierModules = allModules.filter((m) => (m.tier || 'dasar') === selectedTier);
  const passedModulesCount = tierModules.filter((m) => progressMap[m.id]?.kuis_passed).length;
  const targetRequired = tierConfig.totalModulesRequired || tierModules.length || 1;

  // Check eligibility for selected tier
  useEffect(() => {
    const eligible = tierModules.length >= targetRequired && passedModulesCount >= targetRequired;
    setIsEligible(eligible);

    if (eligible && profile) {
      const year = new Date().getFullYear();
      const uidHash = (profile.uid || 'USER').substring(0, 6).toUpperCase();
      setCertData({
        id: `cert_${selectedTier}_${profile.uid}_${Date.now()}`,
        uid: profile.uid,
        tier: selectedTier,
        tier_name: tierConfig.nama,
        nama_penerima: profile.nama,
        nomor_sertifikat: `SGP/KORLANTAS/${theme.certPrefix}/${year}/${uidHash}`,
        tanggal_terbit: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        skor_rata_rata: 92,
        sekolah_instansi: profile.sekolah_kampus || 'Pelajar Keselamatan Indonesia',
        qr_data: `SIGAP-VERIFIED-${selectedTier.toUpperCase()}-${profile.uid}-${Date.now()}`,
      });
    } else {
      setCertData(null);
    }
  }, [selectedTier, passedModulesCount, tierModules.length, targetRequired, profile, theme.certPrefix, tierConfig.nama]);

  // Draw Certificate on HTML5 Canvas
  useEffect(() => {
    if (!certData || !canvasRef.current || !isEligible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width; // 1200
    const H = canvas.height; // 850

    // 1. Background Fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // 2. Outer Gradient Border
    const borderGrad = ctx.createLinearGradient(0, 0, W, H);
    borderGrad.addColorStop(0, theme.gradientColors[0]);
    borderGrad.addColorStop(0.5, theme.gradientColors[1]);
    borderGrad.addColorStop(1, theme.gradientColors[2]);

    ctx.lineWidth = 14;
    ctx.strokeStyle = borderGrad;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner thin border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#D1D5DB';
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // Corner decorative brackets
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = theme.primaryColor;
      ctx.fillRect(0, 0, 40, 4);
      ctx.fillRect(0, 0, 4, 40);
      ctx.restore();
    };

    drawCorner(44, 44, 0);
    drawCorner(W - 44, 44, Math.PI / 2);
    drawCorner(W - 44, H - 44, Math.PI);
    drawCorner(44, H - 44, -Math.PI / 2);

    // 3. Watermark Emblem
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = theme.primaryColor;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 30, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Header Titles
    ctx.textAlign = 'center';

    // Institution Name
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('KORPS LALU LINTAS KEPOLISIAN NEGARA REPUBLIK INDONESIA', W / 2, 90);

    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('DIREKTORAT KEAMANAN DAN KESELAMATAN (DITKAMSEL KORLANTAS POLRI)', W / 2, 115);

    // Certificate Title
    ctx.font = 'bold 34px Inter, system-ui, sans-serif';
    ctx.fillStyle = theme.primaryColor;
    ctx.fillText(theme.title, W / 2, 180);

    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Nomor Registrasi: ${certData.nomor_sertifikat}`, W / 2, 210);

    // 5. Body Text
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Diberikan secara resmi kepada:', W / 2, 265);

    // Recipient Name
    ctx.font = 'bold 34px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(certData.nama_penerima.toUpperCase(), W / 2, 320);

    // Underline below name
    ctx.strokeStyle = theme.primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 250, 335);
    ctx.lineTo(W / 2 + 250, 335);
    ctx.stroke();

    // Institution / School
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(profile?.sekolah_kampus || 'Pelajar Keselamatan Indonesia', W / 2, 365);

    // Description text
    ctx.font = '15px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(theme.description.substring(0, 95), W / 2, 420);
    ctx.fillText(theme.description.substring(95), W / 2, 445);

    // 6. Badges Grid
    const badges = theme.badges;
    ctx.font = '12px Inter, system-ui, sans-serif';
    const totalBadges = badges.length;
    const spacing = Math.min(130, Math.floor(700 / totalBadges));
    const startX = W / 2 - ((totalBadges - 1) * spacing) / 2;

    badges.forEach((modName, idx) => {
      const posX = startX + idx * spacing;
      const posY = 515;

      ctx.fillStyle = theme.badgeBg;
      ctx.strokeStyle = theme.badgeBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(posX - 50, posY - 20, 100, 34, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.badgeText;
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText(`✓ ${modName}`, posX, posY);
    });

    // 7. Footer Signatures
    ctx.textAlign = 'left';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`Diterbitkan pada: ${certData.tanggal_terbit}`, 100, 680);
    ctx.fillText(`Status: Terakreditasi Sistem GO Lantas POLRI (${tierConfig.nama})`, 100, 700);

    // Right: Signature Box
    ctx.textAlign = 'center';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Jakarta, Republik Indonesia', W - 220, 650);

    ctx.font = 'italic bold 18px Georgia, serif';
    ctx.fillStyle = theme.primaryColor;
    ctx.fillText('Korlantas POLRI', W - 220, 700);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W - 320, 715);
    ctx.lineTo(W - 120, 715);
    ctx.stroke();

    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('TIM PEMBINA KESELAMATAN JALAN', W - 220, 735);

    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Korps Lalu Lintas POLRI', W - 220, 755);

  }, [certData, isEligible, profile, selectedTier, theme, tierConfig.nama]);

  // Handle Download PNG
  const handleDownloadPNG = () => {
    if (!canvasRef.current || !certData) return;
    sound.playClick();
    setDownloading(true);

    setTimeout(() => {
      const canvas = canvasRef.current!;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Sertifikat-GOLantas-${theme.certPrefix}-${certData.nomor_sertifikat.replace(/\//g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      sound.playSuccess();
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-8">
      {/* Header Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 btn-press transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Belajar</span>
        </button>
        <span className="text-xs font-extrabold text-slate-700">Sertifikat Kelulusan Tiap Tingkat</span>
      </div>

      {/* Tier Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        {TIERS_LIST.map((tier) => {
          const tMods = allModules.filter((m) => (m.tier || 'dasar') === tier.id);
          const pCount = tMods.filter((m) => progressMap[m.id]?.kuis_passed).length;
          const req = tier.totalModulesRequired;
          const tierEligible = tMods.length >= req && pCount >= req;
          const isSelected = selectedTier === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => {
                sound.playClick();
                setSelectedTier(tier.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 btn-press ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tierEligible ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Sertifikat {tier.nama}</span>
              {tierEligible ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Terbit ✓
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-500 font-medium">
                  {pCount}/{req}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isEligible && certData ? (
        /* --- ELIGIBLE STATE: SHOW CERTIFICATE & DOWNLOAD BUTTON --- */
        <div className="space-y-5">
          <div className="p-5 sm:p-6 rounded-[24px] apple-card bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Sertifikat {tierConfig.nama} Terbit & Terverifikasi
                </span>
                <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                  {theme.subTitle}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Selamat! Anda telah menuntaskan seluruh modul kurikulum {tierConfig.nama} standar Korlantas POLRI.
                </p>
              </div>

              <button
                onClick={handleDownloadPNG}
                disabled={downloading}
                className="px-5 py-3 rounded-xl bg-[#0077C0] hover:bg-[#005fa3] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all btn-press shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Memproses Unduhan...' : `Unduh Sertifikat ${tierConfig.badge} (PNG)`}</span>
              </button>
            </div>

            {/* Canvas Certificate Preview */}
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-4 flex justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={1200}
                height={850}
                className="w-full max-w-[700px] h-auto rounded-xl shadow-lg border border-slate-300"
              />
            </div>

            {/* Certificate Details Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-bold block text-[10.5px] uppercase tracking-wide">Nomor Registrasi</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{certData.nomor_sertifikat}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-bold block text-[10.5px] uppercase tracking-wide">Tanggal Terbit</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{certData.tanggal_terbit}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-bold block text-[10.5px] uppercase tracking-wide">Penerbit Resmi</span>
                <span className="font-extrabold text-[#0077c0] text-xs sm:text-sm">Ditkamsel Korlantas POLRI</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- LOCKED STATE: SHOW CHECKLIST TO UNLOCK --- */
        <div className="space-y-4">
          <div className="p-6 sm:p-8 rounded-[24px] apple-card bg-white border border-[#E5EBE8] text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A]">
                Sertifikat {tierConfig.nama} Masih Terkunci
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
                Selesaikan dan lulus kuis evaluasi pada seluruh modul {tierConfig.nama} untuk mengklaim sertifikat resmi Korlantas POLRI.
              </p>
            </div>

            {/* Progress Bar towards unlocking */}
            <div className="max-w-md mx-auto space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Progres Modul {tierConfig.nama}</span>
                <span className="text-[#0077C0]">{passedModulesCount} / {targetRequired} Modul</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (passedModulesCount / Math.max(1, targetRequired)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module checklist for this tier */}
          <div className="p-5 rounded-[22px] apple-card bg-white border border-[#E5EBE8] space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              Syarat Kelulusan Modul {tierConfig.nama}
            </h3>

            {tierModules.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-xl border border-slate-200">
                Modul {tierConfig.nama} belum dibuat. Buka tab <strong>Kurikulum Modul</strong> untuk menghasilkan modul AI tingkat ini.
              </p>
            ) : (
              <div className="space-y-2">
                {tierModules.map((mod: ModuleData) => {
                  const isPassed = progressMap[mod.id]?.kuis_passed;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        if (onOpenModule) onOpenModule(mod.id);
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isPassed
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200/80 hover:border-[#0077c0] text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                          isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isPassed ? <Check className="w-4 h-4" /> : mod.nomor}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold leading-snug">
                            {mod.judul}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {isPassed ? `Lulus Kuis (Skor: ${progressMap[mod.id]?.kuis_best}%)` : `Kuis belum lulus (Passing ${mod.passing_grade || tierConfig.passingGrade}%)`}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#0077c0] shrink-0">
                        {isPassed ? 'Selesai ✓' : 'Buka Modul →'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
