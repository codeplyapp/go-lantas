// Mascot Metadata and Configuration for SIGAP

export const MASCOT_CONFIG = {
  id: 'sigap-ai-bot',
  name: 'Si SIGAP',
  title: 'Asisten AI Keselamatan Korlantas Polri',
  avatarUrl: '/mascot/mascot.svg',
  fallbackAvatarUrl: '/mascot/mascot.svg',
  welcomeGreeting: 'Halo Sahabat SIGAP! Saya Si SIGAP, asisten cerdas lalu lintas Anda. Ada info rute Banyuwangi, aturan SIM, atau edukasi lantas yang ingin ditanyakan?',
  shortGreeting: 'Siap membantu perjalanan amanmu!',
  quickSuggestions: [
    { label: '🚦 Macet di Gajah Mada?', prompt: 'Bagaimana kondisi kemacetan di Jalan Gajah Mada Banyuwangi saat ini dan apa rute alternatifnya?' },
    { label: '🛵 Rute aman ke sekolah?', prompt: 'Rekomendasikan rute aman dan tips berkendara untuk pelajar di seputar Banyuwangi.' },
    { label: '💥 Kasus kecelakaan baru?', prompt: 'Berikan informasi simulasi kasus kecelakaan terkini di Banyuwangi dan faktor penyebabnya untuk bahan evaluasi.' },
    { label: '👮 Apa itu Korlantas Polri?', prompt: 'Jelaskan tugas pokok Korlantas Polri dan peran kepolisian lalu lintas dalam melindungi generasi muda.' },
    { label: '🪖 Aturan helm SNI & Pasal UU?', prompt: 'Apa pasal UU No. 22 Tahun 2009 tentang kewajiban penggunaan helm SNI bagi pengendara dan pembonceng?' },
  ]
};
