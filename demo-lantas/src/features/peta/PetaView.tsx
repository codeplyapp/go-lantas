import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Wifi, WifiOff, Navigation, Compass, ChevronRight, Shield, Clock, AlertCircle,
  PhoneCall, MapPin, Flame, Building2, HeartPulse, ExternalLink,
  Search, Globe, LocateFixed, RefreshCw, Plus, Minus
} from 'lucide-react';
import { 
  BANYUWANGI_CENTER, 
  BANYUWANGI_TRAFFIC_SEGMENTS, 
  BANYUWANGI_NAVIGATION_ROUTE,
  BANYUWANGI_INCIDENTS, 
} from '../../data/banyuwangi_traffic';
import { BANYUWANGI_EMERGENCY_FACILITIES } from '../../data/emergency_facilities';
import { TimeSlot, TrafficLevel, EmergencyFacility, EmergencyFacilityType } from '../../core/types';
import { MAP_CONFIG } from '../../core/map-config';
import { sound } from '../../shared/services/sound';
import { NotificationService } from '../../shared/services/notification';
import { 
  locationService, 
  LocationState, 
  getNearbyFacilitiesForCoordinates,
  calculateDistance 
} from '../../shared/services/location';
import { LocationSelectorModal } from '../../shared/components/LocationSelectorModal';

/**
 * Helper untuk warna status Traffic Google Maps
 */
const getTrafficColor = (level: TrafficLevel) => {
  switch (level) {
    case 'lancar': return '#16a34a'; // Green (>35 km/h)
    case 'sedang': return '#d97706'; // Amber / Orange (20-35 km/h)
    case 'padat': return '#dc2626'; // Red (10-20 km/h)
    case 'macet_total': return '#991b1b'; // Dark Red (<10 km/h)
    default: return '#16a34a';
  }
};

const getTrafficLabel = (level: TrafficLevel) => {
  switch (level) {
    case 'lancar': return 'Lancar (>35 km/jam)';
    case 'sedang': return 'Padat Merayap (20-35 km/jam)';
    case 'padat': return 'Macet (10-20 km/jam)';
    case 'macet_total': return 'Macet Total (<10 km/jam)';
    default: return 'Lancar';
  }
};

/**
 * 1. Google Maps Pulsating Blue Dot (User Live GPS)
 */
const createGmapsUserDot = () => {
  return L.divIcon({
    className: 'gmaps-user-marker-container',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div class="gmaps-radar-pulse" style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 119, 192, 0.25);"></div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background: #0077c0; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); z-index: 2;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

/**
 * 2. Google Maps Teardrop Pin (Destination)
 */
const createGmapsPin = (bgColor: string, symbol: string) => {
  return L.divIcon({
    className: 'gmaps-pin-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));
      ">
        <div style="
          background: ${bgColor};
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        ">
          <span style="transform: rotate(45deg); font-size: 13px;">${symbol}</span>
        </div>
      </div>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 34],
    popupAnchor: [0, -34],
  });
};

/**
 * 3. Google Maps Incident & Hazard Badge
 */
const createIncidentBadge = (type: string, title: string) => {
  const icon = type === 'kecelakaan' ? '💥' : type === 'perbaikan_jalan' ? '🚧' : '⚠️';
  const bg = type === 'kecelakaan' ? '#dc2626' : '#ea580c';
  return L.divIcon({
    className: 'gmaps-incident-badge',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: ${bg};
        color: white;
        padding: 3px 8px;
        border-radius: 9999px;
        border: 1.5px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      ">
        <span>${icon}</span>
        <span style="font-size: 10px; font-weight: 700; letter-spacing: -0.02em;">${title}</span>
      </div>
    `,
    iconSize: [70, 26],
    iconAnchor: [35, 13],
    popupAnchor: [0, -14],
  });
};

/**
 * 4. Google Maps Emergency Facilities Badge (Polsek, Damkar, RS)
 */
const createFacilityBadge = (tipe: EmergencyFacilityType) => {
  let icon = '🚓';
  let bg = '#0077c0';
  let label = 'Polsek';

  if (tipe === 'damkar') {
    icon = '🚒';
    bg = '#ea580c';
    label = 'Damkar';
  } else if (tipe === 'rumah_sakit') {
    icon = '🏥';
    bg = '#dc2626';
    label = 'RS IGD';
  }

  return L.divIcon({
    className: 'gmaps-facility-badge',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: ${bg};
        color: white;
        padding: 3px 8px;
        border-radius: 9999px;
        border: 1.5px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.22);
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      ">
        <span style="font-size: 12px;">${icon}</span>
        <span style="font-size: 10px; font-weight: 800; letter-spacing: -0.02em;">${label}</span>
      </div>
    `,
    iconSize: [76, 26],
    iconAnchor: [38, 13],
    popupAnchor: [0, -14],
  });
};

const destinationIcon = createGmapsPin('#059669', '🏫');
const userGpsIcon = createGmapsUserDot();

// Map Center Controller Helper
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Map Instance Capture Helper
const MapInstanceCapture: React.FC<{ onMap: (map: L.Map) => void }> = ({ onMap }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
};

export const PetaView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LocationState>(locationService.getLocation());
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('pagi');
  const [activeLayer, setActiveLayer] = useState<'traffic' | 'rute' | 'darurat' | 'laka'>('traffic');
  const [facilityFilter, setFacilityFilter] = useState<'semua' | EmergencyFacilityType>('semua');
  const [isOfflineSimulation, setIsOfflineSimulation] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([userLocation.latitude, userLocation.longitude]);
  const [mapZoom, setMapZoom] = useState<number>(14);

  useEffect(() => {
    const unsub = locationService.subscribe((loc) => {
      setUserLocation(loc);
      setMapCenter([loc.latitude, loc.longitude]);
    });

    // Auto-detect browser GPS on initial view mount
    locationService.autoDetectLocation();

    return unsub;
  }, []);

  const timeSlots: { id: TimeSlot; label: string; time: string }[] = [
    { id: 'pagi', label: 'Pagi', time: '07:00 WIB' },
    { id: 'siang', label: 'Siang', time: '13:00 WIB' },
    { id: 'sore', label: 'Sore', time: '17:30 WIB' },
    { id: 'malam', label: 'Malam', time: '21:00 WIB' },
  ];

  // Dynamic facilities: Combine nearby generated facilities for current location with verified base facilities
  const dynamicNearbyFacilities = getNearbyFacilitiesForCoordinates(
    userLocation.latitude, 
    userLocation.longitude, 
    userLocation.cityName
  );
  
  const allFacilities = [
    ...dynamicNearbyFacilities,
    ...BANYUWANGI_EMERGENCY_FACILITIES.filter(f => 
      calculateDistance(userLocation.latitude, userLocation.longitude, f.koordinat[0], f.koordinat[1]) < 30
    )
  ];

  const filteredFacilities = allFacilities.filter(f => {
    if (facilityFilter === 'semua') return true;
    return f.tipe === facilityFilter;
  });

  const handleFocusFacility = (facility: EmergencyFacility) => {
    sound.playClick();
    setSelectedFacility(facility);
    setActiveLayer('darurat');
    setMapCenter(facility.koordinat);
    setMapZoom(16);
    NotificationService.showInAppToast(
      facility.nama,
      `Berjarak ${facility.jarak_km} km (±${facility.estimasi_menit} mnt) dari lokasi Anda. Hubungi: ${facility.nomor_telepon}`,
      'info'
    );
  };

  const handleCallEmergency = (phone: string, name: string) => {
    sound.playClick();
    NotificationService.showInAppToast(
      'Menghubungi Layanan Darurat',
      `Menyambungkan panggilan ke ${name} (${phone})...`,
      'emergency'
    );
  };

  const handleLocateMe = async () => {
    sound.playClick();
    const loc = await locationService.autoDetectLocation();
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(15);
    NotificationService.showInAppToast(
      'Lokasi GPS Aktif',
      `Peta diarahkan ke posisi Anda di ${loc.cityName} (${loc.subdistrict})`,
      'success'
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sound.playClick();
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'id,en' } });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          await locationService.setCustomCoordinates(lat, lon, data[0].display_name.split(',')[0]);
          setMapCenter([lat, lon]);
          setMapZoom(14);
          NotificationService.showInAppToast(
            'Lokasi Ditemukan',
            `Peta berpindah ke: ${data[0].display_name.split(',').slice(0, 2).join(',')}`,
            'info'
          );
        } else {
          NotificationService.showInAppToast('Lokasi Tidak Ditemukan', 'Coba cari dengan nama kota atau jalan lain.', 'warning');
        }
      }
    } catch {
      NotificationService.showInAppToast('Pencarian Gagal', 'Periksa koneksi internet Anda.', 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 pb-4 animate-fadeIn">
      {/* 1. Global Location & Address Search Bar */}
      <div className="p-4 sm:p-5 rounded-[18px] apple-card bg-white space-y-3.5 shadow-xs">
        {/* Top Title & Location Pill Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#0077c0]/15 text-[#0077c0] shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                Peta Lalu Lintas & Layanan Terdekat
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Mengikuti lokasi real-time GPS Anda di seluruh wilayah
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Active City / Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all btn-press"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0077C0]" />
              <span className="truncate max-w-[130px]">{userLocation.cityName}</span>
              {userLocation.isGPS && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Offline Simulator Switcher */}
            <button
              onClick={() => {
                sound.playClick();
                setIsOfflineSimulation(prev => !prev);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all btn-press flex items-center gap-1.5 ${
                isOfflineSimulation 
                  ? 'bg-amber-50/80 text-amber-800 hover:bg-amber-100/80' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isOfflineSimulation ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isOfflineSimulation ? 'Offline' : 'Online'}</span>
            </button>
          </div>
        </div>

        {/* Global Address / City Search Form */}
        <form onSubmit={handleSearchAddress} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari lokasi, jalan, kota di Indonesia atau dunia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077C0] focus:bg-white font-medium"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0077C0] text-white text-[11px] font-bold hover:bg-[#008be0] transition-colors btn-press flex items-center gap-1"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>Cari</span>}
          </button>
        </form>

        {/* Time Slot Segmented Pills (Live Rush Hour Simulator) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-900">
              <Clock className="w-3.5 h-3.5 text-[#0077C0]" />
              Simulasi Kepadatan Jam Sibuk
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {timeSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTimeSlot(slot.id);
                }}
                className={`py-1.5 px-1 rounded-xl text-center transition-all btn-press ${
                  selectedTimeSlot === slot.id
                    ? 'bg-[#0077C0] text-white shadow-xs font-extrabold'
                    : 'text-slate-700 hover:text-slate-950 font-semibold'
                }`}
              >
                <span className="block text-xs font-bold leading-tight">{slot.label}</span>
                <span className={`block text-[9px] mt-0.5 leading-tight ${selectedTimeSlot === slot.id ? 'text-white/90 font-medium' : 'text-slate-500'}`}>
                  {slot.time.replace(' WIB', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* 2. Interactive Leaflet Map Container (Global Carto & Live GPS Tracking) */}
      <div className="relative w-full h-[400px] rounded-[18px] overflow-hidden apple-card shadow-md border border-[#E5EBE8] bg-white isolate z-0">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={14}
          zoomControl={false}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <MapRecenter center={mapCenter} zoom={mapZoom} />
          <MapInstanceCapture onMap={setMapInstance} />

          {/* Carto Voyager Global Basemap Layer */}
          <TileLayer
            attribution={MAP_CONFIG.attribution}
            url={MAP_CONFIG.tileUrl}
            maxZoom={MAP_CONFIG.maxZoom}
          />

          {/* LAYER 1: TRAFFIC SEGMENTS */}
          {(activeLayer === 'traffic' || activeLayer === 'rute' || activeLayer === 'darurat') &&
            BANYUWANGI_TRAFFIC_SEGMENTS.map(seg => {
              const kondisi = seg.kondisi[selectedTimeSlot];
              const color = getTrafficColor(kondisi);
              const speed = seg.kecepatan[selectedTimeSlot];
              const isSelected = selectedSegment === seg.id;

              return (
                <Polyline
                  key={seg.id}
                  positions={seg.polyline}
                  eventHandlers={{
                    click: () => {
                      sound.playClick();
                      setSelectedSegment(seg.id);
                    }
                  }}
                  pathOptions={{
                    color: color,
                    weight: isSelected ? 8 : 6,
                    opacity: isSelected ? 1 : 0.85,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                        <span className="font-extrabold text-[#000000] text-xs">{seg.nama_jalan}</span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {speed}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        <p className="font-medium text-slate-900">
                          Status: <span className="capitalize font-bold" style={{ color }}>{getTrafficLabel(kondisi)}</span>
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[10px]">{seg.keterangan}</p>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

          {/* LAYER 2: NAVIGATION ROUTE */}
          {activeLayer === 'rute' && (
            <Polyline
              positions={BANYUWANGI_NAVIGATION_ROUTE}
              pathOptions={{
                color: '#0077c0',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}

          {/* User Live GPS Marker */}
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userGpsIcon}
          >
            <Popup>
              <div className="p-1.5 text-slate-900 space-y-1 text-xs">
                <span className="font-bold text-[#0077c0] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Posisi Anda ({userLocation.cityName})
                </span>
                <p className="text-[11px] text-slate-700">{userLocation.formattedAddress}</p>
                <div className="text-[10px] text-slate-700 font-mono bg-slate-50 p-1.5 rounded border border-slate-200">
                  Lat: {userLocation.latitude.toFixed(4)}° • Lng: {userLocation.longitude.toFixed(4)}°<br/>
                  Akurasi GPS: ±{userLocation.accuracyMeters || 10}m
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker
            position={[userLocation.latitude + 0.008, userLocation.longitude + 0.006]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="p-1.5 text-slate-900 space-y-1 text-xs">
                <span className="font-bold text-[#0077c0] block">Zona Selamat Sekolah Presisi ({userLocation.cityName})</span>
                <p className="text-[11px] text-slate-700">Titik Akhir Rute Pelajar Aman</p>
                <p className="text-[10.5px] text-[#0077c0] font-bold">
                  Batas Kecepatan 30 km/jam
                </p>
              </div>
            </Popup>
          </Marker>

          {/* LAYER 3: FASILITAS DARURAT */}
          {(activeLayer === 'darurat' || activeLayer === 'traffic') &&
            filteredFacilities.map(fac => {
              const badgeIcon = createFacilityBadge(fac.tipe);
              return (
                <Marker
                  key={fac.id}
                  position={fac.koordinat}
                  icon={badgeIcon}
                  eventHandlers={{
                    click: () => {
                      sound.playClick();
                      setSelectedFacility(fac);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs min-w-[210px]">
                      <div className="flex items-start justify-between gap-1.5 border-b border-slate-100 pb-1.5">
                        <div>
                          <span className="font-extrabold text-[#0F172A] text-xs block leading-tight">
                            {fac.nama}
                          </span>
                          <span className="text-[10px] font-bold text-[#0077c0] mt-0.5 block">
                            {fac.jarak_km} km dari Anda (±{fac.estimasi_menit} mnt)
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p className="line-clamp-2 leading-relaxed">{fac.alamat}</p>
                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] space-y-0.5 font-medium text-slate-800">
                          <p><strong>Jam:</strong> {fac.jam_operasional}</p>
                          <p><strong>Telp:</strong> {fac.nomor_telepon}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handleCallEmergency(fac.nomor_telepon, fac.nama)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10.5px] flex items-center justify-center gap-1 shadow-xs btn-press"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Hubungi</span>
                        </button>
                        <button
                          onClick={() => handleFocusFacility(fac)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#0077c0] hover:bg-[#008be0] text-white font-extrabold text-[10.5px] flex items-center justify-center gap-1 shadow-xs btn-press"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Rute</span>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Incidents & Road Works Badges */}
          {(activeLayer === 'traffic' || activeLayer === 'laka') &&
            BANYUWANGI_INCIDENTS.map(inc => (
              <Marker
                key={inc.id}
                position={inc.koordinat}
                icon={createIncidentBadge(inc.tipe, inc.tipe === 'perbaikan_jalan' ? '+6 mnt' : 'Laka')}
              >
                <Popup>
                  <div className="p-1.5 text-slate-900 space-y-1 text-xs">
                    <span className="font-bold text-amber-800 block">{inc.judul}</span>
                    <p className="text-[11px] text-slate-700">{inc.deskripsi}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                      <span>Lokasi: {inc.lokasi}</span>
                      <span className="text-amber-800 font-bold">{inc.waktu}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Clean Floating Map Action Controls (Top-Left) */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-auto select-none">
          {/* Tombol Lokasi Saya */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="h-9 px-3 rounded-xl bg-white text-[#0077C0] hover:bg-slate-50 border border-slate-200/90 shadow-md flex items-center gap-1.5 font-bold text-xs btn-press transition-all cursor-pointer"
            title="Pusatkan ke Posisi GPS Saya"
          >
            <LocateFixed className="w-4 h-4 text-[#0077C0]" />
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>

          {/* Tombol Zoom In & Out */}
          <div className="flex flex-col w-9 rounded-xl overflow-hidden shadow-md border border-slate-200/90 bg-white divide-y divide-slate-100">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                mapInstance?.zoomIn();
              }}
              className="w-9 h-9 text-slate-700 hover:text-[#0077c0] hover:bg-slate-50 transition-colors flex items-center justify-center btn-press cursor-pointer"
              title="Perbesar Peta (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                mapInstance?.zoomOut();
              }}
              className="w-9 h-9 text-slate-700 hover:text-[#0077c0] hover:bg-slate-50 transition-colors flex items-center justify-center btn-press cursor-pointer"
              title="Perkecil Peta (-)"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top-Right Google Maps Traffic Legend Bar */}
        <div className="absolute top-3 right-3 z-20 bg-white/95 p-2 rounded-[14px] border border-slate-200 backdrop-blur-md text-[9.5px] space-y-1 shadow-md">
          <div className="font-extrabold text-[#0F172A] text-[9.5px] mb-0.5">Lalu Lintas (Real-Time)</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
            <span className="text-slate-800 font-semibold">Lancar (&gt;35 km/j)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>
            <span className="text-slate-800 font-semibold">Padat (20-35 km/j)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
            <span className="text-slate-800 font-semibold">Macet (10-20 km/j)</span>
          </div>
        </div>

        {/* Bottom Layer Filter Floating Bar */}
        <div className="absolute bottom-3 left-3 z-20 flex gap-1 bg-white/95 p-1 rounded-full border border-slate-200 backdrop-blur-md shadow-md max-w-[94%] overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveLayer('traffic');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold btn-press transition-all shrink-0 ${
              activeLayer === 'traffic' ? 'bg-[#0077c0] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Lalu Lintas
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveLayer('darurat');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold btn-press transition-all shrink-0 ${
              activeLayer === 'darurat' ? 'bg-[#0077c0] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Fasilitas Darurat
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveLayer('rute');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold btn-press transition-all shrink-0 ${
              activeLayer === 'rute' ? 'bg-[#0077c0] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Rute
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveLayer('laka');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold btn-press transition-all shrink-0 ${
              activeLayer === 'laka' ? 'bg-[#0077c0] text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Insiden
          </button>
        </div>
      </div>

      {/* 3. Fasilitas Darurat Terdekat Directory Cards */}
      <div className="p-4 sm:p-5 rounded-[18px] apple-card bg-white space-y-3.5 shadow-xs border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
              Layanan Darurat Terdekat ({userLocation.cityName})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pos Lantas, IGD RS & Damkar terdekat dari posisi Anda ({userLocation.subdistrict})
            </p>
          </div>

          {/* Sub-Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => {
                sound.playClick();
                setFacilityFilter('semua');
                setActiveLayer('darurat');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all btn-press ${
                facilityFilter === 'semua' ? 'bg-[#0077c0] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({allFacilities.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFacilityFilter('polsek');
                setActiveLayer('darurat');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all btn-press ${
                facilityFilter === 'polsek' ? 'bg-[#0077c0] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Polsek
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFacilityFilter('damkar');
                setActiveLayer('darurat');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all btn-press ${
                facilityFilter === 'damkar' ? 'bg-[#0077c0] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Damkar
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFacilityFilter('rumah_sakit');
                setActiveLayer('darurat');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all btn-press ${
                facilityFilter === 'rumah_sakit' ? 'bg-[#0077c0] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RS
            </button>
          </div>
        </div>

        {/* List of Nearest Emergency Services */}
        <div className="divide-y divide-slate-100">
          {filteredFacilities.slice(0, 3).map(fac => {
            let IconComponent = Shield;
            let typeLabel = 'Pos Lantas / Polsek 24 Jam';

            if (fac.tipe === 'damkar') {
              IconComponent = Flame;
              typeLabel = 'Damkar & Rescue';
            } else if (fac.tipe === 'rumah_sakit') {
              IconComponent = HeartPulse;
              typeLabel = 'IGD & Trauma Center';
            }

            const isCurrentSelected = selectedFacility?.id === fac.id;

            return (
              <div 
                key={fac.id}
                className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1 last:pb-0 transition-colors ${
                  isCurrentSelected ? 'bg-blue-50/50 -mx-4 sm:-mx-5 px-4 sm:px-5 rounded-xl' : ''
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0077c0] flex items-center gap-1">
                      <IconComponent className="w-3.5 h-3.5 text-[#0077c0]" />
                      <span>{typeLabel}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      • ±{fac.jarak_km} km
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      • {fac.jam_operasional}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] leading-snug">
                    {fac.nama}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                    {fac.alamat} • <span className="font-mono text-slate-600">{fac.nomor_telepon}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCallEmergency(fac.nomor_telepon, fac.nama)}
                    className="py-1.5 px-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs btn-press"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Panggil {fac.nomor_telepon}</span>
                  </button>
                  <button
                    onClick={() => handleFocusFacility(fac)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 btn-press"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0077c0]" />
                    <span>Peta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 2-Grid Below Map: Route Navigation & Traffic Advisory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Navigation & ETA Card */}
        <div className="p-4 sm:p-5 rounded-[18px] apple-card bg-white border-[#0077C0]/25 flex flex-col justify-between space-y-3.5 shadow-xs">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-[#0077C0]/15 text-[#0077C0] border border-[#0077C0]/30">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold text-[#0077c0] font-heading">
                    Rute Aktif
                  </span>
                  <span className="text-xs text-[#0077c0] font-extrabold">
                    • {userLocation.cityName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {userLocation.formattedAddress}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-700 mt-2.5">
              <Shield className="w-4 h-4 text-[#0077c0] mt-0.5 shrink-0" />
              <span>
                <strong className="text-slate-900">Panduan Rute Presisi:</strong> Pantauan arus real-time & Zona Selamat Sekolah (ZOSS) Korlantas Polri.
              </span>
            </div>
          </div>

          <button
            onClick={() => sound.playLevelUp()}
            className="w-full py-2.5 apple-button-primary text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Mulai Navigasi GPS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Traffic Advisory Card */}
        <div className="p-4 sm:p-5 rounded-[18px] apple-card bg-white border-[#0077C0]/25 flex flex-col justify-between space-y-3.5 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 text-[#0F172A] mb-2">
              <AlertCircle className="w-4.5 h-4.5 text-[#0077C0] shrink-0" />
              <h3 className="text-sm font-extrabold text-[#0F172A] tracking-apple-tight">
                Rekomendasi Korlantas ({userLocation.cityName})
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Patuhi batas kecepatan maksimal di kawasan sekolah & permukiman. Gunakan lajur kiri bagi kendaraan roda dua dan selalu berikan isyarat sein sebelum berbelok.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <span className="font-bold text-slate-500">Status Korlantas:</span>
            <span className="text-[#0077c0] font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0077c0] animate-pulse"></span>
              Layanan Siaga Terpadu 110
            </span>
          </div>
        </div>
      </div>

      {/* City Switcher Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
