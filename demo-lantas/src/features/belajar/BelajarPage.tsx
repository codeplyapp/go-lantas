import React, { useState } from 'react';
import { 
  BookOpen, FileText, Trophy, Award, CheckCircle2, 
  TrendingUp, Clock, ShieldCheck, ChevronRight, Layers, Play 
} from 'lucide-react';
import { ModuleData, ModuleProgress, UserProfile } from '../../core/types';
import { ALL_MODULES } from '../../data/modules';
import { sound } from '../../shared/services/sound';

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
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({});

  // Compute total curriculum progress
  const totalModules = ALL_MODULES.length;
  const passedModules = ALL_MODULES.filter((m: ModuleData) => progressMap[m.id]?.kuis_passed).length;
  const isEligibleCert = passedModules >= ALL_MODULES.length;

  const handleSelectModule = (module: ModuleData) => {
    setSelectedModule(module);
  };

  const handleBackFromModule = () => {
    setSelectedModule(null);
  };

  const handleProgressUpdated = (updated: ModuleProgress) => {
    setProgressMap(prev => ({
      ...prev,
      [updated.moduleId]: updated
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
              <h1 className="text-lg sm:text-xl font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                Kurikulum Edukasi & Ujian Teori GO Lantas
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Kuasai materi rambu, etika, dan regulasi lalu lintas berstandar Korlantas POLRI.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
              <div className="flex items-center gap-1.5 text-[#0077c0] font-extrabold">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{(profile?.poin_total || 0).toLocaleString('id-ID')} Poin</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-bold">Level Pelopor</span>
            </div>
          </div>

          {/* Curriculum Completion Progress Bar (Flat, no card-in-card) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0077c0]" />
                Progres Kurikulum Nasional
              </span>
              <span className="text-[#0077c0] font-extrabold">
                {passedModules} / {totalModules} Modul Lulus
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
              <div 
                className="bg-[#0077C0] h-full rounded-full transition-all duration-300"
                style={{ width: `${(passedModules / totalModules) * 100}%` }}
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
                    {isEligibleCert ? 'Siap Diunduh (PNG)' : 'Terkunci (6 Modul)'}
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
          progress={progressMap[selectedModule.id] || {
            moduleId: selectedModule.id,
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
              modules={ALL_MODULES}
              moduleProgress={progressMap}
              onSelectModule={handleSelectModule}
              onOpenExam={() => handleTabChange('exam')}
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
            <Leaderboard />
          )}

          {activeTab === 'certificate' && (
            <Certificate
              onBack={() => handleTabChange('modules')}
              onOpenModule={(modId) => {
                const mod = ALL_MODULES.find((m: ModuleData) => m.id === modId);
                if (mod) {
                  setActiveTab('modules');
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
