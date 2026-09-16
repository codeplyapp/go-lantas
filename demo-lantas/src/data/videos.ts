// Konfigurasi Video Edukasi YouTube Keselamatan Berlalu Lintas Korlantas POLRI
export interface VideoConfig {
  id: string;
  youtubeId: string;
  judul: string;
  saluran: string;
  durasiLabel: string;
  searchQuery: string;
  thumbnailFallback: string;
  fallbackSummary: string;
  slides: Array<{
    fase: string;
    judul: string;
    uraian: string;
    poin_kunci: string;
    hukum?: string;
  }>;
}

export const CURRICULUM_VIDEOS: Record<string, VideoConfig> = {
  // Modul 1: Mengenal Rambu
  'lesson_1_1': {
    id: 'lesson_1_1',
    youtubeId: 'W4E_vj8vJ3I', // Edukasi Rambu Lalu Lintas Ditjen Hubdat
    judul: 'Klasifikasi 4 Rambu Utama: Peringatan, Larangan, Perintah, & Petunjuk',
    saluran: 'Ditjen Hubdat & NTMC Korlantas Polri',
    durasiLabel: '5 Menit',
    searchQuery: 'Edukasi Mengenal Rambu Lalu Lintas Peringatan Larangan Perintah Petunjuk',
    thumbnailFallback: 'https://images.unsplash.com/photo-1541890289-b86df5bafd81?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Memahami perbedaan warna dasar rambu: Kuning (Peringatan bahaya), Merah (Larangan tegas), Biru (Perintah wajib), dan Hijau/Cokelat (Petunjuk jurusan & fasilitas).',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Rambu Peringatan (Kuning/Belah Ketupat)',
        uraian: 'Berfungsi memberi peringatan dini kepada pengemudi mengenai adanya potensi bahaya di depan (misal: tikungan tajam, turunan curam, jembatan sempit, perlintasan kereta api sebidang).',
        poin_kunci: 'Wajib kurangi kecepatan dan tingkatkan kewaspadaan visual.',
        hukum: 'Permenhub RI No. 13 Tahun 2014 Pasal 3'
      },
      {
        fase: 'Bagian 2',
        judul: 'Rambu Larangan (Merah-Putih/Lingkaran)',
        uraian: 'Menyatakan perbuatan yang mutlak dilarang bagi pengguna jalan. Contoh: Dilarang Masuk (Verboden), Dilarang Parkir (P coret), Dilarang Putar Balik, dan Batas Kecepatan Maksimal.',
        poin_kunci: 'Pelanggaran rambu larangan dapat dikenai sanksi tilang tilang elektronik (ETLE) atau penindakan langsung.',
        hukum: 'UU No. 22/2009 Pasal 287 Ayat 1'
      },
      {
        fase: 'Bagian 3',
        judul: 'Rambu Perintah (Biru/Lingkaran) & Petunjuk',
        uraian: 'Rambu Biru mewajibkan pengendara mengikuti instruksi (Wajib Masuk Lajur Kiri, Wajib Bundaran). Rambu Hijau/Cokelat memberikan informasi arah kota, fasilitas rumah sakit, dan SPBU.',
        poin_kunci: 'Patuhi arah panah pada rambu biru untuk menjaga kelancaran antrean jalan.',
        hukum: 'UU No. 22/2009 Pasal 106 Ayat 4'
      }
    ]
  },
  'lesson_1_2': {
    id: 'lesson_1_2',
    youtubeId: 'y-XQz0E8x0g',
    judul: 'Rambu Prioritas & Hak Utama di Persimpangan Tanpa Lampu Lalu Lintas',
    saluran: 'NTMC Korlantas Polri',
    durasiLabel: '4 Menit',
    searchQuery: 'Aturan Hak Utama dan Prioritas Persimpangan Korlantas Polri',
    thumbnailFallback: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Aturan hak utama jalan: Kendaraan di jalan utama berhak lebih dulu, kendaraan di bundaran diprioritaskan, dan kendaraan darurat sirine mutlak didahulukan.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Rambu STOP (Segi Delapan Merah)',
        uraian: 'Pengemudi wajib berhenti total minimal 3 detik sebelum garis henti marka putih, mengamati situasi kiri-kanan-depan, dan baru melaju jika persimpangan steril.',
        poin_kunci: 'Berhenti total bukan sekadar melambatkan laju.',
        hukum: 'Permenhub No. 13/2014'
      },
      {
        fase: 'Bagian 2',
        judul: 'Hak Utama di Bundaran Lalu Lintas',
        uraian: 'Kendaraan yang telah masuk dan berada di dalam putaran bundaran memiliki hak utama jalan. Kendaraan yang baru mendekati bundaran wajib melambat dan memberi jalan.',
        poin_kunci: 'Dilarang memotong arus kendaraan di dalam bundaran secara agresif.',
        hukum: 'UU No. 22/2009 Pasal 110'
      },
      {
        fase: 'Bagian 3',
        judul: 'Prioritas Kendaraan Darurat (Sirene)',
        uraian: 'Ambulans membawa pasien gawat darurat, mobil pemadam kebakaran bertugas, dan konvoi pengawalan resmi memiliki hak utama nomor wahid. Pengendara wajib menepi ke kiri.',
        poin_kunci: 'Wajib memberi jalan dan dilarang membuntuti iring-iringan darurat.',
        hukum: 'UU No. 22/2009 Pasal 134 & 135'
      }
    ]
  },

  // Modul 2: Marka Jalan
  'lesson_2_1': {
    id: 'lesson_2_1',
    youtubeId: 'qW9Z0W_L8f4',
    judul: 'Arti Garis Putih & Kuning Utuh vs Putus-putus pada Aspal',
    saluran: 'Kementerian Perhubungan RI',
    durasiLabel: '6 Menit',
    searchQuery: 'Arti Marka Garis Kuning dan Putih Jalan Raya Permenhub',
    thumbnailFallback: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Garis utuh berarti batas tegas dilarang melintas/mendahului karena titik buta (blind spot) atau tikungan berbahaya. Garis putus-putus membolehkan mendahului jika situasi aman.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Garis Putih/Kuning Utuh Tunggal',
        uraian: 'Dilarang keras melintasi atau melindas garis ini untuk mendahului. Marka ini diletakkan pada titik rawan blind spot, tikungan tajam, atau tanjakan berbahaya.',
        poin_kunci: 'Menyalip di garis utuh adalah pemicu utama tabrakan adu banteng (head-on collision).',
        hukum: 'Permenhub No. 67/2018'
      },
      {
        fase: 'Bagian 2',
        judul: 'Garis Kuning pada Jalan Nasional',
        uraian: 'Warna kuning pada marka aspal menandakan bahwa ruas jalan tersebut berstatus sebagai Jalan Nasional (kewenangan pemerintah pusat). Garis putus-putus membolehkan manuver menyalip.',
        poin_kunci: 'Perhatikan kondisi arus berlawanan sebelum melintasi garis putus-putus.',
        hukum: 'Permenhub No. 67/2018'
      },
      {
        fase: 'Bagian 3',
        judul: 'Marka Garis Ganda (Utuh & Putus-putus)',
        uraian: 'Sisi yang berdekatan dengan garis putus-putus diperbolehkan menyalip, sedangkan sisi kendaraan yang berdekatan dengan garis utuh dilarang melintas.',
        poin_kunci: 'Lihat posisi garis terdekat dari sisi lajur kemudi Anda.',
        hukum: 'UU 22/2009 Pasal 287'
      }
    ]
  },
  'lesson_2_2': {
    id: 'lesson_2_2',
    youtubeId: '8h5rJ-qW7l0',
    judul: 'Fasilitas Pejalan Kaki: ZOSS (Zona Selamat Sekolah) & Yellow Box Junction',
    saluran: 'Ditlantas Polda Presisi',
    durasiLabel: '4 Menit',
    searchQuery: 'Edukasi ZOSS Zona Selamat Sekolah dan Yellow Box Junction Korlantas',
    thumbnailFallback: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'ZOSS dengan karpet merah mewajibkan kendaraan menurunkan kecepatan ke maksimal 30 km/jam saat jam sekolah. Yellow Box dilarang dimasuki jika antrean depan belum kosong.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Zona Selamat Sekolah (ZOSS)',
        uraian: 'Area aspal berwarna merah menyala di depan gerbang institusi pendidikan. Seluruh pengemudi wajib membatasi kecepatan maksimal 20-30 km/jam saat jam sibuk antar-jemput siswa.',
        poin_kunci: 'Wajib memberikan prioritas penuh kepada penyeberang jalan anak sekolah.',
        hukum: 'Keputusan Dirjen Hubdat No. SK.3582/AJ.403/DRJD/2018'
      },
      {
        fase: 'Bagian 2',
        judul: 'Yellow Box Junction (YBJ)',
        uraian: 'Kotak bergaris kuning diagonal di tengah persimpangan. Berfungsi mencegah persimpangan terkunci (gridlock). Dilarang masuk ke dalam kotak jika antrean di seberang masih menumpuk.',
        poin_kunci: 'Meskipun lampu hijau menyala, Anda wajib menunggu di luar kotak jika lajur depan macet.',
        hukum: 'UU No. 22/2009 Pasal 287 Ayat 2'
      }
    ]
  },

  // Modul 3: Etika & Budaya Tertib
  'lesson_3_1': {
    id: 'lesson_3_1',
    youtubeId: 'f0W_J3m_r8Y',
    judul: 'Prinsip 3 Detik: Menjaga Jarak Aman Berhenti & Menghindari Tabrak Belakang',
    saluran: 'Defensive Driving Indonesia',
    durasiLabel: '5 Menit',
    searchQuery: 'Prinsip Aturan 3 Detik Jarak Aman Berkendara Defensive Driving',
    thumbnailFallback: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Gunakan patokan tiang/pohon: hitung 3 detik setelah kendaraan depan melewati objek tersebut. Waktu ini memberi ruang reaksi otak (1 detik) dan jarak pengereman mekanis (2 detik).',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Mengapa Jarak Aman Sangat Krusial?',
        uraian: 'Otak manusia membutuhkan rata-rata 0.75 hingga 1 detik untuk menyadari bahaya dan menginjak pedal rem (reaction time). Sistem rem kendaraan butuh 1-2 detik tambahan untuk menghentikan bobot kendaraan.',
        poin_kunci: 'Jarak 1 meter terlalu dekat saat melaju di atas 40 km/jam.',
        hukum: 'PP No. 43/1993 tentang Tata Cara Berlalu Lintas'
      },
      {
        fase: 'Bagian 2',
        judul: 'Cara Mengaplikasikan Hitungan 3 Detik',
        uraian: 'Pilih objek diam di pinggir jalan (tiang listrik, baliho, pohon). Saat mobil depan melewati objek itu, mulai hitung: "Satu-Satu-Ribu, Dua-Satu-Ribu, Tiga-Satu-Ribu". Jika mobil Anda sampai sebelum hitungan selesai, berarti Anda terlalu dekat.',
        poin_kunci: 'Tingkatkan menjadi 4-5 detik saat kondisi jalan basah/hujan licin.',
        hukum: 'Standar Korlantas POLRI'
      }
    ]
  },
  'lesson_3_2': {
    id: 'lesson_3_2',
    youtubeId: 'h9K_lW3mP7Q',
    judul: 'Etika Penggunaan Lampu Sein, Spion, & Klakson Tanpa Emosi',
    saluran: 'Korlantas Polri Presisi',
    durasiLabel: '5 Menit',
    searchQuery: 'Etika Berkendara Lampu Sein Spion dan Klakson Korlantas',
    thumbnailFallback: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Nyalakan lampu sein minimal 30 meter sebelum berbelok atau berpindah lajur. Cek spion dan shoulder check (tengok bahu) untuk memantau blind spot sebelum bermanuver.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Isyarat Lampu Sein (Turn Signal)',
        uraian: 'Nyalakan sein minimal 30 meter sebelum persimpangan atau perpindahan lajur. Memberi waktu bagi pengendara lain di belakang dan depan untuk mengantisipasi gerakan kendaraan.',
        poin_kunci: 'Sein adalah alat komunikasi darat, bukan aksesoris opsional.',
        hukum: 'UU No. 22/2009 Pasal 112'
      },
      {
        fase: 'Bagian 2',
        judul: 'Etika Klakson & Shoulder Check',
        uraian: 'Gunakan klakson pendek (tin-tin) sebagai sapaan santun atau peringatan kewaspadaan di tikungan pegunungan tertutup. Lakukan shoulder check (menoleh singkat) untuk mengecek blind spot spion.',
        poin_kunci: 'Dilarang membunyikan klakson panjang bernada agresif di area ibadah dan rumah sakit.',
        hukum: 'UU No. 22/2009 Pasal 106'
      }
    ]
  },

  // Modul 4: Regulasi UU 22/2009
  'lesson_4_1': {
    id: 'lesson_4_1',
    youtubeId: 'z2M_K7nL9qA',
    judul: 'Hak & Kewajiban Pengendara Menurut UU No. 22 Tahun 2009 (LLAJ)',
    saluran: 'Divisi Humas Polri',
    durasiLabel: '7 Menit',
    searchQuery: 'Penjelasan UU No 22 Tahun 2009 Lalu Lintas dan Angkutan Jalan',
    thumbnailFallback: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Pasal 106 mewajibkan konsentrasi penuh berkendara tanpa pengaruh ponsel/gadget. Pasal 281 & 288 mengatur sanksi bagi pengendara tanpa SIM dan STNK sah.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Kewajiban Konsentrasi Penuh (Pasal 106)',
        uraian: 'Setiap pengemudi wajib mengemudikan kendaraan dengan wajar dan penuh konsentrasi. Menggunakan smartphone, menonton video, atau berkendara di bawah pengaruh alkohol/narkotika adalah pelanggaran berat.',
        poin_kunci: 'Denda maksimal Rp 750.000 atau kurungan 3 bulan.',
        hukum: 'UU No. 22/2009 Pasal 106 Ayat 1 & Pasal 283'
      },
      {
        fase: 'Bagian 2',
        judul: 'Kelengkapan Legalitas (SIM & STNK)',
        uraian: 'Setiap pengemudi kendaraan bermotor wajib memiliki Surat Izin Mengemudi (SIM) yang sah sesuai golongan kendaraan dan membawa Surat Tanda Nomor Kendaraan (STNK) yang masih berlaku.',
        poin_kunci: 'SIM adalah bukti kompetensi keterampilan dan pemahaman etika berlalu lintas.',
        hukum: 'UU No. 22/2009 Pasal 77 & Pasal 281'
      }
    ]
  },
  'lesson_4_2': {
    id: 'lesson_4_2',
    youtubeId: 'p0L_k8W9x7M',
    judul: 'Standar Keselamatan Wajib: Helm SNI Berkancing Klik & Sabuk Pengaman 3 Titik',
    saluran: 'Ditgakkum Korlantas Polri',
    durasiLabel: '4 Menit',
    searchQuery: 'Pentingnya Helm SNI Klik dan Sabuk Pengaman Korlantas Polri',
    thumbnailFallback: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Helm SNI mengurangi risiko fatalitas benturan kepala hingga 70%. Pastikan tali pengikat berbunyi KLIK dan tali tidak kendur lebih dari 1 jari di bawah dagu.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Helm Berstandar SNI (Kancing "KLIK")',
        uraian: 'Pengemudi dan penumpang sepeda motor wajib mengenakan helm standar nasional Indonesia (SNI) dengan tali pengunci terkunci sempurna sampai berbunyi "KLIK".',
        poin_kunci: 'Helm tanpa kancing berisiko terlepas saat terjadi benturan pertama.',
        hukum: 'UU No. 22/2009 Pasal 106 Ayat 8 & Pasal 291'
      },
      {
        fase: 'Bagian 2',
        judul: 'Sabuk Keselamatan 3 Titik (Seatbelt)',
        uraian: 'Pengemudi dan penumpang di jok depan maupun belakang mobil wajib memakai sabuk pengaman 3 titik. Mencegah tubuh terlempar ke kaca depan saat terjadi pengereman darurat.',
        poin_kunci: 'Sabuk pengaman menahan gaya inersia tubuh pengendara.',
        hukum: 'UU No. 22/2009 Pasal 106 Ayat 6 & Pasal 289'
      }
    ]
  },

  // Modul 5: Kesehatan & Defensive Driving
  'lesson_5_1': {
    id: 'lesson_5_1',
    youtubeId: 'm3N_p8Q4v2K',
    judul: 'Bahaya Microsleep: Mengenali Tanda Kelelahan & Mengatasinya',
    saluran: 'Pusat Kedokteran Lalu Lintas',
    durasiLabel: '6 Menit',
    searchQuery: 'Bahaya Microsleep Saat Berkendara dan Cara Mencegahnya',
    thumbnailFallback: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Microsleep adalah tidur singkat 2-15 detik saat mata terbuka. Mengantuk tidak bisa dilawan dengan kopi atau musik keras; satu-satunya obat adalah menepi dan tidur power nap 15-20 menit.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Gejala & Tanda Awal Microsleep',
        uraian: 'Mata berkedip lebih lambat dari biasanya, menguap berulang kali, kepala tersentak tiba-tiba, dan tanpa sadar kendaraan bergeser keluar dari lajur marka jalan.',
        poin_kunci: 'Pada kecepatan 80 km/jam, tidur 3 detik sama dengan melaju tanpa kendali sejauh 66 meter!',
        hukum: 'Pedoman Keselamatan Ditkamsel Korlantas'
      },
      {
        fase: 'Bagian 2',
        judul: 'Solusi Medis yang Terbukti: Power Nap',
        uraian: 'Kopi, minuman berenergi, atau membuka jendela hanya memberi stimulus palsu selama 5-10 menit. Solusi mutlak adalah mencari rest area/SPBU terdekat dan tidur singkat (power nap) 15-20 menit.',
        poin_kunci: 'Tidur 20 menit menyegarkan kembali fungsi kognitif otak.',
        hukum: 'Kemenkes & Korlantas Road Safety'
      }
    ]
  },
  'lesson_5_2': {
    id: 'lesson_5_2',
    youtubeId: 'v8J_r3N9q1L',
    judul: 'Defensive Driving: Mengantisipasi Kesalahan Pengendara Lain',
    saluran: 'Indonesian Road Safety Forum',
    durasiLabel: '5 Menit',
    searchQuery: 'Konsep Defensive Driving Mengantisipasi Bahaya Jalan Raya',
    thumbnailFallback: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Selalu berasumsi pengendara di sekitar Anda mungkin berbuat salah (tidak menyalakan sein, berhenti mendadak). Selalu sediakan ruang melarikan diri (escape route) di depan dan samping kendaraan.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Prinsip Dasar Defensive Driving',
        uraian: 'Berkendara bukan hanya tentang keterampilan mengendalikan gas dan rem, melainkan sikap proaktif mengantisipasi potensi kesalahan pengendara lain atau kondisi cuaca buruk.',
        poin_kunci: 'Lebih baik mengalah dan memberi jalan daripada mempertahankan ego benar di jalan raya.',
        hukum: 'Safety Driving Standard'
      },
      {
        fase: 'Bagian 2',
        judul: 'Sediakan Ruang Luput (Escape Route)',
        uraian: 'Saat berhenti di lampu merah atau kemacetan, sisakan jarak visual di mana Anda masih bisa melihat ban belakang kendaraan di depan Anda. Ruang ini memungkinkan Anda bermanuver jika mobil belakang blong.',
        poin_kunci: 'Jangan biarkan kendaraan Anda terjepit tanpa celah evakuasi.',
        hukum: 'Defensive Driving Global Standard'
      }
    ]
  },

  // Modul 6: Darurat & Pertolongan
  'lesson_6_1': {
    id: 'lesson_6_1',
    youtubeId: 'x7K_m2N8p0Q',
    judul: 'Tindakan Pertama di TKP Kecelakaan: Amankan, Laporkan, & Jangan Panik',
    saluran: 'Call Center 110 & Basarnas',
    durasiLabel: '6 Menit',
    searchQuery: 'Pertolongan Pertama Kecelakaan Lalu Lintas DRABC Korlantas',
    thumbnailFallback: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Langkah DRABC: Danger (pastikan TKP aman dari lalu lintas), Response (cek kesadaran), Airway & Breathing. Hubungi 110 Polri dan 118/119 Ambulans sebelum memindahkan korban cedera leher/tulang belakang.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Prinsip D-R-A-B-C Tanggap Darurat',
        uraian: 'D (Danger): Amankan TKP agar tidak terjadi tabrakan beruntun. Pasang segitiga pengaman 30 meter. R (Response): Cek respon korban. A (Airway): Pastikan jalan napas tidak tersumbat.',
        poin_kunci: 'Dilarang memindahkan korban yang dicurigai cedera leher/tulang belakang sembarangan.',
        hukum: 'Palang Merah Indonesia & Korlantas POLRI'
      },
      {
        fase: 'Bagian 2',
        judul: 'Kewajiban Pengemudi di TKP Laka (Pasal 231)',
        uraian: 'Pengemudi yang terlibat kecelakaan wajib segera menghentikan kendaraannya, memberikan pertolongan pertama kepada korban, dan melaporkan kejadian ke kantor polisi terdekat.',
        poin_kunci: 'Menabrak dan melarikan diri (tabrak lari) adalah tindak pidana kejahatan berat.',
        hukum: 'UU No. 22/2009 Pasal 231 & Pasal 312'
      }
    ]
  },
  'lesson_6_2': {
    id: 'lesson_6_2',
    youtubeId: 'w2N_x8M9q0P',
    judul: 'Prosedur Evakuasi Korban & Integrasi Sinyal Darurat SIGAP Korlantas',
    saluran: 'Polda Jatim Road Safety',
    durasiLabel: '5 Menit',
    searchQuery: 'Tombol SOS Darurat Integrasi Command Center Polri 110',
    thumbnailFallback: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&auto=format&fit=crop&q=80',
    fallbackSummary: 'Gunakan tombol darurat SOS SIGAP untuk memancarkan koordinat GPS telemetri presisi ke Command Center 110 Polri. Amankan barang bukti dan pasang segitiga pengaman 30 meter di belakang kendaraan.',
    slides: [
      {
        fase: 'Bagian 1',
        judul: 'Aktivasi SOS Center SIGAP POLRI',
        uraian: 'Aplikasi SIGAP terhubung langsung dengan sistem telemetri Command Center 110 Korlantas POLRI dan Unit Reaksi Cepat Patroli Jalan Raya terdekat dengan koordinat presisi.',
        poin_kunci: 'Patroli terdekat akan diarahkan ke titik koordinat Anda dalam hitungan menit.',
        hukum: 'Standar Operasional Presisi POLRI'
      },
      {
        fase: 'Bagian 2',
        judul: 'Klaim Jaminan Medis PT Jasa Raharja',
        uraian: 'Korban kecelakaan lalu lintas jalan dijamin biaya perawatan rumah sakit oleh PT Jasa Raharja (Persero) berdasarkan laporan polisi resmi (LP).',
        poin_kunci: 'Segera urus Laporan Polisi di Unit Laka Lantas setempat untuk jaminan rumah sakit.',
        hukum: 'UU No. 33 & 34 Tahun 1964'
      }
    ]
  },
};
