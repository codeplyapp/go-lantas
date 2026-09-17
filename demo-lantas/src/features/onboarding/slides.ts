export interface OnboardingSlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  mascotUrl: string;
  mascotSide: 'left' | 'right';
  robotSpeech: string;
  robotTapReactions: string[];
  factPill: string;
  triviaDetail: string;
  badge: string;
  bgGradient: string;
  accentColor: string;
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 1,
    badge: 'Pelopor Keselamatan',
    title: 'Kenalan dengan GO Lantas',
    subtitle: 'Sahabat Edukasi Lalu Lintas Generasi Muda',
    description: 'Pelajari etika berkendara, kenali rambu lalu lintas nasional, dan jadilah pelopor keselamatan di jalan raya bersama Korlantas POLRI.',
    mascotUrl: '/mascot/mascot_point.png',
    mascotSide: 'left',
    robotSpeech: 'Halo! Aku Go Lantas, siap membimbingmu jadi pelopor tertib lalu lintas!',
    robotTapReactions: [
      'Siap belajar etika berkendara bareng Korlantas POLRI!',
      'Ingat selalu klik helm SNI sebelum jalan ya!',
      'Yuk mulai petualangan keselamatan kita!'
    ],
    factPill: '🔥 Kuis, modul, & simulasi ujian SIM',
    triviaDetail: 'Helm berstandar SNI dengan tali terkunci "KLIK" terbukti menurunkan risiko cedera fatal hingga 70%!',
    bgGradient: 'from-[#C7EEFF]/30 via-[#E0F2FE]/20 to-white',
    accentColor: '#0077C0',
  },
  {
    id: 2,
    badge: 'Kurikulum Terpadu',
    title: 'Belajar Seru, Teman Aman',
    subtitle: 'Kuasai 6 Modul & Dapatkan Sertifikat Kelulusan',
    description: 'Eksplorasi materi interaktif, latihan flashcard rambu, studi kasus nyata, dan raih skor tertinggi di papan peringkat nasional.',
    mascotUrl: '/mascot/mascot_chest.png',
    mascotSide: 'right',
    robotSpeech: 'Selesaikan 6 modul seru & dapatkan sertifikat resmi dari Korlantas!',
    robotTapReactions: [
      'Ada kuis harian dan flashcard rambu interaktif!',
      'Kumpulkan XP tertinggi di papan peringkat nasional!',
      'Sertifikat digital resmi dilengkapi QR Code verifikasi!'
    ],
    factPill: '🎯 6 Modul • Standar Kelulusan 80%',
    triviaDetail: 'Selesaikan seluruh 6 modul kurikulum dan dapatkan Sertifikat Kelulusan Digital resmi ber-QR code dari Korlantas POLRI!',
    bgGradient: 'from-[#BAE6FD]/30 via-[#E0F2FE]/20 to-white',
    accentColor: '#0284C7',
  },
  {
    id: 3,
    badge: 'Asisten Presisi & Tanggap Cepat',
    title: 'Pendamping Edukasi & Darurat 110',
    subtitle: 'Informasi Rute Aman & Bantuan Darurat Terpadu',
    description: 'Tanya asisten seputar pasal undang-undang dan titik rawan macet, serta akses tombol SOS darurat Satlantas 24/7.',
    mascotUrl: '/mascot/mascot_salute.png',
    mascotSide: 'left',
    robotSpeech: 'Asisten keselamatan & tombol darurat 110 siap siaga menjagamu 24 jam penuh!',
    robotTapReactions: [
      'Hotline 110 terintegrasi dengan koordinat GPS akurat!',
      'Tanyakan rute aman sekolah dan pasal undang-undang kapan saja!',
      'Hormat Presisi! Keselamatanmu adalah prioritas nomor satu.'
    ],
    factPill: '🚨 Tombol SOS Tahan 3 Detik',
    triviaDetail: 'Tombol SOS GO Lantas terintegrasi dengan Hotline Polri 110 dan mengirimkan koordinat GPS Anda secara akurat saat keadaan darurat.',
    bgGradient: 'from-[#FEF3C7]/40 via-[#E0F2FE]/20 to-white',
    accentColor: '#D97706',
  },
];

