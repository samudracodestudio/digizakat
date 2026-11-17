export interface LAZItem {
  no: number;
  name: string;
  slug: string;
  skala: 'Nasional' | 'Provinsi' | 'Kabupaten/Kota';
  provinsi: string;
  simzat_detail_url: string;
  donation_url: string;
  instagram_url?: string;
  website_url?: string;
  sk_number?: string;
  berlaku_sampai?: string;
  alamat?: string;
  email?: string;
  phone?: string;
  pimpinan?: string;
  foz_member: boolean;
}

export interface OPZPost {
  id: string;
  opz_name: string;
  opz_scale: string;
  title: string;
  summary: string;
  asnaf: string;
  category: 'Pendidikan' | 'Kesehatan' | 'Ekonomi Mustahik' | 'Kebencanaan' | 'Dakwah';
  location: string;
  published_at: string;
  source_url: string;
  donation_url: string;
  instagram_url?: string;
  image_url: string;
}

export interface EncyclopediaEntry {
  id: string;
  term: string;
  arabic?: string;
  category: 'Fiqh Zakat' | '8 Asnaf' | 'Fatwa & Regulasi' | 'Sejarah Gerakan';
  definition: string;
  explanation: string;
  references: string[];
}

export const SAMPLE_POSTS: OPZPost[] = [
  {
    id: 'post-1',
    opz_name: 'LAZIS MUHAMMADIYAH',
    opz_scale: 'Nasional',
    title: 'Pemberdayaan UMKM Mustahik Melalui Gerobak Berkah Mandiri di Bantul',
    summary: 'Sebanyak 25 mustahik di wilayah pedesaan Bantul mendapatkan gerobak usaha dan modal kerja produktif dari dana zakat maal, bertujuan mengubah mustahik menjadi muzakki.',
    asnaf: 'Fakir & Miskin',
    category: 'Ekonomi Mustahik',
    location: 'DI Yogyakarta',
    published_at: '2 jam yang lalu',
    source_url: 'https://lazismu.org',
    donation_url: 'https://lazismu.org/',
    instagram_url: 'https://www.instagram.com/lazismupusat/',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'post-2',
    opz_name: 'LAZ YAYASAN DARUT TAUHID PEDULI',
    opz_scale: 'Nasional',
    title: 'Distribusi 500 Paket Logistik & Air Bersih untuk Penyintas Banjir Demak',
    summary: 'Tim respon kebencanaan DT Peduli mendirikan posko hangat dan mendistribusikan kebutuhan pokok serta hygiene kit untuk warga terdampak genangan tanggul jebol.',
    asnaf: 'Ibnu Sabil & Fakir Miskin',
    category: 'Kebencanaan',
    location: 'Jawa Tengah',
    published_at: '5 jam yang lalu',
    source_url: 'https://dtpeduli.org',
    donation_url: 'https://dtpeduli.org',
    instagram_url: 'https://www.instagram.com/dtpeduli/',
    image_url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'post-3',
    opz_name: 'LAZ YAYASAN PESANTREN ISLAM AL-AZHAR',
    opz_scale: 'Nasional',
    title: 'Beasiswa Generasi Gemilang untuk 120 Santri Penghafal Al-Qur’an',
    summary: 'Penyaluran beasiswa pendidikan penuh dan living cost semester ganjil bagi santri yatim dhuafa berprestasi tingkat menengah atas dan perguruan tinggi.',
    asnaf: 'Fisabilillah',
    category: 'Pendidikan',
    location: 'DKI Jakarta',
    published_at: 'Kemarin',
    source_url: 'https://alazharpeduli.or.id',
    donation_url: 'https://donasi.alazharpeduli.or.id/',
    instagram_url: 'https://www.instagram.com/lazalazhar/',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'post-4',
    opz_name: 'LAZ DANA SOSIAL AL FALAH SURABAYA',
    opz_scale: 'Nasional',
    title: 'Layanan Pengobatan Gratis & Cek Lab Keliling Dhuafa Pelosok Madura',
    summary: 'Ambulans dan klinik apung YDSF memberikan intervensi kesehatan gratis bagi 350 warga lansia prasejahtera yang sulit menjangkau fasilitas kesehatan rujukan.',
    asnaf: 'Fakir & Miskin',
    category: 'Kesehatan',
    location: 'Jawa Timur',
    published_at: '1 hari yang lalu',
    source_url: 'https://ydsf.org',
    donation_url: 'https://ydsf.org',
    instagram_url: 'https://www.instagram.com/ydsfku/',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
  }
];

export const SAMPLE_ENCYCLOPEDIA: EncyclopediaEntry[] = [
  {
    id: 'enc-1',
    term: 'Nisab Zakat',
    arabic: 'نصاب الزكاة',
    category: 'Fiqh Zakat',
    definition: 'Batas minimal jumlah harta yang wajib dikeluarkan zakatnya.',
    explanation: 'Untuk emas setara 85 gram emas murni, dan perak 595 gram perak murni. Harta yang belum mencapai batas nisab hanya disunnahkan untuk infak atau sedekah, belum terkena kewajiban zakat.',
    references: ['HR. Abu Daud No. 1573', 'Fatwa MUI No. 3 Tahun 2003']
  },
  {
    id: 'enc-2',
    term: '8 Golongan Asnaf',
    arabic: 'الأصناف الثمانية',
    category: '8 Asnaf',
    definition: 'Delapan kelompok penerima hak distribusi zakat sesuai QS. At-Taubah ayat 60.',
    explanation: 'Terdiri dari Fakir (tidak punya penghasilan/harta), Miskin (penghasilan tidak mencukupi kebutuhan pokok), Amil (petugas pengelola zakat), Muallaf (orang yang baru memeluk Islam atau dilembutkan hatinya), Riqab (pembebasan budak/penjajahan sosial), Gharimin (orang yang terlilit hutang untuk hajat hidup halal), Fisabilillah (pejuang di jalan kebaikan dan agama), dan Ibnu Sabil (musafir kehabisan bekal).',
    references: ['QS. At-Taubah: 60', 'Fiqh az-Zakah (Yusuf al-Qaradawi)']
  },
  {
    id: 'enc-3',
    term: 'Haul',
    arabic: 'الحول',
    category: 'Fiqh Zakat',
    definition: 'Syarat kepemilikan harta yang telah genap berjalan selama satu tahun hijriyah (354 hari).',
    explanation: 'Berlaku untuk zakat emas, perak, tabungan, perniagaan, dan peternakan. Zakat pertanian dan zakat profesi/penghasilan tidak mensyaratkan haul, melainkan dikeluarkan saat panen atau saat menerima penghasilan.',
    references: ['HR. Tirmidzi No. 631', 'Kompilasi Hukum Islam RI']
  },
  {
    id: 'enc-4',
    term: 'Zakat Sebagai Pengurang Pajak',
    category: 'Fatwa & Regulasi',
    definition: 'Ketentuan legal di Indonesia di mana pembayaran zakat ke OPZ resmi dapat mengurangi Penghasilan Kena Pajak (PKP).',
    explanation: 'Sesuai dengan UU No. 23 Tahun 2011 tentang Pengelolaan Zakat Pasal 22 dan UU No. 36 Tahun 2008 tentang Pajak Penghasilan, muzakki yang menyetor zakat ke BAZNAS atau LAZ resmi berizin Kemenag berhak mendapatkan Bukti Setor Zakat (BSZ) untuk dilampirkan pada SPT Tahunan Pajak.',
    references: ['UU No. 23 Tahun 2011', 'Peraturan Dirjen Pajak No. PER-06/PJ/2011']
  },
  {
    id: 'enc-5',
    term: 'Gerakan Zakat Modern Indonesia',
    category: 'Sejarah Gerakan',
    definition: 'Fase transformasi pengelolaan zakat dari pola tradisional perseorangan menjadi kelembagaan profesional.',
    explanation: 'Dimulai pada akhir era 1960-an (lahirnya BAZIS DKI Jakarta 1968), berkembang pesat pada era 1990-an dengan lahirnya LAZ berbasis inisiatif masyarakat sipil (seperti Dompet Dhuafa 1993, PKPU, Rumah Zakat, Lazismu, Lazisnu), diwadahi oleh Forum Zakat (FOZ) pada 1997, hingga penetapan regulasi UU Zakat 1999 dan UU 23/2011.',
    references: ['Sejarah Filantropi Islam Indonesia (PIRAC)', 'Dokumentasi FOZ']
  }
];
