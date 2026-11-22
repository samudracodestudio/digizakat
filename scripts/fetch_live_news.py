import urllib.request, ssl, re, json, os
from bs4 import BeautifulSoup
from datetime import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# 14 Lembaga Anggota FOZ & BAZNAS dengan RSS Feed Aktif
FEEDS = [
    {
        'opz_name': 'FORUM ZAKAT (FOZ)',
        'opz_scale': 'Nasional',
        'url': 'https://forumzakat.org/feed/',
        'donation_url': 'https://forumzakat.org/',
        'instagram_url': 'https://www.instagram.com/forumzakat/',
        'fallback_image': 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Amil & Mustahik'
    },
    {
        'opz_name': 'LAZIS MUHAMMADIYAH',
        'opz_scale': 'Nasional',
        'url': 'https://lazismu.org/feed/',
        'donation_url': 'https://lazismu.org/',
        'instagram_url': 'https://www.instagram.com/lazismupusat/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'DOMPET DHUAFA',
        'opz_scale': 'Nasional',
        'url': 'https://www.dompetdhuafa.org/feed/',
        'donation_url': 'https://donasi.dompetdhuafa.org/',
        'instagram_url': 'https://www.instagram.com/dompetdhuafaorg/',
        'fallback_image': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'RUMAH ZAKAT',
        'opz_scale': 'Nasional',
        'url': 'https://www.rumahzakat.org/feed/',
        'donation_url': 'https://www.rumahzakat.org/donasi',
        'instagram_url': 'https://www.instagram.com/rumahzakat/',
        'fallback_image': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kesehatan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'BAITUL MAAL HIDAYATULLAH (BMH)',
        'opz_scale': 'Nasional',
        'url': 'https://bmh.or.id/feed/',
        'donation_url': 'https://bmh.or.id/',
        'instagram_url': 'https://www.instagram.com/bmh.pusat/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'INISIATIF ZAKAT INDONESIA (IZI)',
        'opz_scale': 'Nasional',
        'url': 'https://izi.or.id/feed/',
        'donation_url': 'https://zakatpedia.com/',
        'instagram_url': 'https://www.instagram.com/inisiatifzakat/',
        'fallback_image': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kesehatan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZ NURUL HAYAT',
        'opz_scale': 'Nasional',
        'url': 'https://www.nurulhayat.org/feed/',
        'donation_url': 'https://zakatkita.org/',
        'instagram_url': 'https://www.instagram.com/nurulhayatku/',
        'fallback_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Yatim & Dhuafa'
    },
    {
        'opz_name': 'YBM BRILIAN',
        'opz_scale': 'Nasional',
        'url': 'https://ybmbrilian.id/feed/',
        'donation_url': 'https://ybmbrilian.id/',
        'instagram_url': 'https://www.instagram.com/ybmbrilian/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'MANDIRI AMAL INSANI',
        'opz_scale': 'Nasional',
        'url': 'https://mandiriamalinsani.or.id/feed/',
        'donation_url': 'https://maibro.or.id/',
        'instagram_url': 'https://www.instagram.com/mai_foundation/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'LAZIS JATENG',
        'opz_scale': 'Provinsi',
        'url': 'https://lazisjateng.org/feed/',
        'donation_url': 'https://lazisjateng.org/',
        'instagram_url': 'https://www.instagram.com/lazisjateng/',
        'fallback_image': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kebencanaan',
        'default_asnaf': 'Ibnu Sabil'
    },
    {
        'opz_name': 'LAZ HARAPAN DHUAFA (HARFA)',
        'opz_scale': 'Provinsi',
        'url': 'https://lazharfa.org/feed/',
        'donation_url': 'https://lazharfa.org/',
        'instagram_url': 'https://www.instagram.com/lazharfa/',
        'fallback_image': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kesehatan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZ ZAKAT SUKSES',
        'opz_scale': 'Provinsi',
        'url': 'https://zakatsukses.org/feed/',
        'donation_url': 'https://sahabatberbagi.com/',
        'instagram_url': 'https://www.instagram.com/zakatsukses/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'DOMPET SOSIAL MADANI (BALI)',
        'opz_scale': 'Provinsi',
        'url': 'https://dompetsosial.id/feed/',
        'donation_url': 'https://dompetsosial.id/',
        'instagram_url': 'https://www.instagram.com/dsmbali/',
        'fallback_image': 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Muallaf & Dhuafa'
    },
    {
        'opz_name': 'LAZ AL-BAHJAH',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://lazalbahjah.org/feed/',
        'donation_url': 'https://lazalbahjah.org/',
        'instagram_url': 'https://www.instagram.com/lazalbahjah/',
        'fallback_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'WAHDAH INSPIRASI ZAKAT (WIZ)',
        'opz_scale': 'Nasional',
        'url': 'https://wiz.or.id/feed/',
        'donation_url': 'https://wiz.or.id/',
        'instagram_url': 'https://www.instagram.com/wahdahinspirasizakat/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'BSI MASLAHAT',
        'opz_scale': 'Nasional',
        'url': 'https://www.bsimaslahat.org/feed/',
        'donation_url': 'https://www.bsimaslahat.org/',
        'instagram_url': 'https://www.instagram.com/bsimaslahat/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'NUSANTARA PALESTINA CENTER (NPC)',
        'opz_scale': 'Nasional',
        'url': 'https://npc.id/feed/',
        'donation_url': 'https://npc.id/',
        'instagram_url': 'https://www.instagram.com/nusantarapalestinacenter/',
        'fallback_image': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kebencanaan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'SAHABAT YATIM INDONESIA',
        'opz_scale': 'Nasional',
        'url': 'https://www.sahabatyatim.com/feed/',
        'donation_url': 'https://www.sahabatyatim.com/',
        'instagram_url': 'https://www.instagram.com/sahabatyatim/',
        'fallback_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Yatim & Dhuafa'
    },
    {
        'opz_name': 'LAZ PERSADA JATIM',
        'opz_scale': 'Provinsi',
        'url': 'https://lazpersada.org/feed/',
        'donation_url': 'https://lazpersada.org/',
        'instagram_url': 'https://www.instagram.com/lazpersada/',
        'fallback_image': 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Yatim & Dhuafa'
    },
    {
        'opz_name': 'LAZIS AL HAROMAIN',
        'opz_scale': 'Nasional',
        'url': 'https://www.lazisalharomain.org/feed/',
        'donation_url': 'https://www.lazisalharomain.org/',
        'instagram_url': 'https://www.instagram.com/lazisalharomain/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'LAZ ULIL ALBAB',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://www.ulilalbab.org/feed/',
        'donation_url': 'https://www.ulilalbab.org/',
        'instagram_url': 'https://www.instagram.com/lazulilalbab/',
        'fallback_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'LAZ PUNDI SURGA JOGJA',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://www.pundisurga.org/feed/',
        'donation_url': 'https://www.pundisurga.org/',
        'instagram_url': 'https://www.instagram.com/pundisurga/',
        'fallback_image': 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZ NUR HIDAYAH SURAKARTA',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://laznh.id/feed/',
        'donation_url': 'https://laznh.id/',
        'instagram_url': 'https://www.instagram.com/laznurhidayah/',
        'fallback_image': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kesehatan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZ AL KHAIRAAT (BERBAGI BERKAH)',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://berbagiberkah.org/feed/',
        'donation_url': 'https://berbagiberkah.org/',
        'instagram_url': 'https://www.instagram.com/berbagiberkah_id/',
        'fallback_image': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Kebencanaan',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZ IBADURRAHMAN',
        'opz_scale': 'Provinsi',
        'url': 'https://lazibadurrahman.org/feed/',
        'donation_url': 'https://lazibadurrahman.org/',
        'instagram_url': 'https://www.instagram.com/lazibadurrahman/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZIS SABILILLAH',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://lazissabilillah.com/feed/',
        'donation_url': 'https://lazissabilillah.com/',
        'instagram_url': 'https://www.instagram.com/lazissabilillah/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fakir & Miskin'
    },
    {
        'opz_name': 'LAZISQU (LAZIS QURAN)',
        'opz_scale': 'Kabupaten/Kota',
        'url': 'https://lazisqu.or.id/feed/',
        'donation_url': 'https://lazisqu.or.id/',
        'instagram_url': 'https://www.instagram.com/lazisqu/',
        'fallback_image': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Pendidikan',
        'default_asnaf': 'Fisabilillah'
    },
    {
        'opz_name': 'LAZ MKU',
        'opz_scale': 'Nasional',
        'url': 'https://lazmku.id/feed/',
        'donation_url': 'https://lazmku.id/',
        'instagram_url': 'https://www.instagram.com/lazmku/',
        'fallback_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Ekonomi Mustahik',
        'default_asnaf': 'Fakir & Miskin'
    }
]

def clean_text(text):
    if not text:
        return ''
    soup = BeautifulSoup(text, 'html.parser')
    clean = soup.get_text()
    return re.sub(r'\s+', ' ', clean).strip()

def detect_category(title, summary):
    combined = (title + ' ' + summary).lower()
    if any(k in combined for k in ['banjir', 'bencana', 'gempa', 'longsor', 'evakuasi', 'darurat', 'korban']):
        return 'Kebencanaan', 'Ibnu Sabil & Fakir Miskin'
    elif any(k in combined for k in ['beasiswa', 'sekolah', 'santri', 'mahasiswa', 'kampus', 'pendidikan', 'belajar']):
        return 'Pendidikan', 'Fisabilillah'
    elif any(k in combined for k in ['klinik', 'obat', 'sehat', 'ambulans', 'pasien', 'medis', 'operasi', 'gizi', 'khitan']):
        return 'Kesehatan', 'Fakir & Miskin'
    elif any(k in combined for k in ['umkm', 'gerobak', 'modal', 'usaha', 'ekonomi', 'tani', 'panen', 'ternak', 'pohon']):
        return 'Ekonomi Mustahik', 'Fakir & Miskin'
    elif any(k in combined for k in ['dakwah', 'masjid', 'quran', 'islam', 'kajian', 'dai', 'ramadhan', 'shalat', 'pesantren']):
        return 'Dakwah', 'Fisabilillah'
    return 'Ekonomi Mustahik', 'Fakir & Miskin'

def get_og_image(link):
    try:
        req = urllib.request.Request(link, headers=HEADERS)
        html_doc = urllib.request.urlopen(req, context=ctx, timeout=3.5).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html_doc, 'html.parser')
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og.get('content')
    except Exception:
        pass
    return None

def normalize_url(url):
    if not url:
        return ''
    # Remove tracking query params like ?utm_source=rss
    return url.split('?')[0].rstrip('/')

DATA_DIR = '/Users/samudra/Downloads/Neo Digizakat/neo-digizakat-app/public/data'
LIVE_PATH = os.path.join(DATA_DIR, 'live_news.json')
ARCHIVE_PATH = os.path.join(DATA_DIR, 'archive_news.json')

# 1. Muat data arsip & live yang sudah ada untuk deduplikasi
existing_live = []
existing_archive = []

if os.path.exists(LIVE_PATH):
    try:
        with open(LIVE_PATH, 'r', encoding='utf-8') as f:
            existing_live = json.load(f)
    except Exception:
        existing_live = []

if os.path.exists(ARCHIVE_PATH):
    try:
        with open(ARCHIVE_PATH, 'r', encoding='utf-8') as f:
            existing_archive = json.load(f)
    except Exception:
        existing_archive = []

# Kumpulkan semua URL yang sudah tercatat
seen_urls = set()
for item in existing_live:
    seen_urls.add(normalize_url(item.get('source_url')))
for item in existing_archive:
    seen_urls.add(normalize_url(item.get('source_url')))

print(f"Database saat ini: {len(existing_live)} berita aktif, {len(existing_archive)} berita terarsip.")

# 2. Crawl rilis baru dari 14 LAZ
newly_fetched = []

for source in FEEDS:
    try:
        print(f"Crawling {source['opz_name']}...")
        req = urllib.request.Request(source['url'], headers=HEADERS)
        xml_content = urllib.request.urlopen(req, context=ctx, timeout=6).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(xml_content, 'xml')
        items = soup.find_all('item')[:4]
        
        for it in items:
            link = it.link.text if it.link else ''
            norm_link = normalize_url(link)
            
            if not norm_link or norm_link in seen_urls:
                continue # Sudah ada di database, lewati
            
            title = clean_text(it.title.text if it.title else '')
            pub_date = it.pubDate.text if it.pubDate else 'Terbaru'
            
            try:
                dt = datetime.strptime(pub_date[:25].strip(), '%a, %d %b %Y %H:%M:%S')
                formatted_date = dt.strftime('%d %b %Y')
            except Exception:
                formatted_date = 'Hari ini'

            desc_raw = it.description.text if it.description else ''
            summary = clean_text(desc_raw)[:160]
            if len(summary) >= 160:
                summary += '...'
            
            category, asnaf = detect_category(title, summary)
            
            img_url = get_og_image(link)
            if not img_url:
                img_url = source['fallback_image']

            post_obj = {
                'id': f'post-{int(datetime.now().timestamp())}-{len(newly_fetched)}',
                'opz_name': source['opz_name'],
                'opz_scale': source['opz_scale'],
                'title': title,
                'summary': summary or f"Penyaluran program manfaat zakat dan infak oleh {source['opz_name']}.",
                'asnaf': asnaf,
                'category': category,
                'location': 'Indonesia',
                'published_at': formatted_date,
                'source_url': link,
                'donation_url': source['donation_url'],
                'instagram_url': source['instagram_url'],
                'image_url': img_url
            }

            newly_fetched.append(post_obj)
            seen_urls.add(norm_link)
            print(f"  ✨ Rilis Baru: {title[:50]}...")
    except Exception as e:
        print(f"  ❌ Gagal crawling {source['opz_name']}: {e}")

print(f"\nBerhasil menarik {len(newly_fetched)} rilis baru!")

# 3. Gabungkan: Berita baru ditaruh paling depan
combined_live = newly_fetched + existing_live

# 4. Two-Tier Splitting:
# 200 Teratas tetap mempertahankan gambar (live_news.json)
# Sisanya dipindahkan ke arsip unlimited tanpa gambar (archive_news.json)
final_live = combined_live[:200]
overflow_to_archive = combined_live[200:]

# Konversi overflow menjadi arsip teks ringan (buang image_url untuk hemat memori)
lightweight_overflow = []
for item in overflow_to_archive:
    lightweight_item = dict(item)
    lightweight_item.pop('image_url', None) # Hapus URL gambar
    lightweight_overflow.append(lightweight_item)

# Gabungkan dengan arsip sebelumnya
final_archive = lightweight_overflow + existing_archive

# 5. Tulis ke file
with open(LIVE_PATH, 'w', encoding='utf-8') as f:
    json.dump(final_live, f, indent=2, ensure_ascii=False)

with open(ARCHIVE_PATH, 'w', encoding='utf-8') as f:
    json.dump(final_archive, f, indent=2, ensure_ascii=False)

print(f"✅ Selesai! {len(final_live)} berita aktif di live_news.json (dengan gambar)")
print(f"✅ Selesai! {len(final_archive)} berita di archive_news.json (arsip unlimited teks & link)")
