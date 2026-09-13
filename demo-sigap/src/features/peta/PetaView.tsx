import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Clock, AlertTriangle, Compass, ShieldCheck, 
  Layers, WifiOff, Eye, Navigation 
} from 'lucide-react';
import { 
  BANYUWANGI_CENTER, BANYUWANGI_HOTSPOTS, 
  BANYUWANGI_INCIDENTS, BANYUWANGI_SAFE_ROUTES 
} from '../../data/banyuwangi_traffic';
import { TimeSlot, TrafficHotspot } from '../../core/types';
import { sound } from '../../shared/services/sound';

// Custom Leaflet Icons using SVG Data URIs
const createCustomIcon = (color: string, iconSymbol: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${iconSymbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const incidentIcon = createCustomIcon('#ef4444', '⚠️');
const schoolSafeIcon = createCustomIcon('#10b981', '🏫');

export const PetaView: React.FC = () => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('pagi');
  const [activeLayer, setActiveLayer] = useState<'semua' | 'macet' | 'rute_aman' | 'insiden'>('semua');
  const [isOfflineSimulation, setIsOfflineSimulation] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<TrafficHotspot | null>(null);

  const timeSlots: { id: TimeSlot; label: string; time: string }[] = [
    { id: 'pagi', label: 'Pagi', time: '07:00 (Sekolah)' },
    { id: 'siang', label: 'Siang', time: '13:00 (Makan)' },
    { id: 'sore', label: 'Sore', time: '17:30 (Pulang)' },
    { id: 'malam', label: 'Malam', time: '21:00 (Santai)' },
  ];

  // Filter hotspots active in selected time slot
  const currentHotspots = BANYUWANGI_HOTSPOTS.filter(spot => 
    spot.time_slots.includes(selectedTimeSlot)
  );

  const getHotspotColor = (level: string) => {
    switch (level) {
      case 'lancar': return '#10b981';
      case 'ramai_lancar': return '#3b82f6';
      case 'padat_merayap': return '#f59e0b';
      case 'macet_total': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  // Coordinates for the safe student route (Taman Blambangan -> SMAN 1 Giri)
  const safeRouteCoords: [number, number][] = [
    [-8.2185, 114.3685], // Taman Blambangan
    [-8.2160, 114.3675], // Jl. Veteran
    [-8.2120, 114.3650], // Jl. HOS Cokroaminoto
    [-8.2085, 114.3625], // SMAN 1 Giri
  ];

  return (
    <div className="space-y-3 pb-20 animate-fadeIn">
      {/* 1. Header & Time Slot Bar */}
      <div className="p-3.5 rounded-2xl glass-card border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-heading font-extrabold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              Peta Kemacetan Banyuwangi
            </h2>
            <p className="text-[10px] text-slate-300">
              Data terintegrasi ruas jalan, titik rawan laka & rute aman pelajar
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsOfflineSimulation(prev => !prev);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
              isOfflineSimulation 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            {isOfflineSimulation ? 'Mode Offline' : 'Online'}
          </button>
        </div>

        {/* Time Slot Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => {
                sound.playClick();
                setSelectedTimeSlot(slot.id);
              }}
              className={`p-1.5 rounded-xl text-center border transition-all ${
                selectedTimeSlot === slot.id
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] font-bold">{slot.label}</span>
              <span className="block text-[9px] opacity-80">{slot.time.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Leaflet Map Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl">
        <MapContainer
          center={BANYUWANGI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          {/* CartoDB Voyager / OpenStreetMap Clean Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | Korlantas Polri'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Traffic Hotspots as Pulse Circles */}
          {(activeLayer === 'semua' || activeLayer === 'macet') &&
            currentHotspots.map(spot => (
              <React.Fragment key={spot.id}>
                <CircleMarker
                  center={spot.koordinat}
                  radius={20}
                  pathOptions={{
                    color: getHotspotColor(spot.level_kemacetan),
                    fillColor: getHotspotColor(spot.level_kemacetan),
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedHotspot(spot),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-900 space-y-1 text-xs">
                      <h4 className="font-bold text-sm text-slate-950">{spot.nama_jalan}</h4>
                      <p className="font-semibold text-blue-700 capitalize">
                        Status: {spot.level_kemacetan.replace('_', ' ')} (~{spot.kecepatan_rata_rata})
                      </p>
                      <p className="text-[11px] text-slate-700">{spot.penyebab}</p>
                      <div className="pt-1 border-t border-slate-200 text-emerald-800 font-medium">
                        💡 <strong>Saran Rute:</strong> {spot.saran_rute}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>

                <Marker
                  position={spot.koordinat}
                  icon={createCustomIcon(getHotspotColor(spot.level_kemacetan), '🚦')}
                />
              </React.Fragment>
            ))}

          {/* Incidents Layer */}
          {(activeLayer === 'semua' || activeLayer === 'insiden') &&
            BANYUWANGI_INCIDENTS.map(inc => (
              <Marker
                key={inc.id}
                position={inc.koordinat}
                icon={incidentIcon}
              >
                <Popup>
                  <div className="p-1 text-slate-900 space-y-1 text-xs">
                    <span className="font-bold text-red-600 block">{inc.judul}</span>
                    <p className="text-[11px] text-slate-700">{inc.deskripsi}</p>
                    <span className="text-[10px] text-slate-500 block">Waktu: {inc.waktu}</span>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Safe Route Polyline (Green Highway) */}
          {(activeLayer === 'semua' || activeLayer === 'rute_aman') && (
            <>
              <Polyline
                positions={safeRouteCoords}
                pathOptions={{
                  color: '#10b981',
                  weight: 5,
                  dashArray: '8, 8',
                  opacity: 0.9,
                }}
              />
              <Marker
                position={[-8.2085, 114.3625]}
                icon={schoolSafeIcon}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong className="text-emerald-700 block">🏫 Kawasan SMAN 1 Giri</strong>
                    <span>Titik Akhir Rute Pelajar Hijau (ZOSS berpemandu)</span>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        {/* Offline Cache Overlay Banner if active */}
        {isOfflineSimulation && (
          <div className="absolute top-2 left-2 right-2 z-[400] p-2 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center justify-between backdrop-blur-md">
            <span className="flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" />
              Menampilkan data kemacetan dari cache lokal (Offline-Ready)
            </span>
          </div>
        )}

        {/* Layer Filter Floating Buttons */}
        <div className="absolute bottom-3 left-3 z-[400] flex gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setActiveLayer('semua')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeLayer === 'semua' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveLayer('macet')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeLayer === 'macet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Macet
          </button>
          <button
            onClick={() => setActiveLayer('rute_aman')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              activeLayer === 'rute_aman' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Rute Aman
          </button>
        </div>
      </div>

      {/* 3. Safe Route Spotlight Details */}
      <div className="p-3.5 rounded-2xl glass-card border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white">
              Rute Aman Pelajar (Zona Selamat Sekolah)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            3.4 KM • 8 Mnt
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {BANYUWANGI_SAFE_ROUTES[0].rekomendasi}
        </p>
      </div>
    </div>
  );
};
