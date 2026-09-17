import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Gamepad2, MapPin, Award, Flame, 
  ChevronRight, ChevronLeft, ArrowUpRight, Navigation,
  Shield, Calendar, Megaphone, Search, Users, BookOpen, Bot,
  CheckCircle2, X, LocateFixed
} from 'lucide-react';
import { UserProfile } from '../../core/types';
import { TabType } from '../../shared/components/BottomNavBar';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';
import { MASCOT_CONFIG } from '../../core/mascot';
import { 
  locationService, 
  LocationState, 
  getNearbyHotspotsForCoordinates 
} from '../../shared/services/location';
import { LocationSelectorModal } from '../../shared/components/LocationSelectorModal';

interface BerandaViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenRobotChat: (initialPrompt?: string) => void;
  profile?: UserProfile | null;
}

export const BerandaView: React.FC<BerandaViewProps> = ({ 
  onNavigateTab, 
  onOpenRobotChat,
  profile,
}) => {
  const [user, setUser] = useState<UserProfile | null>(profile || null);
  const [userLocation, setUserLocation] = useState<LocationState>(locationService.getLocation());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const carouselItems = [
    {
      id: 1,
      badge: 'PROGRAM NASIONAL KORLANTAS',
      title: 'Operasi Keselamatan Lalu Lintas 2026',
      description: 'Penertiban knalpot brong, wajib helm SNI bersuara "KLIK", dan edukasi etika berkendara bagi generasi muda.',
      date: 'Aktif Seluruh Indonesia',
      icon: Megaphone,
      themeColor: 'from-[#0077c0]/10 to-[#c7eeff]/20 border-[#0077c0]/30 text-[#0077c0]',
    },
    {
      id: 2,
      badge: 'ZONA AMAN PELAJAR',
      title: `Aktivasi ZOSS Sekolah (${userLocation.cityName})`,
      description: 'Pemberlakuan batas kecepatan 30 km/jam & pita kejut penyeberangan di depan kawasan sekolah dan kampus terpadu.',
      date: 'Aktif Setiap Hari Sekolah',
      icon: Shield,
      themeColor: 'from-[#0077c0]/10 to-[#c7eeff]/20 border-[#0077c0]/30 text-[#0077c0]',
    },
    {
      id: 3,
      badge: 'PROGRAM SERTIFIKASI',
      title: 'Duta Pelopor Keselamatan Generasi GO Lantas',
      description: 'Selesaikan 4 level kuis SIM Korlantas dan raih sertifikat digital resmi sebagai Pelopor Tertib Lalu Lintas.',
      date: 'Pekan Ini • +100 Bonus Pts',
      icon: Calendar,
      themeColor: 'from-[#0077c0]/10 to-[#c7eeff]/20 border-[#0077c0]/30 text-[#0077c0]',
    },
  ];

  const quickFilterChips = [
    { label: `🚦 Macet di ${userLocation.cityName}?`, query: `Bagaimana kondisi kemacetan di ${userLocation.cityName} saat ini dan apa rute alternatifnya?` },
    { label: '🏫 Rute Aman ZOSS Sekolah', query: 'Rekomendasikan rute aman dan aturan batas kecepatan Zona Selamat Sekolah (ZOSS) bagi pelajar.' },
    { label: '🪖 Aturan Helm SNI', query: 'Apa aturan dan sanksi tidak menggunakan helm SNI menurut UU No. 22 Tahun 2009?' },
    { label: '📜 Syarat Pembuatan SIM', query: 'Berapa batas usia minimal dan syarat pembuatan SIM bagi generasi muda?' },
    { label: '🚨 Panggilan Darurat 110', query: 'Bagaimana cara memanggil bantuan darurat kecelakaan lalu lintas Korlantas 110?' },
  ];

  const horizontalMenuItems = [
    { id: 'belajar', label: 'Kuis Edukasi', sublabel: '+20 Poin', icon: Gamepad2, color: 'bg-blue-50 text-[#0077C0]' },
    { id: 'jalur', label: 'Edukasi SIM', sublabel: 'Teori SIM', icon: BookOpen, color: 'bg-blue-50 text-[#0077C0]' },
    { id: 'peta', label: 'Peta Live', sublabel: 'Traffic GPS', icon: MapPin, color: 'bg-blue-50 text-[#0077C0]' },
    { id: 'sos', label: 'SOS 110', sublabel: 'Siaga Darurat', icon: ShieldAlert, color: 'bg-rose-50 text-rose-600' },
    { id: 'keluarga', label: 'Keluarga', sublabel: 'UU PDP', icon: Users, color: 'bg-blue-50 text-[#0077C0]' },
    { id: 'robot', label: 'Go Lantas Bot', sublabel: 'Tanya Petugas', icon: Bot, color: 'bg-blue-50 text-[#0077C0]' },
  ];

  useEffect(() => {
    if (profile) setUser(profile);
  }, [profile]);

  useEffect(() => {
    const unsubLocation = locationService.subscribe((loc) => {
      setUserLocation(loc);
    });

    // Auto rotate carousel every 6s
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 6000);

    return () => {
      unsubLocation();
      clearInterval(timer);
    };
  }, [carouselItems.length]);

  const handleTestNotification = () => {
    sound.playClick();
    NotificationService.sendNotification(
      '🎒 Pengingat Berangkat Sekolah Aman',
      'Pastikan tali helm berbunyi "KLIK"! Periksa kelengkapan STNK & SIM Anda sebelum menyalakan motor.'
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sound.playClick();
    onOpenRobotChat(searchQuery.trim());
  };

  const handleQuickChipClick = (query: string) => {
    sound.playClick();
    setSearchQuery(query);
    onOpenRobotChat(query);
  };

  const handleHorizontalMenuClick = (id: string) => {
    sound.playClick();
    if (id === 'robot') {
      onOpenRobotChat();
    } else if (id === 'jalur') {
      onNavigateTab('belajar');
    } else {
      onNavigateTab(id as TabType);
    }
  };

  const nextSlide = () => {
    sound.playClick();
    setCurrentSlide(prev => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    sound.playClick();
    setCurrentSlide(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const activeSlide = carouselItems[currentSlide];
  const SlideIcon = activeSlide.icon;

  const dynamicHotspots = getNearbyHotspotsForCoordinates(
    userLocation.latitude, 
    userLocation.longitude, 
    userLocation.cityName
  );

  return (
    <div className="space-y-5 pb-4 animate-fadeIn">
      {/* 0. Real-time Location Detection & Switcher Bar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#0077C0] transition-colors btn-press text-left"
        >
          <div className="p-1.5 rounded-xl bg-[#0077C0]/10 text-[#0077C0] shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
              {userLocation.isGPS ? 'Lokasi GPS Presisi' : 'Wilayah Terpilih'}
            </span>
            <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1 leading-tight">
              {userLocation.cityName} ({userLocation.subdistrict})
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </span>
          </div>
        </button>

        <button
          onClick={async () => {
            sound.playClick();
            const loc = await locationService.autoDetectLocation();
            NotificationService.showInAppToast(
              'Lokasi GPS Terdeteksi',
              `Posisi Anda: ${loc.cityName} (${loc.subdistrict})`,
              'success'
            );
          }}
          className="px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-[10.5px] font-bold border border-slate-200 shadow-2xs flex items-center gap-1 btn-press transition-all shrink-0"
          title="Sinkronkan GPS"
        >
          <Navigation className="w-3 h-3 text-[#0077C0] animate-pulse" />
          <span>Deteksi GPS</span>
        </button>
      </div>

      {/* 1. GoWapit Search Bar with Filter Chips */}
      <div className="space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder={`Cari rute ${userLocation.cityName}, rambu, pasal hukum, titik macet...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#E5EBE8] text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[#0077C0] focus:ring-2 focus:ring-[#0077C0]/15 shadow-[0_4px_16px_rgba(0,119,192,0.06)] min-h-[46px] font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Quick Suggestion Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {quickFilterChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChipClick(chip.query)}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5EBE8] text-[11px] font-bold text-slate-800 hover:text-[#0077C0] hover:border-[#0077C0]/40 whitespace-nowrap shadow-xs btn-press transition-all shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Metrics Summary Strip (Langsung di bawah Menu Pencarian) */}
      <div className="apple-card bg-white p-4 sm:p-4.5 rounded-[18px]">
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 text-[#0077C0] mb-0.5">
              <Flame className="w-4 h-4" />
              <span className="text-sm sm:text-base font-extrabold tracking-tight">{user?.streak_hari || 0} Hari</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">Streak Kuis</p>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 text-[#0077C0] mb-0.5">
              <Award className="w-4 h-4" />
              <span className="text-sm sm:text-base font-extrabold tracking-tight">{user?.poin_total || 0} Poin</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">Total Poin</p>
          </div>

          <div className="px-2">
            <div className="flex items-center justify-center gap-1.5 text-[#0077C0] mb-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm sm:text-base font-extrabold tracking-tight">
                {user && user.total_jawaban > 0 ? Math.round((user.jawaban_benar / user.total_jawaban) * 100) : 100}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">Akurasi SIM</p>
          </div>
        </div>
      </div>

      {/* 3. Unified Apple-Style Quick Action Service Grid */}
      <div className="apple-card bg-white p-4 sm:p-5 rounded-[20px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Layanan Cepat
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {horizontalMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleHorizontalMenuClick(item.id)}
                className="p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center text-center group btn-press hover:bg-slate-50 transition-all"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs mb-1.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight group-hover:text-[#0077C0] transition-colors leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {item.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Carousel: Info & Event Keselamatan */}
      <div className="relative overflow-hidden apple-card bg-white p-5 sm:p-6 rounded-[16px]">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077C0] flex items-center justify-center shrink-0">
              <SlideIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#0077C0] tracking-wide">
              {activeSlide.badge}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all btn-press"
              aria-label="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all btn-press"
              aria-label="Slide Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 min-h-[72px]">
          <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] font-heading tracking-apple-tight">
            {activeSlide.title}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {activeSlide.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-[#0077C0] font-extrabold">
            🗓️ {activeSlide.date}
          </span>
          <div className="flex items-center gap-1.5">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-5 bg-[#0077C0]' : 'w-1.5 bg-slate-200'
                }`}
                aria-label={`Pindah ke slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Primary 2-Grid: Quick Action Hub (Kuis & SOS) - 2 Kolom Kiri Kanan */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Play Quiz Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('belajar');
          }}
          className="p-4 sm:p-5 rounded-[18px] apple-card bg-white cursor-pointer group transition-all duration-200 btn-press flex flex-col justify-between hover:border-[#0077C0] space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0077C0] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10.5px] sm:text-xs font-extrabold text-[#0077C0]">
              +20 Poin
            </span>
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] group-hover:text-[#0077C0] transition-colors tracking-apple-tight">
              Kuis SIM Harian
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium line-clamp-2">
              Tantangan soal rambu, etika berkendara & pasal hukum lalu lintas.
            </p>
          </div>
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#0077C0]">
            <span>Mulai Belajar</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        {/* SOS Emergency Tile */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigateTab('sos');
          }}
          className="p-4 sm:p-5 rounded-[18px] apple-card bg-white border-rose-200 hover:border-rose-400 cursor-pointer group transition-all duration-200 btn-press flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10.5px] sm:text-xs font-extrabold text-rose-600">
              110 POLRI
            </span>
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-extrabold text-[#0F172A] group-hover:text-rose-600 transition-colors tracking-apple-tight">
              Darurat SOS 110
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium line-clamp-2">
              Tahan tombol 3 detik & kirim koordinat GPS presisi ke Command Center.
            </p>
          </div>
          <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-rose-600">
            <span>Buka Layanan SOS</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* 6. AI Mascot Assistant Showcase */}
      <div className="p-5 sm:p-6 rounded-[16px] apple-card bg-white border-[#0077C0]/25 flex flex-col justify-between space-y-3.5">
        <div>
          <div className="flex items-start gap-3.5">
            <div 
              onClick={() => onOpenRobotChat()}
              className="w-13 h-13 shrink-0 cursor-pointer hover:scale-105 transition-transform btn-press flex items-center justify-center drop-shadow-sm"
            >
              <img 
                src={MASCOT_CONFIG.avatarUrl} 
                alt={MASCOT_CONFIG.name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.svg')) {
                    target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-[#0F172A] tracking-apple-tight">
                  {MASCOT_CONFIG.name}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  • Asisten Korlantas
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                Tanya rute bebas macet di {userLocation.cityName}, pasal hukum lalu lintas nasional, atau aturan SIM.
              </p>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => onOpenRobotChat(`Bagaimana kondisi lalu lintas di ${userLocation.cityName} saat ini?`)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 btn-press transition-all text-left font-bold"
            >
              🚦 Macet di {userLocation.cityName}?
            </button>
            <button
              onClick={() => onOpenRobotChat('Rekomendasikan rute aman ke sekolah bagi pelajar.')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 btn-press transition-all text-left font-bold"
            >
              🛵 Rute aman ke sekolah?
            </button>
          </div>
        </div>

        <button
          onClick={() => onOpenRobotChat()}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0077C0] hover:bg-[#005fa3] text-white text-xs font-bold transition-all btn-press flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Buka Obrolan</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 7. Pemantauan Titik Rawan Lalin (Disesuaikan dengan Lokasi Pengguna) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="gowapit-section-label">
            Pemantauan Titik Rawan ({userLocation.cityName})
          </span>
          <button 
            onClick={() => onNavigateTab('peta')}
            className="text-xs text-[#0077C0] font-extrabold hover:underline flex items-center gap-1"
          >
            Buka Peta
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dynamicHotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => onNavigateTab('peta')}
              className="p-4 rounded-[16px] apple-card bg-white hover:border-[#0077C0] cursor-pointer group flex items-center justify-between gap-3 transition-all btn-press shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C0] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    {hotspot.nama_jalan}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1">
                    {hotspot.penyebab}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold capitalize ${
                  hotspot.level_kemacetan === 'lancar' ? 'text-emerald-700' :
                  hotspot.level_kemacetan === 'padat_merayap' || hotspot.level_kemacetan === 'macet_total' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {hotspot.level_kemacetan.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
