import urllib.request, ssl, re, json
from bs4 import BeautifulSoup
from datetime import datetime

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

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
        'url': 'https://lazismu.org/feed',
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
        'opz_name': 'BAITUL MAAL HIDAYATULLAH',
        'opz_scale': 'Nasional',
        'url': 'https://bmh.or.id/feed/',
        'donation_url': 'https://bmh.or.id/',
        'instagram_url': 'https://www.instagram.com/bmh.pusat/',
        'fallback_image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        'default_category': 'Dakwah',
        'default_asnaf': 'Fisabilillah'
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
    elif any(k in combined for k in ['klinik', 'obat', 'sehat', 'ambulans', 'pasien', 'medis', 'operasi', 'gizi']):
        return 'Kesehatan', 'Fakir & Miskin'
    elif any(k in combined for k in ['umkm', 'gerobak', 'modal', 'usaha', 'ekonomi', 'tani', 'panen', 'ternak', 'pohon']):
        return 'Ekonomi Mustahik', 'Fakir & Miskin'
    elif any(k in combined for k in ['dakwah', 'masjid', 'quran', 'islam', 'kajian', 'dai', 'ramadhan', 'shalat', 'pesantren']):
        return 'Dakwah', 'Fisabilillah'
    return 'Ekonomi Mustahik', 'Fakir & Miskin'

def get_og_image(link):
    try:
        req = urllib.request.Request(link, headers=HEADERS)
        html_doc = urllib.request.urlopen(req, context=ctx, timeout=4).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html_doc, 'html.parser')
        og = soup.find('meta', property='og:image')
        if og and og.get('content'):
            return og.get('content')
    except Exception:
        pass
    return None

all_posts = []
count = 0

for source in FEEDS:
    try:
        print(f"Fetching RSS: {source['opz_name']}...")
        req = urllib.request.Request(source['url'], headers=HEADERS)
        xml_content = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(xml_content, 'xml')
        items = soup.find_all('item')[:4]
        
        for it in items:
            count += 1
            title = clean_text(it.title.text if it.title else '')
            link = it.link.text if it.link else ''
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

            all_posts.append({
                'id': f'live-post-{count}',
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
            })
            print(f"  + Added: {title[:50]}...")
    except Exception as e:
        print(f"  - Error fetching {source['opz_name']}: {e}")

if all_posts:
    out_path = '/Users/samudra/Downloads/Neo Digizakat/neo-digizakat-app/public/data/live_news.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_posts, f, indent=2, ensure_ascii=False)
    print(f"Successfully generated {len(all_posts)} live news items to {out_path}")
