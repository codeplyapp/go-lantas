import React, { useState } from 'react';
import { 
  BookOpen, Clock, CheckCircle2, ChevronRight, 
  Layers, Brain, Lock, Sparkles, Key, RefreshCw, AlertTriangle, 
  Zap, ShieldCheck, Check, ArrowRight 
} from 'lucide-react';
import { ModuleData, ModuleProgress, CurriculumTier } from '../../../core/types';
import { CURRICULUM_TIERS, TIERS_LIST } from '../../../data/tiers';
import { sound } from '../../../shared/services/sound';
import { getGeminiApiKey, AI_STORAGE_KEYS } from '../../../core/ai-config';

interface ModuleListProps {
  currentTier: CurriculumTier;
  onSelectTier: (tier: CurriculumTier) => void;
  modules: ModuleData[];
  moduleProgress: Record<string, ModuleProgress>;
  tierUnlockStates: Record<CurriculumTier, boolean>;
  isGeneratingTier: boolean;
  generationError: string | null;
  onSelectModule: (module: ModuleData) => void;
  onRetryGeneration: (tier: CurriculumTier) => void;
  onGenerateNextBatch?: () => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  currentTier,
  onSelectTier,
  modules,
  moduleProgress,
  tierUnlockStates,
  isGeneratingTier,
  generationError,
  onSelectModule,
  onRetryGeneration,
  onGenerateNextBatch,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const activeTierConfig = CURRICULUM_TIERS[currentTier];
  const isUnlocked = tierUnlockStates[currentTier];
  const currentTierModules = modules.filter((m) => (m.tier || 'dasar') === currentTier);

  const passedInTierCount = currentTierModules.filter(
    (m) => moduleProgress[m.id]?.kuis_passed
  ).length;

  const isTierComplete =
    currentTierModules.length > 0 &&
    passedInTierCount >= (activeTierConfig.totalModulesRequired || currentTierModules.length);

  const handleSaveApiKey = () => {
    if (!apiKeyInput || apiKeyInput.trim().length === 0) return;
    localStorage.setItem(AI_STORAGE_KEYS.API_KEY, apiKeyInput.trim());
    sound.playSuccess();
    setShowApiKeyModal(false);
    onRetryGeneration(currentTier);
  };

  return (
    <div className="space-y-4">
      {/* 1. Tier Switcher Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        {TIERS_LIST.map((tier) => {
          const unlocked = tierUnlockStates[tier.id];
          const isSelected = currentTier === tier.id;
          const tierMods = modules.filter((m) => (m.tier || 'dasar') === tier.id);
          const passedCount = tierMods.filter((m) => moduleProgress[m.id]?.kuis_passed).length;
          const complete = tierMods.length > 0 && passedCount >= tier.totalModulesRequired;

          return (
            <button
              key={tier.id}
              onClick={() => {
                sound.playClick();
                onSelectTier(tier.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 btn-press ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {!unlocked ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : complete ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : tier.id === 'berkelanjutan' ? (
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#0077c0]" />
              )}
              <span>{tier.nama}</span>
              {complete ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Lulus
                </span>
              ) : !unlocked ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-500 font-medium">
                  Terkunci
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0077c0] font-bold">
                  {passedCount}/{tierMods.length || tier.totalModulesRequired}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Tier Information Banner */}
      <div className="p-4 sm:p-5 rounded-[22px] apple-card bg-white border border-[#E5EBE8] space-y-2 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] flex items-center gap-1.5">
                <span>{activeTierConfig.nama}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-500">{activeTierConfig.subjudul}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeTierConfig.deskripsi}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold shrink-0 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Passing Grade: {activeTierConfig.passingGrade}%
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0077c0]">
              Bonus: +{activeTierConfig.bonusPoints.first_pass} Poin
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Rendering based on State */}
      {!isUnlocked ? (
        /* --- LOCKED TIER VIEW --- */
        <div className="p-8 rounded-[24px] apple-card bg-white border border-[#E5EBE8] text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A]">
              {activeTierConfig.nama} Masih Terkunci
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {currentTier === 'menengah' && 'Selesaikan dan lulus kuis pada seluruh 6 modul Tingkat Dasar untuk membuka kurikulum ini.'}
              {currentTier === 'lanjutan' && 'Selesaikan dan lulus kuis pada seluruh 2 modul Tingkat Menengah untuk membuka materi lanjutan.'}
              {currentTier === 'berkelanjutan' && 'Selesaikan seluruh modul Tingkat Lanjutan untuk membuka mode pembelajaran AI berkelanjutan.'}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              if (currentTier === 'menengah') onSelectTier('dasar');
              else if (currentTier === 'lanjutan') onSelectTier('menengah');
              else if (currentTier === 'berkelanjutan') onSelectTier('lanjutan');
            }}
            className="px-5 py-2.5 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all btn-press"
          >
            <span>Kembali ke Tingkat Sebelumnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : isGeneratingTier ? (
        /* --- AI GENERATING STATE --- */
        <div className="p-10 rounded-[24px] apple-card bg-white border border-[#E5EBE8] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 border-3 border-[#0077c0] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A]">
              Menghasilkan Kurikulum AI {activeTierConfig.nama}...
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              AI Gemini sedang menyusun topik materi terstruktur, kartu flashcard interaktif, studi kasus jalan raya, dan kuis evaluasi standar Korlantas POLRI.
            </p>
          </div>
        </div>
      ) : currentTierModules.length === 0 ? (
        /* --- NO MODULES GENERATED YET / API KEY REQUIRED STATUS CARD --- */
        <div className="p-6 sm:p-8 rounded-[24px] apple-card bg-white border border-amber-200/90 space-y-4 shadow-xs text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Key className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#0F172A]">
              Aktifkan Gemini API key untuk membuka {activeTierConfig.nama}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Materi {activeTierConfig.nama} di-generate secara dinamis oleh Gemini AI untuk menyajikan kasus nyata, simulasi behavioral driving, dan kuis adaptif.
            </p>
            {generationError && (
              <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                {generationError}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-sm mx-auto">
            <button
              onClick={() => {
                sound.playClick();
                onRetryGeneration(currentTier);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all btn-press"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowApiKeyModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all btn-press"
            >
              <Key className="w-4 h-4" />
              <span>Input Gemini API Key</span>
            </button>
          </div>
        </div>
      ) : (
        /* --- MODULES GRID --- */
        <div className="space-y-4">
          {currentTier === 'berkelanjutan' && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Mode Berkelanjutan Aktif ({currentTierModules.length} Modul)</span>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  if (onGenerateNextBatch) onGenerateNextBatch();
                }}
                disabled={isGeneratingTier}
                className="px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all btn-press"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buat Set Modul AI Baru</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {currentTierModules.map((mod) => {
              const progress = moduleProgress[mod.id] || {
                moduleId: mod.id,
                lessons_done: [],
                kuis_attempts: 0,
                kuis_best: 0,
                kuis_passed: false,
                flashcards_done: [],
                cases_done: [],
                last_study: '',
                total_menit: 0,
              };

              const totalLessons = mod.lessons.length;
              const completedLessons = progress.lessons_done.length;
              const isPassed = progress.kuis_passed;
              const percentDone = Math.round(
                ((completedLessons + (isPassed ? 1 : 0)) / (totalLessons + 1)) * 100
              );

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectModule(mod);
                  }}
                  className="p-5 rounded-[22px] apple-card bg-white border border-[#E5EBE8] hover:border-[#0077c0] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group btn-press"
                >
                  {/* Header: Module Number & Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#0077c0] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0077c0]"></span>
                          Modul #{mod.nomor}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {mod.durasi_estimasi}
                        </span>
                      </div>

                      {isPassed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lulus ({progress.kuis_best}%)
                        </span>
                      ) : completedLessons > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Berjalan ({percentDone}%)
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Belum Mulai
                        </span>
                      )}
                    </div>

                    {/* Title and Subtitle */}
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] group-hover:text-[#0077C0] transition-colors leading-snug">
                        {mod.judul}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">
                        {mod.deskripsi}
                      </p>
                    </div>
                  </div>

                  {/* Module Content Badges & Mini Progress */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#0077c0]" />
                        {totalLessons} Materi
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        {mod.flashcards.length} Flashcard
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-500" />
                        {mod.kasus.length} Kasus
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentDone}%` }}
                      />
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-[#0077C0] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        {isPassed ? 'Ulangi / Review Modul' : completedLessons > 0 ? 'Lanjutkan Modul' : 'Mulai Belajar'}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-600">
                        +{mod.bonus_points?.first_pass || activeTierConfig.bonusPoints.first_pass} Poin
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API Key Configuration Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[24px] p-6 apple-card border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#0077c0]" />
                <span>Pengaturan Gemini API Key</span>
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Masukkan Gemini API Key dari Google AI Studio untuk mengaktifkan generator modul kurikulum AI tingkat Menengah, Lanjutan, dan Mode Berkelanjutan.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Gemini API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#0077c0] focus:ring-2 focus:ring-blue-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="px-5 py-2 rounded-full bg-[#0077c0] hover:bg-[#008be0] text-white text-xs font-extrabold shadow-xs transition-all disabled:opacity-50"
              >
                Simpan & Generate Modul
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
