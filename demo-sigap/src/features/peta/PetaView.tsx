import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, ShieldCheck, WifiOff 
} from 'lucide-react';
import { 
  BANYUWANGI_CENTER, BANYUWANGI_HOTSPOTS, 
  BANYUWANGI_INCIDENTS, BANYUWANGI_SAFE_ROUTES 
} from '../../data/banyuwangi_traffic';
import { TimeSlot } from '../../core/types';
import { sound } from '../../shared/services/sound';

const createCustomIcon = (color: string, iconSymbol: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45);
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

  const timeSlots: { id: TimeSlot; label: string; time: string }[] = [
    { id: 'pagi', label: 'Pagi', time: '07:00' },
    { id: 'siang', label: 'Siang', time: '13:00' },
    { id: 'sore', label: 'Sore', time: '17:30' },
    { id: 'malam', label: 'Malam', time: '21:00' },
  ];

  const currentHotspots = BANYUWANGI_HOTSPOTS.filter(spot => 
    spot.time_slots.includes(selectedTimeSlot)
  );

  const getHotspotColor = (level: string) => {
    switch (level) {
      case 'lancar': return '#10b981';
      case 'ramai_lancar': return '#0066cc';
      case 'padat_merayap': return '#f59e0b';
      case 'macet_total': return '#ef4444';
      default: return '#0066cc';
    }
  };

  const safeRouteCoords: [number, number][] = [
    [-8.2185, 114.3685], // Taman Blambangan
    [-8.2160, 114.3675], // Jl. Veteran
    [-8.2120, 114.3650], // Jl. HOS Cokroaminoto
    [-8.2085, 114.3625], // SMAN 1 Giri
  ];

  return (
    <div className="space-y-3 pb-20 animate-fadeIn">
      {/* 1. Header & Segmented Time Slot Bar */}
      <div className="p-4.5 rounded-[18px] apple-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-heading font-bold text-white tracking-apple-tight flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-400" />
              Peta Kemacetan Banyuwangi
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Data terintegrasi ruas jalan, titik rawan laka & rute aman pelajar
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsOfflineSimulation(prev => !prev);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all btn-press flex items-center gap-1 ${
              isOfflineSimulation 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            {isOfflineSimulation ? 'Offline' : 'Online'}
          </button>
        </div>

        {/* Time Slot Segmented Pills */}
        <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => {
                sound.playClick();
                setSelectedTimeSlot(slot.id);
              }}
              className={`py-1.5 rounded-full text-center transition-all btn-press ${
                selectedTimeSlot === slot.id
                  ? 'bg-[#0066cc] text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <span className="block text-xs">{slot.label}</span>
              <span className="block text-[9px] opacity-75">{slot.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Leaflet Map Container */}
      <div className="relative w-full h-80 rounded-[20px] overflow-hidden apple-card shadow-2xl border border-white/10">
        <MapContainer
          center={BANYUWANGI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | Korlantas Polri'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Traffic Hotspots Circles */}
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

          {/* Safe Route Polyline */}
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

        {/* Offline Cache Overlay */}
        {isOfflineSimulation && (
          <div className="absolute top-3 left-3 right-3 z-[400] p-2.5 rounded-full bg-[#060b18]/90 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Menampilkan data kemacetan dari cache lokal (Offline-Ready)</span>
          </div>
        )}

        {/* Layer Filter Floating Bar */}
        <div className="absolute bottom-3 left-3 z-[400] flex gap-1.5 bg-[#060b18]/90 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveLayer('semua')}
            className={`px-3 py-1 rounded-full text-xs font-semibold btn-press ${
              activeLayer === 'semua' ? 'bg-[#0066cc] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveLayer('macet')}
            className={`px-3 py-1 rounded-full text-xs font-semibold btn-press ${
              activeLayer === 'macet' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Macet
          </button>
          <button
            onClick={() => setActiveLayer('rute_aman')}
            className={`px-3 py-1 rounded-full text-xs font-semibold btn-press ${
              activeLayer === 'rute_aman' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rute Aman
          </button>
        </div>
      </div>

      {/* 3. Safe Route Details Card */}
      <div className="p-4.5 rounded-[18px] apple-card border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold text-white tracking-apple-tight">
              Rute Aman Pelajar (Zona Selamat Sekolah)
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
