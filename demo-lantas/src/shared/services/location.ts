// Global & National Location Service with Real-Time Geolocation & Multi-City Support
import { EmergencyFacility, TrafficHotspot, GeoPoint } from '../../core/types';

export interface LocationState {
  latitude: number;
  longitude: number;
  cityName: string;
  subdistrict: string;
  province: string;
  formattedAddress: string;
  isGPS: boolean;
  accuracyMeters?: number;
  timestamp: number;
}

export interface CityPreset {
  id: string;
  name: string;
  province: string;
  coordinates: [number, number]; // [lat, lng]
}

export const INDONESIAN_MAJOR_CITIES: CityPreset[] = [
  { id: 'jkt', name: 'DKI Jakarta', province: 'DKI Jakarta', coordinates: [-6.2088, 106.8456] },
  { id: 'sby', name: 'Surabaya', province: 'Jawa Timur', coordinates: [-7.2575, 112.7521] },
  { id: 'bdg', name: 'Bandung', province: 'Jawa Barat', coordinates: [-6.9175, 107.6191] },
  { id: 'smg', name: 'Semarang', province: 'Jawa Tengah', coordinates: [-6.9667, 110.4167] },
  { id: 'yog', name: 'Yogyakarta', province: 'D.I. Yogyakarta', coordinates: [-7.7956, 110.3695] },
  { id: 'bwi', name: 'Banyuwangi', province: 'Jawa Timur', coordinates: [-8.2215, 114.3646] },
  { id: 'dps', name: 'Denpasar', province: 'Bali', coordinates: [-8.6705, 115.2126] },
  { id: 'mdn', name: 'Medan', province: 'Sumatera Utara', coordinates: [3.5952, 98.6722] },
  { id: 'mks', name: 'Makassar', province: 'Sulawesi Selatan', coordinates: [-5.1477, 119.4327] },
  { id: 'plb', name: 'Palembang', province: 'Sumatera Selatan', coordinates: [-2.9761, 104.7754] },
  { id: 'bpn', name: 'Balikpapan (IKN Hub)', province: 'Kalimantan Timur', coordinates: [-1.2379, 116.8529] },
];

const DEFAULT_LOCATION: LocationState = {
  latitude: -8.2215,
  longitude: 114.3646,
  cityName: 'Banyuwangi',
  subdistrict: 'Taman Blambangan',
  province: 'Jawa Timur',
  formattedAddress: 'Jl. Ahmad Yani, Banyuwangi Kota',
  isGPS: false,
  accuracyMeters: 10,
  timestamp: Date.now(),
};

const STORAGE_KEY = 'sigap_user_location';

export class LocationService {
  private currentLocation: LocationState = DEFAULT_LOCATION;
  private listeners: Set<(loc: LocationState) => void> = new Set();

  constructor() {
    this.loadSavedLocation();
    this.autoDetectLocation();
  }

  private loadSavedLocation() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.currentLocation = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  public getLocation(): LocationState {
    return this.currentLocation;
  }

  public subscribe(callback: (loc: LocationState) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentLocation);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentLocation));
      window.dispatchEvent(new CustomEvent('sigap_location_updated', { detail: this.currentLocation }));
    } catch {
      // ignore
    }
    this.listeners.forEach(cb => cb(this.currentLocation));
  }

  /**
   * Request real browser Geolocation
   */
  public async autoDetectLocation(): Promise<LocationState> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return this.currentLocation;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          const addressInfo = await this.reverseGeocode(lat, lng);

          this.currentLocation = {
            latitude: lat,
            longitude: lng,
            cityName: addressInfo.cityName,
            subdistrict: addressInfo.subdistrict,
            province: addressInfo.province,
            formattedAddress: addressInfo.formattedAddress,
            isGPS: true,
            accuracyMeters: Math.round(accuracy),
            timestamp: Date.now(),
          };

          this.notify();
          resolve(this.currentLocation);
        },
        (error) => {
          console.warn('Geolocation warning / permission dismissed:', error.message);
          resolve(this.currentLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  public static async getCurrentPosition(): Promise<GeoPoint> {
    const loc = await locationService.autoDetectLocation();
    return {
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracyMeters,
      alamat_perkiraan: loc.formattedAddress,
    };
  }

  /**
   * Set location by city preset or custom coordinate
   */
  public async setCity(cityId: string) {
    const preset = INDONESIAN_MAJOR_CITIES.find(c => c.id === cityId);
    if (!preset) return;

    this.currentLocation = {
      latitude: preset.coordinates[0],
      longitude: preset.coordinates[1],
      cityName: preset.name,
      subdistrict: 'Pusat Kota',
      province: preset.province,
      formattedAddress: `${preset.name}, ${preset.province}`,
      isGPS: false,
      accuracyMeters: 50,
      timestamp: Date.now(),
    };

    this.notify();
  }

  public async setCustomCoordinates(lat: number, lng: number, label?: string) {
    const addressInfo = await this.reverseGeocode(lat, lng);
    this.currentLocation = {
      latitude: lat,
      longitude: lng,
      cityName: label || addressInfo.cityName,
      subdistrict: addressInfo.subdistrict,
      province: addressInfo.province,
      formattedAddress: addressInfo.formattedAddress,
      isGPS: false,
      accuracyMeters: 25,
      timestamp: Date.now(),
    };
    this.notify();
  }

  /**
   * Reverse Geocoding with OpenStreetMap Nominatim or nearest city matcher fallback
   */
  private async reverseGeocode(lat: number, lng: number): Promise<{ cityName: string; subdistrict: string; province: string; formattedAddress: string }> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'id,en' }
      });
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city = address.city || address.town || address.county || address.regency || address.state_district || 'Kota Anda';
        const sub = address.suburb || address.neighbourhood || address.village || address.road || 'Area Sekitar';
        const province = address.state || address.region || 'Indonesia';
        const formatted = data.display_name?.split(',').slice(0, 3).join(',') || `${city}, ${province}`;

        return {
          cityName: city.replace(/^(Kabupaten|Kota)\s+/i, ''),
          subdistrict: sub,
          province: province,
          formattedAddress: formatted,
        };
      }
    } catch (e) {
      console.warn('Reverse geocode fallback:', e);
    }

    // Nearest city fallback using distance
    let nearest = INDONESIAN_MAJOR_CITIES[0];
    let minDist = Infinity;
    for (const city of INDONESIAN_MAJOR_CITIES) {
      const d = calculateDistance(lat, lng, city.coordinates[0], city.coordinates[1]);
      if (d < minDist) {
        minDist = d;
        nearest = city;
      }
    }

    return {
      cityName: nearest.name,
      subdistrict: 'Area Anda',
      province: nearest.province,
      formattedAddress: `${nearest.name}, ${nearest.province}`,
    };
  }
}

/**
 * Haversine formula to calculate distance in KM
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generate Dynamic Emergency Facilities & Police Stations around ANY coordinate
 */
export function getNearbyFacilitiesForCoordinates(lat: number, lng: number, cityName: string): EmergencyFacility[] {
  return [
    {
      id: `fac_pol_${lat.toFixed(3)}_${lng.toFixed(3)}`,
      nama: `Polsek & Pos Lantas ${cityName}`,
      tipe: 'polsek',
      alamat: `Jl. Protokol Utama, ${cityName}`,
      nomor_telepon: '110',
      koordinat: [lat + 0.0055, lng + 0.0045],
      jarak_km: 0.8,
      estimasi_menit: 2,
      jam_operasional: 'Buka 24 Jam',
      keterangan: 'Pusat pelayanan kepolisian terpadu & pengawalan lalu lintas 24 jam.',
      layanan_unggulan: ['Piket Lantas 24 Jam', 'Penanganan Laka', 'Patroli Presisi'],
    },
    {
      id: `fac_rs_${lat.toFixed(3)}_${lng.toFixed(3)}`,
      nama: `RSUD / Rumah Sakit IGD ${cityName}`,
      tipe: 'rumah_sakit',
      alamat: `Jl. Kesehatan No. 1, ${cityName}`,
      nomor_telepon: '118 / 119',
      koordinat: [lat - 0.0062, lng + 0.0058],
      jarak_km: 1.2,
      estimasi_menit: 4,
      jam_operasional: 'IGD 24 Jam',
      keterangan: 'Unit Gawat Darurat & Pusat Trauma terintegrasi ambulans darurat.',
      layanan_unggulan: ['IGD Trauma Center', 'Ambulans Siaga', 'P3K Lantas'],
    },
    {
      id: `fac_damkar_${lat.toFixed(3)}_${lng.toFixed(3)}`,
      nama: `Dinas Pemadam Kebakaran & Penyelamatan ${cityName}`,
      tipe: 'damkar',
      alamat: `Jl. Pemuda No. 10, ${cityName}`,
      nomor_telepon: '113',
      koordinat: [lat - 0.0048, lng - 0.0052],
      jarak_km: 1.5,
      estimasi_menit: 5,
      jam_operasional: 'Siaga 24 Jam',
      keterangan: 'Penyelamatan darurat evakuasi kecelakaan dan penanganan insiden.',
      layanan_unggulan: ['Evakuasi Kendaraan', 'Tanggap Darurat Kebakaran', 'Penyelamatan'],
    },
  ];
}

/**
 * Generate Dynamic Traffic Hotspots for any city
 */
export function getNearbyHotspotsForCoordinates(lat: number, lng: number, cityName: string): TrafficHotspot[] {
  return [
    {
      id: `spot_01_${cityName}`,
      nama_jalan: `Pusat Kota & Alun-Alun ${cityName}`,
      wilayah: cityName,
      level_kemacetan: 'ramai_lancar',
      jam_rawan: '06:45–07:45 & 16:30–18:00 WIB',
      penyebab: 'Aktivitas antar-jemput sekolah dan arus pulang kantor.',
      saran_rute: 'Gunakan jalur lingkar luar atau jalan arteri sekunder.',
      kecepatan_rata_rata: '24 km/jam',
      koordinat: [lat + 0.002, lng + 0.002],
      time_slots: ['pagi', 'sore'],
    },
    {
      id: `spot_02_${cityName}`,
      nama_jalan: `Kawasan Niaga & Pertokoan ${cityName}`,
      wilayah: cityName,
      level_kemacetan: 'padat_merayap',
      jam_rawan: '11:30–13:30 & 17:00–19:30 WIB',
      penyebab: 'Parkir bahu jalan dan aktivitas bongkar muat barang.',
      saran_rute: 'Ambil rute alternatif via bypass atau jalur protokol paralel.',
      kecepatan_rata_rata: '16 km/jam',
      koordinat: [lat - 0.003, lng + 0.004],
      time_slots: ['siang', 'sore', 'malam'],
    },
    {
      id: `spot_03_${cityName}`,
      nama_jalan: `Kawasan Zona Selamat Sekolah (ZOSS) ${cityName}`,
      wilayah: cityName,
      level_kemacetan: 'lancar',
      jam_rawan: '06:30–07:15 WIB',
      penyebab: 'Penyeberangan siswa dengan pengawasan Patroli Keamanan Sekolah.',
      saran_rute: 'Batas kecepatan maksimal 30 km/jam, tertib lajur kiri.',
      kecepatan_rata_rata: '30 km/jam',
      koordinat: [lat + 0.006, lng - 0.003],
      time_slots: ['pagi'],
    },
    {
      id: `spot_04_${cityName}`,
      nama_jalan: `Simpang Utama Akses Terminal / Stasiun ${cityName}`,
      wilayah: cityName,
      level_kemacetan: 'ramai_lancar',
      jam_rawan: '07:00–08:30 & 16:00–18:30 WIB',
      penyebab: 'Kepadatan angkutan umum dan kendaraan antar-kota.',
      saran_rute: 'Patuhi lampu APILL & jangan mendahului dari sisi kiri.',
      kecepatan_rata_rata: '22 km/jam',
      koordinat: [lat - 0.005, lng - 0.004],
      time_slots: ['pagi', 'sore'],
    },
  ];
}

export const locationService = new LocationService();
