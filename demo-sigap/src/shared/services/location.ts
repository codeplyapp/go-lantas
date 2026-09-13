// Browser Geolocation Service with Realistic Banyuwangi Context Fallback

import { GeoPoint } from '../../core/types';

export const LocationService = {
  async getCurrentPosition(): Promise<GeoPoint> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              alamat_perkiraan: `Koordinat GPS Presisi: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`,
            });
          },
          () => {
            // Fallback to Banyuwangi Kota coordinates if user denies or browser environment has no GPS
            resolve({
              latitude: -8.2192,
              longitude: 114.3692,
              accuracy: 10,
              alamat_perkiraan: 'Jl. Simpang Lima, Banyuwangi Kota (Simulasi GPS)',
            });
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        resolve({
          latitude: -8.2192,
          longitude: 114.3692,
          accuracy: 10,
          alamat_perkiraan: 'Simpang Lima Banyuwangi (Simulasi Default)',
        });
      }
    });
  }
};
