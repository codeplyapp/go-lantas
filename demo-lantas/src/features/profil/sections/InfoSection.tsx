import React, { useState } from 'react';
import { HelpCircle, ShieldCheck, PhoneCall, ChevronDown, Phone, MapPin, ExternalLink, Mail } from 'lucide-react';
import { SectionHeader } from '../../../shared/components/SectionHeader';
import { Card } from '../../../shared/components/Card';
import { FieldRow } from '../../../shared/components/FieldRow';
import { Sheet } from '../../../shared/components/Sheet';
import { Btn } from '../../../shared/components/Btn';

const FAQ_ITEMS = [
  {
    q: 'Apa itu aplikasi Go Lantas Korlantas POLRI?',
    a: 'Go Lantas adalah platform keselamatan berlalu lintas terintegrasi yang dirancang untuk pelajar, mahasiswa, dan orang tua. Aplikasi ini menggabungkan edukasi gamifikasi, pemantauan rute keluarga, sinyal SOS darurat, dan asisten virtual Go Lantas.',
  },
  {
    q: 'Bagaimana cara kerja fitur pemantauan keluarga?',
    a: 'Pemantauan keluarga menggunakan sistem kode pairing unik dengan persetujuan ganda (dual-consent). Lokasi hanya dibagikan secara real-time saat fitur aktif dan dilindungi kepatuhan UU No. 27/2022 tentang Pelindungan Data Pribadi.',
  },
  {
    q: 'Apakah tombol SOS langsung terhubung ke kepolisian?',
    a: 'Ya. Tombol SOS mentransmisikan koordinat GPS presisi dan informasi pelapor ke Command Center Korlantas / Satlantas Polresta Banyuwangi untuk penanganan respon cepat di lapangan.',
  },
  {
    q: 'Bagaimana cara meningkatkan poin dan peringkat leaderboard?',
    a: 'Poin dapat diperoleh dengan menyelesaikan kuis harian, mematuhi rute aman, dan mempertahankan streak kedisiplinan setiap hari.',
  },
];

export const InfoSection: React.FC = () => {
  const [activeSheet, setActiveSheet] = useState<'faq' | 'privacy' | 'contact' | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <div>
      <SectionHeader title="EDUKASI & INFORMASI" />
      <Card noPadding className="divide-y divide-slate-100">
        {/* 1. FAQ */}
        <FieldRow
          icon={<HelpCircle className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="FAQ Keselamatan"
          subtitle="Tanya jawab aturan, SIM, & operasional"
          onClick={() => setActiveSheet('faq')}
        />

        {/* 2. Kebijakan Privasi */}
        <FieldRow
          icon={<ShieldCheck className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Kebijakan Privasi (UU PDP)"
          subtitle="Retensi data 30 hari & hak perlindungan privasi"
          onClick={() => setActiveSheet('privacy')}
        />

        {/* 3. Hubungi Kami */}
        <FieldRow
          icon={<PhoneCall className="w-4 h-4" />}
          iconBgColor="bg-[#0077c0]/10"
          iconTextColor="text-[#0077c0]"
          title="Hubungi Kami"
          subtitle="Layanan Kepolisian 110 & Satlantas Banyuwangi"
          onClick={() => setActiveSheet('contact')}
        />
      </Card>

      {/* 1. FAQ Sheet */}
      <Sheet
        isOpen={activeSheet === 'faq'}
        onClose={() => setActiveSheet(null)}
        title="FAQ Keselamatan Berlalu Lintas"
        subtitle="Panduan komprehensif seputar fitur dan aturan berkendara"
      >
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50 transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100/60 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openFaqIdx === idx ? 'rotate-180 text-[#0077c0]' : ''
                  }`}
                />
              </button>

              {openFaqIdx === idx && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Sheet>

      {/* 2. Privacy Policy Sheet */}
      <Sheet
        isOpen={activeSheet === 'privacy'}
        onClose={() => setActiveSheet(null)}
        title="Kebijakan Privasi & Perlindungan Data"
        subtitle="Kepatuhan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0077c0]/10 text-[#0077c0] font-bold text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Kerahasiaan data Anda dilindungi standar Korlantas POLRI Presisi.</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Prinsip Persetujuan Ganda (Dual Consent)</h4>
            <p>
              Pelacakan lokasi anggota keluarga hanya berjalan jika kedua belah pihak (Anak & Orang Tua) memberikan persetujuan eksplisit melalui kode pairing. Persetujuan dapat dicabut sewaktu-waktu.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Retensi Data Lokasi Terbatas (30 Hari)</h4>
            <p>
              Data riwayat perjalanan dan telemetri lokasi otomatis dihapus permanen dari sistem setelah melewati batas waktu retensi 30 hari kalender.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Hak Subjek Data (Hak untuk Dihapus)</h4>
            <p>
              Pengguna berhak penuh meminta penghapusan seluruh data identitas, log aktivitas, dan skor kuis melalui tombol Reset Data di halaman Profil.
            </p>
          </div>
        </div>
      </Sheet>

      {/* 3. Contact Sheet */}
      <Sheet
        isOpen={activeSheet === 'contact'}
        onClose={() => setActiveSheet(null)}
        title="Pusat Bantuan & Kontak Layanan"
        subtitle="Layanan darurat kepolisian dan pengaduan masyarakat"
      >
        <div className="space-y-3.5">
          {/* 110 Call Center */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-extrabold text-sm">
                110
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Layanan Polisi Bebas Pulsa</p>
                <p className="text-[11px] text-slate-500">Siaga 24 Jam Reaksi Cepat</p>
              </div>
            </div>
            <a
              href="tel:110"
              className="py-2 px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Panggil</span>
            </a>
          </div>

          {/* Satlantas Polresta Banyuwangi */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#0077c0] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Satuan Lalu Lintas Polresta Banyuwangi
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Jl. Letkol Istiqlah No. 42, Singonegaran, Banyuwangi, Jawa Timur
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Telepon: (0333) 421110</span>
              <span className="font-bold text-[#0077c0]">Unit Reaksi Cepat</span>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
};
