import React, { useState, useEffect } from 'react';
import { 
  Bell, Key, RotateCcw, Check, Save, ExternalLink 
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
  
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKeySuccess, setSavedKeySuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(MockDB.getCurrentUser());
      setSchedules(MockDB.getNotificationSchedules());
    };
    window.addEventListener('sigap_db_updated', handleUpdate);
    
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

  const rank = THEME.rankBadges.slice().reverse().find(r => user.poin_total >= r.minPoints) || THEME.rankBadges[0];

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. Identity & Rank Card */}
      <div className="p-5 rounded-[20px] apple-card text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#0066cc] to-indigo-600 p-0.5 shadow-xl">
          <img 
            src={user.avatar_url} 
            alt={user.nama} 
            className="w-full h-full rounded-[14px] bg-[#060b18] object-cover" 
          />
        </div>

        <div className="mt-3">
          <h2 className="text-base font-heading font-bold text-white tracking-apple-tight">
            {user.nama}
          </h2>
          <p className="text-xs text-blue-300 font-medium mt-0.5">
            {user.sekolah_kampus}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-xs font-semibold mt-2.5">
            <span>{rank.icon}</span>
            <span>{rank.title}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
          <div className="p-3 rounded-[14px] bg-black/20 border border-white/5 text-left">
            <span className="text-[11px] text-slate-400">Total Poin</span>
            <p className="text-base font-bold text-amber-400">{user.poin_total} Pts</p>
          </div>
          <div className="p-3 rounded-[14px] bg-black/20 border border-white/5 text-left">
            <span className="text-[11px] text-slate-400">Streak Harian</span>
            <p className="text-base font-bold text-orange-400">{user.streak_hari} Hari</p>
          </div>
          <div className="p-3 rounded-[14px] bg-black/20 border border-white/5 text-left">
            <span className="text-[11px] text-slate-400">Kuis Selesai</span>
            <p className="text-base font-bold text-[#2997ff]">{user.kuis_selesai} Soal</p>
          </div>
          <div className="p-3 rounded-[14px] bg-black/20 border border-white/5 text-left">
            <span className="text-[11px] text-slate-400">Akurasi Jawaban</span>
            <p className="text-base font-bold text-emerald-400">
              {user.total_jawaban > 0 ? Math.round((user.jawaban_benar / user.total_jawaban) * 100) : 100}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Notification Schedule Settings */}
      <div className="p-5 rounded-[18px] apple-card space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white tracking-apple-tight">
            Pengaturan Pengingat Keselamatan
          </h3>
        </div>

        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-3.5 rounded-[14px] bg-black/20 border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-200">{schedule.judul}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{schedule.pesan}</p>
              </div>
              <button
                onClick={() => handleToggleSchedule(schedule.id)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  schedule.aktif ? 'bg-[#0066cc]' : 'bg-slate-700'
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

      {/* 3. Google AI Studio Gemini API Key Form */}
      <form onSubmit={handleSaveApiKey} className="p-5 rounded-[18px] apple-card border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white tracking-apple-tight">
              Konfigurasi Gemini API Key (Robot AI)
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
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
            className="w-full px-4 py-2.5 rounded-full bg-black/30 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0066cc] font-mono min-h-[44px]"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Dapatkan Key di Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="submit"
              className="px-5 py-2 rounded-full apple-button-primary text-xs font-semibold shadow flex items-center gap-1.5"
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
          className="px-5 py-2.5 rounded-full bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mx-auto btn-press"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Data Prototipe (Setelan Pabrik)
        </button>
      </div>
    </div>
  );
};
