import React, { useState } from 'react';
import { Palette, Navigation } from 'lucide-react';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { Card } from '../../../shared/components/Card';
import { FieldRow } from '../../../shared/components/FieldRow';
import { Toggle } from '../../../shared/components/Toggle';
import { NotificationService } from '../../../shared/services/notification';
import { sound } from '../../../shared/services/sound';

export const SettingsSection: React.FC = () => {
  const [isLocationActive, setIsLocationActive] = useState(true);

  return (
    <div>
      <SectionHeader title="PENGATURAN" />
      <Card noPadding className="divide-y divide-slate-100">
        {/* 1. Tema */}
        <FieldRow
          icon={<Palette className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Tema Aplikasi"
          subtitle="Mode Terang (Apple Clean Snow)"
          showChevron={false}
          trailing={
            <Toggle
              checked={true}
              onChange={() => {
                NotificationService.showInAppToast(
                  'Tema Terang Aktif',
                  'Aplikasi Go Lantas dioptimalkan pada mode Apple Clean Snow untuk visibilitas berkendara terbaik.',
                  'info'
                );
              }}
            />
          }
        />

        {/* 2. Izin Lokasi */}
        <FieldRow
          icon={<Navigation className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Izin Lokasi (GPS Presisi)"
          subtitle="Akurasi SOS darurat & navigasi rute aman"
          showChevron={false}
          trailing={
            <Toggle
              checked={isLocationActive}
              onChange={(checked) => {
                setIsLocationActive(checked);
                sound.playClick();
                NotificationService.showInAppToast(
                  checked ? 'GPS Aktif' : 'GPS Dinonaktifkan',
                  checked
                    ? 'Layanan penentuan lokasi presisi Go Lantas siap digunakan.'
                    : 'Fitur SOS dan peta akan menggunakan estimasi titik terakhir.',
                  'info'
                );
              }}
            />
          }
        />
      </Card>
    </div>
  );
};
