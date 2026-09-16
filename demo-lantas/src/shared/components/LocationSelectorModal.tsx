import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, X, Compass, Globe } from 'lucide-react';
import { 
  locationService, 
  LocationState, 
  INDONESIAN_MAJOR_CITIES 
} from '../services/location';
import { sound } from '../services/sound';
import { NotificationService } from '../services/notification';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationState>(locationService.getLocation());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  React.useEffect(() => {
    return locationService.subscribe((loc) => {
      setCurrentLocation(loc);
    });
  }, []);

  if (!isOpen) return null;

  const handleAutoGPS = async () => {
    sound.playClick();
    setIsDetectingGPS(true);
    try {
      const loc = await locationService.autoDetectLocation();
      NotificationService.showInAppToast(
        'Lokasi GPS Terdeteksi',
        `Peta & Informasi disesuaikan ke: ${loc.cityName} (${loc.subdistrict})`,
        'success'
      );
      onClose();
    } catch {
      NotificationService.showInAppToast('GPS Gagal', 'Pastikan izin lokasi di browser aktif.', 'warning');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const handleSelectCity = (cityId: string) => {
    sound.playClick();
    locationService.setCity(cityId);
    const loc = locationService.getLocation();
    NotificationService.showInAppToast(
      'Kota Diubah',
      `Menampilkan peta & informasi lalu lintas ${loc.cityName}`,
      'info'
    );
    onClose();
  };

  const filteredCities = INDONESIAN_MAJOR_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-[24px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0077c0]/15 text-[#0077c0]">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                Pilih Lokasi Wilayah
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Peta & info lalu lintas menyesuaikan lokasi Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors btn-press"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          {/* Real-time GPS Auto Detect Button */}
          <button
            onClick={handleAutoGPS}
            disabled={isDetectingGPS}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#0077C0] to-[#0095f6] text-white flex items-center justify-between gap-3 shadow-md hover:opacity-95 transition-all btn-press"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shrink-0">
                <Navigation className={`w-5 h-5 ${isDetectingGPS ? 'animate-spin' : 'animate-pulse'}`} />
              </div>
              <div>
                <span className="text-xs font-extrabold block">
                  {isDetectingGPS ? 'Mencari Koordinat GPS...' : 'Deteksi Otomatis Lokasi Saya (GPS)'}
                </span>
                <span className="text-[10.5px] text-white/90 font-medium block">
                  Ikuti posisi perangkat secara akurat & real-time
                </span>
              </div>
            </div>
            {currentLocation.isGPS && (
              <span className="px-2 py-0.5 rounded-full bg-white text-[#0077C0] text-[10px] font-extrabold shrink-0 shadow-2xs">
                Aktif
              </span>
            )}
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kota atau provinsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:ring-1 focus:ring-[#0077C0]/20 font-medium"
            />
          </div>

          {/* Preset Cities List */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Pilihan Kota Utama Indonesia
            </span>

            <div className="space-y-1.5 max-h-[38vh] overflow-y-auto no-scrollbar pt-1">
              {filteredCities.map((city) => {
                const isSelected = !currentLocation.isGPS && currentLocation.cityName === city.name;
                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all btn-press ${
                      isSelected
                        ? 'bg-[#0077c0]/10 border-[#0077c0] text-[#0077c0]'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#0077c0] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block leading-tight">
                          {city.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {city.province}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0077c0] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            📍 Lokasi aktif: <strong>{currentLocation.cityName}</strong> {currentLocation.isGPS ? '(GPS Presisi)' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
