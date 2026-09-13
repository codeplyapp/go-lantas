import React, { useState, useEffect } from 'react';
import { 
  User, Award, Flame, ShieldAlert, Sparkles, 
  Bell, Key, RotateCcw, Check, Save, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { MockDB } from '../../core/db';
import { UserProfile, NotificationSchedule } from '../../core/types';
import { AI_STORAGE_KEYS, DEFAULT_AI_MODEL } from '../../core/ai-config';
import { THEME } from '../../core/tema';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';

export const ProfilView: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(MockDB.getCurrentUser());
  const [schedules, setSchedules] = useState<NotificationSchedule[]>(MockDB.getNotificationSchedules());
  
  // Gemini API Key state
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKeySuccess, setSavedKeySuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(MockDB.getCurrentUser());
      setSchedules(MockDB.getNotificationSchedules());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    
    // Load existing API Key
    const existingKey = localStorage.getItem(AI_STORAGE_KEYS.API_KEY) || '';
    setApiKey(existingKey);

    return () => window.removeEventListener('sigap_db_updated', handleUpdate);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCorrect();
    localStorage.setItem(AI_STORAGE_KEYS.API_KEY, apiKey.trim());
    setSavedKeySuccess(true);
    NotificationService.showInAppToast(
      'Konfigurasi Disimpan',
      apiKey.trim() ? 'Google AI Studio Gemini API Key aktif untuk Si SIGAP.' : 'Menggunakan Rule-Based Fallback Engine untuk Si SIGAP.',
      'success'
    );
    setTimeout(() => setSavedKeySuccess(false), 3000);
  };

  const handleToggleSchedule = (id: string) => {
    sound.playClick();
    const updated = MockDB.toggleNotificationSchedule(id);
    setSchedules(updated);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Reset seluruh data prototipe (poin, kuis, log) kembali ke pengaturan awal pabrik?')) {
      sound.playWrong();
      MockDB.resetAllData();
      NotificationService.showInAppToast('Data Direset', 'Seluruh data demo telah dikembalikan ke kondisi awal.', 'info');
    }
  };

  // Determine Rank Badge
  const rank = THEME.rankBadges.slice().reverse().find(r => user.poin_total >= r.minPoints) || THEME.rankBadges[0];

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Identity & Rank Card */}
      <div className="p-4.5 rounded-2xl glass-card border border-blue-500/30 text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-0.5 shadow-xl">
          <img 
            src={user.avatar_url} 
            alt={user.nama} 
            className="w-full h-full rounded-[14px] bg-slate-900 object-cover" 
          />
        </div>

        <div className="mt-3">
          <h2 className="text-base font-heading font-extrabold text-white">
            {user.nama}
          </h2>
          <p className="text-xs text-blue-300 font-medium">
            {user.sekolah_kampus}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mt-2">
            <span>{rank.icon}</span>
            <span>{rank.title}</span>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] text-slate-400">Total Poin</span>
            <p className="text-base font-extrabold text-amber-400">{user.poin_total} Pts</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] text-slate-400">Streak Harian</span>
            <p className="text-base font-extrabold text-orange-400">{user.streak_hari} Hari</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] text-slate-400">Kuis Selesai</span>
            <p className="text-base font-extrabold text-blue-400">{user.kuis_selesai} Soal</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] text-slate-400">Akurasi Jawaban</span>
            <p className="text-base font-extrabold text-emerald-400">
              {user.total_jawaban > 0 ? Math.round((user.jawaban_benar / user.total_jawaban) * 100) : 100}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Notification Schedule Settings */}
      <div className="p-4 rounded-2xl glass-card border border-blue-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white">
            Pengaturan Pengingat Keselamatan
          </h3>
        </div>

        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-200">{schedule.judul}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{schedule.pesan}</p>
              </div>
              <button
                onClick={() => handleToggleSchedule(schedule.id)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  schedule.aktif ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    schedule.aktif ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Google AI Studio Gemini API Key Configuration */}
      <form onSubmit={handleSaveApiKey} className="p-4 rounded-2xl glass-card border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">
              Konfigurasi Gemini API Key (Robot AI)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {DEFAULT_AI_MODEL}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Masukkan Google AI Studio API key Anda untuk mengaktifkan respons LLM asli. Jika dikosongkan, Robot AI tetap berfungsi optimal menggunakan <strong>Rule-Based Fallback</strong>.
        </p>

        <div className="space-y-2">
          <input
            type="password"
            placeholder="Tempel AI Studio API Key (AIzaSy...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Dapatkan Key di Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all active:scale-95"
            >
              {savedKeySuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedKeySuccess ? 'Tersimpan' : 'Simpan Key'}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 italic">
          *API Key disimpan secara lokal di browser (localStorage) dan tidak pernah dikirim ke git repository.
        </p>
      </form>

      {/* 4. Reset Database Button */}
      <div className="pt-2 text-center">
        <button
          onClick={handleResetDatabase}
          className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Data Prototipe (Setelan Pabrik)
        </button>
      </div>
    </div>
  );
};
