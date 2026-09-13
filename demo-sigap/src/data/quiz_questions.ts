import { QuizQuestion, QuizLevelInfo } from '../core/types';

export const QUIZ_LEVELS: QuizLevelInfo[] = [
  {
    level: 1,
    judul: 'Level 1: Rambu Lalu Lintas',
    kategori: 'rambu',
    deskripsi: 'Kenali arti rambu peringatan, larangan, perintah, dan petunjuk jalan.',
    icon_name: 'AlertTriangle',
    min_poin_unlock: 0,
    total_soal: 6,
    warna_tema: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  },
  {
    level: 2,
    judul: 'Level 2: Marka Jalan & Hak Utama',
    kategori: 'marka',
    deskripsi: 'Pahami garis jalan, hak utama di bundaran, persimpangan, dan zebra cross.',
    icon_name: 'Navigation',
    min_poin_unlock: 80,
    total_soal: 6,
    warna_tema: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
  },
  {
    level: 3,
    judul: 'Level 3: Etika & Defensive Driving',
    kategori: 'etika',
    deskripsi: 'Sikap mengemudi cerdas, jarak aman, etika menyalip, dan bahaya blind spot.',
    icon_name: 'ShieldCheck',
    min_poin_unlock: 160,
    total_soal: 6,
    warna_tema: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    level: 4,
    judul: 'Level 4: Penanganan Darurat & Laka',
    kategori: 'darurat',
    deskripsi: 'Langkah darurat saat mogok, rem blong, kecelakaan, dan kontak 110.',
    icon_name: 'HeartPulse',
    min_poin_unlock: 240,
    total_soal: 6,
    warna_tema: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
  },
];

export const BANK_SOAL_KUIS: QuizQuestion[] = [
  // --- LEVEL 1: RAMBU LALU LINTAS ---
  {
    id: 'q_r_01',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'peringatan',
    pertanyaan: 'Rambu berbentuk belah ketupat warna kuning dengan gambar dua panah berkelok-kelok menandakan...',
    opsi: [
      'Jalan satu arah di depan',
      'Peringatan banyak tikungan atau tikungan ganda di depan',
      'Area khusus putar balik (U-turn)',
      'Jalan licin akibat tumpahan oli'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Rambu warna kuning berdasar belah ketupat adalah rambu peringatan. Gambar kelokan memperingatkan pengendara untuk mengurangi kecepatan karena terdapat rangkaian tikungan berbahaya.',
    pasal_hukum: 'Permenhub No. 13 Tahun 2014 tentang Rambu Lalu Lintas'
  },
  {
    id: 'q_r_02',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'larangan',
    pertanyaan: 'Rambu lingkaran warna putih dengan garis tepi merah dan huruf "P" dicoret garis merah miring berarti...',
    opsi: [
      'Dilarang Berhenti (Stop)',
      'Dilarang Parkir kendaraan di area tersebut',
      'Area khusus parkir roda dua',
      'Batas kecepatan maksimum 40 km/jam'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Rambu lingkaran tepi merah dengan huruf P dicoret menandakan larangan parkir. Pengendara masih diperbolehkan berhenti sebentar tanpa mematikan mesin dan tidak meninggalkan kendaraan.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 287 Ayat 3'
  },
  {
    id: 'q_r_03',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'perintah',
    pertanyaan: 'Rambu lingkaran berwarna dasar biru dengan panah putih mengarah lurus ke depan memiliki arti...',
    opsi: [
      'Wajib berjalan lurus mengikuti arah panah',
      'Boleh belok kiri jika jalan sepi',
      'Jalur khusus kendaraan berat',
      'Informasi jalan tol bebas hambatan'
    ],
    jawaban_benar: 0,
    poin: 20,
    penjelasan: 'Rambu warna biru lingkaran merupakan rambu perintah yang wajib dipatuhi. Pengendara wajib mengikuti arah yang ditunjukkan (wajib lurus).',
    pasal_hukum: 'Permenhub No. 13 Tahun 2014 Pasal 7'
  },
  {
    id: 'q_r_04',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'peringatan',
    pertanyaan: 'Rambu segitiga kuning dengan gambar silang rel kereta api dan pagar menandakan...',
    opsi: [
      'Perlintasan sebidang kereta api dengan pintu perlintasan',
      'Perlintasan kereta api tanpa pintu palang',
      'Stasiun kereta api barang',
      'Jalan buntu khusus pejalan kaki'
    ],
    jawaban_benar: 0,
    poin: 20,
    penjelasan: 'Gambar pagar pada rambu kuning peringatan menandakan perlintasan kereta api berpintu. Bila gambar lokomotif tanpa pagar menandakan perlintasan sebidang tanpa pintu.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 114'
  },
  {
    id: 'q_r_05',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'larangan',
    pertanyaan: 'Rambu lingkaran putih bertepi merah dengan angka "40 km" di tengahnya menunjukkan...',
    opsi: [
      'Jarak ke tujuan tersisa 40 kilometer',
      'Batas kecepatan maksimum yang diizinkan adalah 40 km/jam',
      'Batas kecepatan minimum adalah 40 km/jam',
      'Jalan akan berakhir dalam 40 menit'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Rambu batas kecepatan maksimum berbentuk lingkaran merah. Melebihi batas ini di area pemukiman/perkotaan berpotensi ditilang dan sangat membahayakan keselamatan.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 287 Ayat 5'
  },
  {
    id: 'q_r_06',
    level: 1,
    kategori: 'rambu',
    tipe_rambu: 'petunjuk',
    pertanyaan: 'Rambu persegi panjang berwarna hijau dengan tulisan putih menunjukkan arah kota merupakan jenis rambu...',
    opsi: [
      'Rambu Perintah',
      'Rambu Larangan',
      'Rambu Petunjuk / Informasi Jalan',
      'Rambu Peringatan Bahaya'
    ],
    jawaban_benar: 2,
    poin: 20,
    penjelasan: 'Warna hijau persegi panjang adalah rambu petunjuk jurusan dan batas wilayah untuk memudahkan navigasi pengemudi.',
    pasal_hukum: 'Permenhub No. 13 Tahun 2014'
  },

  // --- LEVEL 2: MARKA JALAN & HAK UTAMA ---
  {
    id: 'q_m_01',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Apa arti garis putih utuh (tanpa putus-putus) di tengah jalan raya?',
    opsi: [
      'Boleh menyalip kendaraan lain jika jalan kosong',
      'Pengendara dilarang keras melintasi garis atau menyalip',
      'Khusus lajur kendaraan roda dua',
      'Jalur darurat ambulans'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Garis membujur utuh berfungsi sebagai larangan bagi kendaraan melintasi garis tersebut, termasuk larangan berpindah lajur atau menyalip kendaraan lain di tikungan/jembatan.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 287 Ayat 1'
  },
  {
    id: 'q_m_02',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Saat memasuki bundaran lalu lintas tanpa lampu lalu lintas, kendaraan manakah yang memiliki hak utama?',
    opsi: [
      'Kendaraan yang baru akan masuk ke bundaran',
      'Kendaraan yang sudah berada di dalam bundaran',
      'Kendaraan yang berukuran lebih besar (truk/bus)',
      'Kendaraan yang membunyikan klakson lebih dulu'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Pengemudi yang hendak memasuki bundaran wajib mendahulukan kendaraan yang sudah berada di dalam bundaran lalu lintas.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 113 Ayat 1'
  },
  {
    id: 'q_m_03',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Marka jalan berupa garis kuning zigzag di sisi tepi jalan berfungsi sebagai...',
    opsi: [
      'Tempat khusus menaikkan penumpang bus',
      'Penanda area dilarang parkir maupun berhenti di sepanjang marka tersebut',
      'Lajur sepeda dan pejalan kaki',
      'Batas perlambatan kecepatan'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Marka serong kuning zigzag di sisi jalan menandakan area larangan parkir dan berhenti bagi seluruh kendaraan bermotor demi kelancaran arus.',
    pasal_hukum: 'Permenhub No. 67 Tahun 2018 tentang Marka Jalan'
  },
  {
    id: 'q_m_04',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Di persimpangan empat tanpa lampu lalu lintas, kendaraan yang datang dari arah mana yang wajib didahulukan?',
    opsi: [
      'Kendaraan yang datang dari sebelah kiri',
      'Kendaraan yang datang dari sebelah kanan atau jalur jalan utama',
      'Kendaraan yang paling lambat melaju',
      'Kendaraan yang ingin belok kanan'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Jika simpang tidak berpemberitahu lampu lalu lintas, kendaraan wajib mendahulukan arus dari cabang utama atau kendaraan dari sebelah kanan.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 113 Ayat 1 Huruf b'
  },
  {
    id: 'q_m_05',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Marka Zebra Cross di depan gerbang sekolah diperuntukkan bagi...',
    opsi: [
      'Tempat parkir motor sementara',
      'Hak penyeberangan pejalan kaki yang wajib didahulukan pengendara bermotor',
      'Area putar balik kendaraan bermotor',
      'Garis batas antrean lampu merah'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Pengendara kendaraan bermotor wajib mengutamakan keselamatan dan mendahulukan pejalan kaki yang sedang menyeberang di zebra cross.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 106 Ayat 2'
  },
  {
    id: 'q_m_06',
    level: 2,
    kategori: 'marka',
    pertanyaan: 'Marka berupa garis ganda: satu garis utuh dan satu garis putus-putus. Pengendara di sisi mana yang boleh menyalip?',
    opsi: [
      'Pengendara di sisi garis utuh',
      'Pengendara di sisi garis putus-putus',
      'Kedua sisi bebas menyalip',
      'Tidak ada yang boleh menyalip sama sekali'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Pengemudi yang berada di sisi garis putus-putus diperbolehkan melintasi garis untuk mendahului jika aman, sedangkan pengemudi di sisi garis utuh dilarang.',
    pasal_hukum: 'Permenhub No. 67 Tahun 2018'
  },

  // --- LEVEL 3: ETIKA & DEFENSIVE DRIVING ---
  {
    id: 'q_e_01',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Berapa jarak aman berkendara sepeda motor di belakang kendaraan lain dengan metode "Hitungan 3 Detik"?',
    opsi: [
      'Minimal 50 centimeter',
      'Jarak tempuh waktu respon minimal 3 detik dari patokan objek tetap di depan',
      'Selalu menempel di sisi kiri spion truk',
      'Cukup 1 meter saat kecepatan 60 km/jam'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Metode 3 detik (Three-Second Rule) memberikan waktu reaksi fisiologis otak (1 detik) dan waktu pengereman mekanis motor (2 detik) untuk menghindari tabrak belakang.',
    pasal_hukum: 'Defensive Riding Standard Korlantas Polri'
  },
  {
    id: 'q_e_02',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Mengapa pengendara sepeda motor sangat dilarang berada di area "Blind Spot" kendaraan besar (Truk/Bus)?',
    opsi: [
      'Karena angin kendaraan besar bisa membuat motor oleng',
      'Karena sopir truk/bus tidak dapat melihat keberadaan motor dari kaca spion kabin',
      'Karena asap knalpot truk panas',
      'Semua jawaban salah'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Blind spot adalah titik buta di sekitar kendaraan besar di mana sopir tidak dapat melihat kendaraan lain. Berada di blind spot merupakan penyebab utama laka tabrak samping.',
    pasal_hukum: 'Modul Edukasi Safety Riding Korlantas Polri'
  },
  {
    id: 'q_e_03',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Sesuai UU No. 22 Tahun 2009 Pasal 106 Ayat 8, kewajiban penggunaan helm berstandar SNI berlaku untuk...',
    opsi: [
      'Pengemudi sepeda motor saja',
      'Penumpang anak kecil saja',
      'Pengemudi dan setiap orang yang dibonceng (penumpang)',
      'Hanya berlaku saat melintas di jalan protokol'
    ],
    jawaban_benar: 2,
    poin: 20,
    penjelasan: 'Setiap orang yang mengemudikan Sepeda Motor dan Penumpang Sepeda Motor wajib mengenakan helm yang memenuhi Standar Nasional Indonesia (SNI) dan terpasang tali pengunci (klik).',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 106 Ayat 8 & Pasal 291'
  },
  {
    id: 'q_e_04',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Saat berkendara sepeda motor di jalan raya, kapan lampu sein (penunjuk arah) wajib dinyalakan sebelum berbelok?',
    opsi: [
      'Tepat saat setang motor sudah mulai berbelok',
      'Minimal 30 meter sebelum titik persimpangan atau perpindahan lajur',
      'Hanya jika ada polisi yang mengawasi',
      'Lampu sein tidak wajib dinyalakan jika siang hari'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Lampu penunjuk arah wajib dinyalakan minimal 30 meter sebelum berbelok untuk memberi peringatan awal bagi pengendara di belakang dan dari arah berlawanan.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 112 Ayat 1'
  },
  {
    id: 'q_e_05',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Apa konsekuensi hukum dan risiko mengoperasikan smartphone (mengetik chat/telepon) saat mengemudi?',
    opsi: [
      'Konsentrasi terpecah hingga 400%, melanggar Pasal 106 Ayat 1 dengan pidana denda/kurungan',
      'Hanya ditegur bila terjadi kecelakaan',
      'Diizinkan bila menggunakan satu tangan',
      'Boleh dilakukan saat kecepatan di bawah 30 km/jam'
    ],
    jawaban_benar: 0,
    poin: 20,
    penjelasan: 'Mengoperasikan HP saat berkendara menghilangkan fokus situasional (*distracted driving*) dan melanggar kewajiban mengemudi dengan wajar dan konsentrasi penuh.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 106 Ayat 1 & Pasal 283'
  },
  {
    id: 'q_e_06',
    level: 3,
    kategori: 'etika',
    pertanyaan: 'Bagaimana etika berkendara yang benar saat mendengar sirine kendaraan darurat (Ambulans, Pemadam Kebakaran, Iring-iringan Kepolisian)?',
    opsi: [
      'Menambah kecepatan dan membuntuti dari belakang',
      'Segera menepi ke sisi kiri jalan dan memberikan ruang prioritas utama untuk lewat',
      'Tetap di lajur tengah sambil menyalakan lampu hazard',
      'Membunyikan klakson berkali-kali'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Kendaraan darurat memiliki hak utama penggunaan jalan. Seluruh pengguna jalan wajib memberi jalan dengan cara menepi ke sisi kiri dan tidak membuntuti.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 134 & Pasal 135'
  },

  // --- LEVEL 4: PENANGANAN DARURAT & LAKA ---
  {
    id: 'q_d_01',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Berapa nomor darurat resmi Kepolisian Republik Indonesia (Polri) yang dapat dihubungi 24 jam bebas pulsa?',
    opsi: [
      '110 (Layanan Contact Center Polri)',
      '112 (Pemadam Kebakaran)',
      '118 (Ambulans PMI)',
      '119 (Sistem Penanggulangan Gawat Darurat Terpadu)'
    ],
    jawaban_benar: 0,
    poin: 20,
    penjelasan: 'Layanan Call Center 110 adalah nomor darurat resmi Kepolisian Negara Republik Indonesia yang siap merespons laporan kriminalitas, darurat laka lantas, dan bantuan kepolisian.',
    pasal_hukum: 'SOP Layanan Darurat 110 Mabes Polri'
  },
  {
    id: 'q_d_02',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Jika Anda mengalami rem blong pada sepeda motor matic saat melintasi turunan, tindakan paling tepat adalah...',
    opsi: [
      'Langsung mematikan kunci kontak dan melompat dari motor',
      'Lepas tuas gas bertahap, gunakan pengereman rem belakang perlahan, dan arahkan motor ke jalur penyelamat atau tanjakan/rumput tepi jalan',
      'Menekan tuas gas sekuat mungkin',
      'Menutup mata dan memeluk setang'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Mematikan mesin seketika pada motor matic dapat mengunci kemudi dan menghilangkan sisa engine brake. Lepas gas, pompa rem sisa yang ada, dan cari area perlambatan tepi jalan.',
    pasal_hukum: 'Panduan Penanganan Darurat Rem Kendaraan Korlantas Polri'
  },
  {
    id: 'q_d_03',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Langkah pertama yang wajib dilakukan seorang pengemudi jika terlibat dalam kecelakaan lalu lintas adalah...',
    opsi: [
      'Melarikan diri karena takut diamuk massa',
      'Menghentikan kendaraan seketika, mengamankan lokasi dari tabrakan beruntun, dan menolong korban serta melapor ke Polantas terdekat',
      'Menyalahkan pengemudi lain di media sosial',
      'Meninggalkan kendaraan di tengah jalan'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Pengemudi yang terlibat laka lantas wajib menghentikan kendaraan, memberikan pertolongan pertama kepada korban, dan melaporkan kejadian ke petugas Polri. Tabrak lari adalah tindak pidana berat.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 231 & Pasal 312'
  },
  {
    id: 'q_d_04',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Berapa jarak minimum pemasangan segitiga pengaman saat kendaraan roda empat mogok/berhenti darurat di jalan raya?',
    opsi: [
      '1 meter di samping pintu mobil',
      'Minimal 10 meter di belakang kendaraan (jalan perkotaan) atau minimal 50 meter (jalan tol/kecepatan tinggi)',
      'Cukup diletakkan di atas kap mesin',
      'Tidak perlu memasang segitiga pengaman'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Segitiga pengaman dipasang di belakang kendaraan dengan jarak memadai agar pengemudi lain dari arah belakang memiliki waktu reaksi untuk menghindar.',
    pasal_hukum: 'UU No. 22 Tahun 2009 Pasal 121 & Kepmenhub KM 72/1993'
  },
  {
    id: 'q_d_05',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Jika menemukan korban kecelakaan lalu lintas tidak sadarkan diri di aspal dan dicurigai mengalami cedera leher/tulang belakang, tindakan yang HARUS DIHINDARI adalah...',
    opsi: [
      'Menghubungi nomor 110 dan 119/ambulans',
      'Memindahkan atau mengangkat korban sembarangan dengan posisi leher tertekuk tanpa penstabil leher (cervical collar)',
      'Memasang tanda peringatan di sekitar korban agar tidak tertabrak kendaraan lain',
      'Memeriksa apakah korban masih bernapas'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Mengangkat atau memutar posisi leher korban trauma berat sembarangan dapat merusak sumsum tulang belakang dan menyebabkan kelumpuhan permanen atau kematian.',
    pasal_hukum: 'Prinsip Bantuan Hidup Dasar (BHD) & P3K Laka Lantas'
  },
  {
    id: 'q_d_06',
    level: 4,
    kategori: 'darurat',
    pertanyaan: 'Dalam fitur SOS SIGAP, mengapa tombol darurat harus ditahan selama 3 detik sebelum mengirim koordinat GPS dan memicu panggilan 110?',
    opsi: [
      'Untuk menghemat baterai handphone',
      'Mekanisme pencegahan kesalahan pencet (*false alarm mitigation*) agar laporan kepolisian tetap valid dan terverifikasi',
      'Menunggu sinyal satelit berputar',
      'Format standar sistem operasi Android'
    ],
    jawaban_benar: 1,
    poin: 20,
    penjelasan: 'Hold-to-activate 3 detik menjamin bahwa sinyal darurat dipicu secara sadar oleh korban dalam kondisi genting, mencegah lonjakan panggilan palsu ke Command Center 110.',
    pasal_hukum: 'Spesifikasi Teknis TSD SIGAP §5'
  },
];
