import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, FileText, Trophy, Award, ChevronRight 
} from 'lucide-react';
import { ModuleData, ModuleProgress, UserProfile, QuizQuestion, CurriculumTier } from '../../core/types';
import { ALL_MODULES } from '../../data/modules';
import { CURRICULUM_TIERS } from '../../data/tiers';
import { firestoreService } from '../../services/firestore';
import { curriculumAiService } from '../../services/curriculumAi';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';
import confetti from 'canvas-confetti';

import { ModuleList } from './modules/ModuleList';
import { ModuleDetail } from './modules/ModuleDetail';
import { SimulasiUjian } from './exam/SimulasiUjian';
import { Leaderboard } from './leaderboard/Leaderboard';
import { Certificate } from './sertifikat/Certificate';

type BelajarSubTab = 'modules' | 'exam' | 'leaderboard' | 'certificate';

interface BelajarPageProps {
  profile?: UserProfile | null;
}

export const BelajarPage: React.FC<BelajarPageProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<BelajarSubTab>('modules');
  const [activeTier, setActiveTier] = useState<CurriculumTier>('dasar');
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({});
  const [extraModules, setExtraModules] = useState<ModuleData[]>([]);
  const [extraQuizzes, setExtraQuizzes] = useState<Record<string, QuizQuestion[]>>({});

  const [isGeneratingTier, setIsGeneratingTier] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Load user's saved module progress, extra modules, and extra quizzes from Firestore/Cache
  useEffect(() => {
    if (profile?.uid) {
      // 1. Module Progress
      firestoreService.getModuleProgress(profile.uid).then((progressList) => {
        if (progressList && progressList.length > 0) {
          const map: Record<string, ModuleProgress> = {};
          progressList.forEach((p) => {
            map[p.moduleId] = p;
          });
          setProgressMap((prev) => ({ ...prev, ...map }));
        }
      }).catch((err) => {
        console.warn('[BelajarPage] Error loading module progress:', err);
      });

      // 2. Extra Modules
      firestoreService.getExtraModules(profile.uid).then((mods) => {
        if (mods && mods.length > 0) {
          setExtraModules(mods);
        }
      }).catch((err) => {
        console.warn('[BelajarPage] Error loading extra modules:', err);
      });

      // 3. Extra Quizzes
      firestoreService.getExtraModuleQuizzes(profile.uid).then((quizzes) => {
        if (quizzes && Object.keys(quizzes).length > 0) {
          setExtraQuizzes(quizzes);
        }
      }).catch((err) => {
        console.warn('[BelajarPage] Error loading extra quizzes:', err);
      });
    }
  }, [profile?.uid]);

  // Combine static modules + AI extra modules
  const allModules: ModuleData[] = [...ALL_MODULES, ...extraModules];

  // Tier Completion Calculations
  const passedDasarCount = ALL_MODULES.filter((m) => progressMap[m.id]?.kuis_passed).length;
  const isEligibleCert = passedDasarCount >= ALL_MODULES.length; // Sertifikat = Dasar

  const isMenengahUnlocked = passedDasarCount >= 6;
  const menengahModules = extraModules.filter((m) => m.tier === 'menengah');
  const passedMenengahCount = menengahModules.filter((m) => progressMap[m.id]?.kuis_passed).length;

  const isLanjutanUnlocked = isMenengahUnlocked && passedMenengahCount >= 2;
  const lanjutanModules = extraModules.filter((m) => m.tier === 'lanjutan');
  const passedLanjutanCount = lanjutanModules.filter((m) => progressMap[m.id]?.kuis_passed).length;

  const isContinuousUnlocked = isLanjutanUnlocked && passedLanjutanCount >= 2;
  const continuousModules = extraModules.filter((m) => m.tier === 'berkelanjutan');

  const tierUnlockStates: Record<CurriculumTier, boolean> = {
    dasar: true,
    menengah: isMenengahUnlocked,
    lanjutan: isLanjutanUnlocked,
    berkelanjutan: isContinuousUnlocked,
  };

  // Trigger celebration once per tier unlock
  const triggerUnlockCelebration = useCallback((tierKey: CurriculumTier, tierName: string) => {
    if (typeof window === 'undefined') return;
    const guardKey = `sigap_tier_unlock_${tierKey}`;
    if (localStorage.getItem(guardKey)) return;
    localStorage.setItem(guardKey, 'true');

    sound.playLevelUp();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    NotificationService.sendSystemNotification(
      `🎉 ${tierName} Baru Terbuka! ✨`,
      `Selamat! Anda berhasil membuka kurikulum materi ${tierName}.`
    );
  }, []);

  useEffect(() => {
    if (isMenengahUnlocked) triggerUnlockCelebration('menengah', 'Tingkat Menengah');
    if (isLanjutanUnlocked) triggerUnlockCelebration('lanjutan', 'Tingkat Lanjutan');
    if (isContinuousUnlocked) triggerUnlockCelebration('berkelanjutan', 'Mode Berkelanjutan');
  }, [isMenengahUnlocked, isLanjutanUnlocked, isContinuousUnlocked, triggerUnlockCelebration]);

  // AI Tier Generation Handler
  const handleGenerateTier = useCallback(async (tier: CurriculumTier, isNextBatch = false) => {
    if (tier === 'dasar') return;
    if (!profile?.uid) {
      NotificationService.showInAppToast('Silakan Masuk Akun', 'Masuk akun untuk membuka materi modul.', 'warning');
      return;
    }

    setIsGeneratingTier(true);
    setGenerationError(null);

    const batchIndex = isNextBatch
      ? Math.floor(continuousModules.length / 2) + 1
      : 1;

    try {
      const res = await curriculumAiService.generateTierModules(profile.uid, tier as 'menengah' | 'lanjutan' | 'berkelanjutan', batchIndex);

      if (res.success && res.modules && res.modules.length > 0) {
        sound.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

        setExtraModules((prev) => {
          const newIds = new Set((res.modules || []).map((m) => m.id));
          return prev.filter((m) => !newIds.has(m.id)).concat(res.modules || []);
        });

        if (res.quizzes) {
          setExtraQuizzes((prev) => ({ ...prev, ...res.quizzes }));
        }

        NotificationService.showInAppToast(
          'Kurikulum Pembelajaran Terbit! 🚀',
          `Modul baru untuk ${CURRICULUM_TIERS[tier].nama} berhasil disiapkan dan siap dipelajari.`,
          'success'
        );
      } else {
        setGenerationError(res.error || 'Gagal memuat modul pembelajaran.');
      }
    } catch (err: any) {
      console.warn('[BelajarPage] Generation error:', err);
      setGenerationError(err?.message || 'Terjadi kendala saat memuat kurikulum materi.');
    } finally {
      setIsGeneratingTier(false);
    }
  }, [profile?.uid, continuousModules.length]);

  const handleSelectModule = (module: ModuleData) => {
    setSelectedModule(module);
  };

  const handleBackFromModule = () => {
    setSelectedModule(null);
  };

  const handleProgressUpdated = (updated: ModuleProgress) => {
    setProgressMap((prev) => ({
      ...prev,
      [updated.moduleId]: updated,
    }));
  };

  const handleTabChange = (tab: BelajarSubTab) => {
    sound.playClick();
    setSelectedModule(null);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* 1. Global Belajar Hero & Progress Header */}
      {!selectedModule && (
        <div className="p-5 sm:p-6 rounded-[24px] apple-card bg-white border border-[#E5EBE8] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                  Kurikulum Edukasi & Ujian Teori GO Lantas
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                3 Tingkat Pembelajaran Terstruktur & Evaluasi Interaktif Berstandar Korlantas POLRI.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
              <div className="flex items-center gap-1.5 text-[#0077c0] font-extrabold">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{(profile?.poin_total || 0).toLocaleString('id-ID')} Poin</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-bold">
                {isContinuousUnlocked ? 'Pelopor Utama ⚡' : isLanjutanUnlocked ? 'Tingkat Lanjutan' : isMenengahUnlocked ? 'Tingkat Menengah' : 'Tingkat Dasar'}
              </span>
            </div>
          </div>

          {/* Curriculum Completion Progress Bar */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0077c0]" />
                Progres Kurikulum Tingkat Dasar (Syarat Sertifikat)
              </span>
              <span className="text-[#0077c0] font-extrabold">
                {passedDasarCount} / 6 Modul Lulus
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
              <div 
                className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
                style={{ width: `${(passedDasarCount / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick CTA Shortcut Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div
              onClick={() => handleTabChange('exam')}
              className="p-3.5 rounded-xl border border-[#E5EBE8] bg-white hover:border-[#0077c0] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group btn-press"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0077c0] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#0077c0] transition-colors">
                    Simulasi Ujian Teori SIM
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    20 Soal Acak • Waktu 15 Menit
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0077c0] group-hover:translate-x-0.5 transition-all self-center" />
            </div>

            <div
              onClick={() => handleTabChange('certificate')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group btn-press ${
                isEligibleCert 
                  ? 'border-emerald-200 bg-white hover:border-emerald-500 hover:shadow-xs' 
                  : 'border-[#E5EBE8] bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                  isEligibleCert ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#0077c0] transition-colors">
                    Sertifikat Kelulusan
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isEligibleCert ? 'Sertifikat Dasar & Tingkat Lanjut Tersedia' : 'Tersedia untuk Tiap Tingkat'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all self-center" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Sub-Tabs Navigation */}
      {!selectedModule && (
        <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('modules')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'modules'
                ? 'bg-[#0077c0] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kurikulum Modul</span>
          </button>

          <button
            onClick={() => handleTabChange('exam')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'exam'
                ? 'bg-[#0077c0] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Simulasi Ujian SIM</span>
          </button>

          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-[#0077c0] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Papan Peringkat</span>
          </button>

          <button
            onClick={() => handleTabChange('certificate')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'certificate'
                ? 'bg-[#0077c0] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Sertifikat</span>
          </button>
        </div>
      )}

      {/* 3. Main Body View Routing */}
      {selectedModule ? (
        <ModuleDetail
          module={selectedModule}
          extraQuizzes={extraQuizzes}
          progress={progressMap[selectedModule.id] || {
            moduleId: selectedModule.id,
            tier: selectedModule.tier || 'dasar',
            lessons_done: [],
            kuis_attempts: 0,
            kuis_best: 0,
            kuis_passed: false,
            flashcards_done: [],
            cases_done: [],
            last_study: '',
            total_menit: 0
          }}
          onBack={handleBackFromModule}
          onProgressUpdated={handleProgressUpdated}
        />
      ) : (
        <>
          {activeTab === 'modules' && (
            <ModuleList
              currentTier={activeTier}
              onSelectTier={setActiveTier}
              modules={allModules}
              moduleProgress={progressMap}
              tierUnlockStates={tierUnlockStates}
              isGeneratingTier={isGeneratingTier}
              generationError={generationError}
              onSelectModule={handleSelectModule}
              onRetryGeneration={handleGenerateTier}
              onGenerateNextBatch={() => handleGenerateTier('berkelanjutan', true)}
            />
          )}

          {activeTab === 'exam' && (
            <SimulasiUjian
              onBack={() => handleTabChange('modules')}
              onFinished={() => {
                // progress refreshed via onProgressUpdated from child
              }}
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard profile={profile} />
          )}

          {activeTab === 'certificate' && (
            <Certificate
              profile={profile}
              progressMap={progressMap}
              allModules={allModules}
              onBack={() => handleTabChange('modules')}
              onOpenModule={(modId) => {
                const mod = allModules.find((m) => m.id === modId);
                if (mod) {
                  setActiveTab('modules');
                  if (mod.tier) setActiveTier(mod.tier);
                  setSelectedModule(mod);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
