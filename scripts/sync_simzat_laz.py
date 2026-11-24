import urllib.request, ssl, re, urllib.parse, json, os
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAZ_FILE = os.path.join(BASE_DIR, 'public', 'data', 'laz_verified.json')

def fetch_simzat_detail(detail_url):
    """Ambil detail SK, alamat, kabupaten, dan koordinat dari halaman detail SIMZAT."""
    if not detail_url:
        return {}
    try:
        req = urllib.request.Request(detail_url, headers=HEADERS)
        html = urllib.request.urlopen(req, context=ctx, timeout=25).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        lines = [line.strip() for line in soup.get_text('\n').splitlines() if line.strip()]
        fields = {}
        for i, line in enumerate(lines):
            if line in ('No. SK', 'Berlaku Sampai', 'Alamat Kantor', 'Provinsi', 'Kabupatan/Kota', 'Kabupaten/Kota', 'Kecamatan', 'Kelurahan', 'Koordinat'):
                if i + 1 < len(lines):
                    val = lines[i + 1]
                    if val == ':' and i + 2 < len(lines):
                        val = lines[i + 2]
                    elif val.startswith(':'):
                        val = val[1:].strip()
                    fields[line] = val.strip()

        result = {}
        if fields.get('No. SK'):
            result['sk_number'] = fields['No. SK']
        if fields.get('Berlaku Sampai'):
            result['berlaku_sampai'] = fields['Berlaku Sampai']

        kab = fields.get('Kabupatan/Kota') or fields.get('Kabupaten/Kota') or ''
        prov = fields.get('Provinsi', '')
        if kab:
            result['kabupaten'] = kab
            result['lokasi_singkat'] = f"{kab}, {prov}" if prov else kab

        addr_parts = [p for p in [
            fields.get('Alamat Kantor', ''),
            f"Kel. {fields['Kelurahan']}" if fields.get('Kelurahan') else '',
            f"Kec. {fields['Kecamatan']}" if fields.get('Kecamatan') else '',
            kab,
            prov
        ] if p]
        if addr_parts:
            full_addr = ', '.join(addr_parts)
            result['alamat_lengkap'] = full_addr
            result['alamat'] = full_addr

        coord = fields.get('Koordinat', '')
        m = re.match(r'^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$', coord)
        if m:
            lat, lng = float(m.group(1)), float(m.group(2))
            if -12.0 <= lat <= 7.0 and 94.0 <= lng <= 142.0:
                result['lat'] = lat
                result['lng'] = lng
                result['coord_exact'] = True
        return result
    except Exception as e:
        print(f"  ⚠️ Gagal ambil detail SIMZAT ({detail_url}): {e}")
        return {}

def sync_simzat():
    print("Memeriksa update data dari portal resmi SIMZAT Kemenag RI...")
    
    # 1. Buka halaman utama SIMZAT untuk ambil session cookie & csrf token
    try:
        req1 = urllib.request.Request(
            'https://simzat.kemenag.go.id/simzat/apps/web/daftar_laz',
            headers=HEADERS
        )
        resp1 = urllib.request.urlopen(req1, context=ctx, timeout=30)
        html = resp1.read().decode('utf-8', errors='ignore')
        cookie = resp1.headers.get('Set-Cookie', '')

        csrf_match = re.search(r'csrfHash\s*=\s*[\'\"]([a-f0-9]+)[\'\"]', html)
        if not csrf_match:
            print("❌ Gagal membaca CSRF token dari SIMZAT.")
            return False
        csrf_hash = csrf_match.group(1)

        # 2. Fetch data LAZ via internal DataTables POST endpoint (ambil hingga 300 record)
        post_data = urllib.parse.urlencode({
            'csrf_icraft_token': csrf_hash,
            'draw': 1,
            'start': 0,
            'length': 300
        }).encode('utf-8')

        req2 = urllib.request.Request(
            'https://simzat.kemenag.go.id/simzat/apps/web/data_laz',
            data=post_data,
            headers={
                **HEADERS,
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': cookie,
                'Referer': 'https://simzat.kemenag.go.id/simzat/apps/web/daftar_laz'
            }
        )

        with urllib.request.urlopen(req2, context=ctx, timeout=40) as r:
            res = json.loads(r.read().decode('utf-8'))
            records_total = res.get('recordsTotal', 0)
            raw_rows = res.get('data', [])
    except Exception as e:
        print("⚠️ Koneksi SIMZAT Kemenag sedang padat/timeout:", e)
        print("   -> Menggunakan cache database lokal yang sudah tersimpan aman.")
        return False

    print(f"✅ Data diterima dari SIMZAT: {records_total} lembaga terdaftar aktif.")

    if not raw_rows:
        print("Data kosong dari SIMZAT.")
        return False

    # Baca data laz_verified.json yang sudah ada sebelumnya
    existing_map = {}
    if os.path.exists(LAZ_FILE):
        try:
            with open(LAZ_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                for item in existing_data:
                    existing_map[item['name'].strip().upper()] = item
        except Exception as e:
            print("Gagal membaca file eksisting:", e)

    # Catat semua nama LAZ yang aktif terdaftar di SIMZAT saat ini
    current_active_names = set()
    updated_list = []

    for row in raw_rows:
        no_val = int(row[0]) if str(row[0]).isdigit() else len(updated_list) + 1
        link_html = row[1]
        skala = row[2].strip()
        provinsi = row[3].strip()

        # Extract name & url
        url_match = re.search(r'href=[\'\"]([^\'\"]+)[\'\"]', link_html)
        detail_url = url_match.group(1) if url_match else ''
        name_match = re.search(r'>([^<]+)<', link_html)
        name = name_match.group(1).strip() if name_match else link_html.strip()

        key = name.upper()
        current_active_names.add(key)
        item = dict(existing_map.get(key, {}))

        # Jika LAZ baru atau belum punya SK / koordinat, tarik detail langsung dari SIMZAT
        if (not item.get('sk_number') or item.get('lat') is None or item.get('lng') is None) and detail_url:
            print(f"  🔎 Mengambil detail SIMZAT untuk LAZ baru/belum lengkap: {name}...")
            detail_info = fetch_simzat_detail(detail_url)
            for k, v in detail_info.items():
                cur = item.get(k)
                if not cur or k in ('lat', 'lng', 'coord_exact') or (k in ('lokasi_singkat', 'alamat') and str(cur).endswith(', Indonesia')):
                    item[k] = v

        # Cek apakah di SIMZAT ada teks status khusus (misal "Proses Perpanjangan" / "Dicabut")
        cell_full_text = re.sub(r'<[^>]+>', ' ', link_html).lower()
        if 'perpanjang' in cell_full_text:
            status = 'perpanjangan'
            status_label = 'Proses Perpanjangan Izin'
            is_hidden = False # Bisa diatur apakah mau disembunyikan atau diberi label khusus
        elif 'cabut' in cell_full_text or 'beku' in cell_full_text:
            status = 'dibekukan'
            status_label = 'Izin Dibekukan / Tidak Aktif'
            is_hidden = True
        else:
            status = 'aktif'
            status_label = 'Resmi Berizin Kemenag RI'
            is_hidden = item.get('is_hidden', False) # pertahankan override manual jika ada

        updated_item = {
            "no": no_val,
            "name": name,
            "skala": skala,
            "provinsi": provinsi,
            "kabupaten": item.get('kabupaten', ''),
            "lokasi_singkat": item.get('lokasi_singkat', f"{provinsi}, Indonesia"),
            "alamat_lengkap": item.get('alamat_lengkap', ''),
            "simzat_detail_url": detail_url or item.get('simzat_detail_url', ''),
            "foz_member": item.get('foz_member', False),
            "donation_url": item.get('donation_url', ''),
            "slug": item.get('slug', name.lower().replace(' ', '-')),
            "instagram_url": item.get('instagram_url', ''),
            "website_url": item.get('website_url', ''),
            "sk_number": item.get('sk_number', ''),
            "berlaku_sampai": item.get('berlaku_sampai', ''),
            "alamat": item.get('alamat', f"{provinsi}, Indonesia"),
            "email": "",
            "phone": "",
            "pimpinan": item.get('pimpinan', 'Pimpinan Lembaga'),
            "logo_url": item.get('logo_url', ''),
            "susunlogo_id": item.get('susunlogo_id', ''),
            "jumlah_perwakilan": item.get('jumlah_perwakilan', 0),
            "perwakilan_daerah": item.get('perwakilan_daerah', []),
            "lat": item.get('lat'),
            "lng": item.get('lng'),
            "coord_exact": item.get('coord_exact', False),
            "status": status,
            "status_label": status_label,
            "is_hidden": is_hidden
        }
        updated_list.append(updated_item)

    # SKENARIO HIDE OTOMATIS:
    # Jika suatu lembaga sebelumnya ada di database kita, tetapi tiba-tiba HILANG / TIDAK ADA
    # lagi di data tabel SIMZAT (karena sedang masa perpanjangan izin / evaluasi Kemenag),
    # kita TIDAK MENGHAPUSNYA permanen, melainkan menandainya dengan status 'perpanjangan'
    # dan is_hidden = True (disembunyikan dari direktori publik)
    hidden_count = 0
    for key, old_item in existing_map.items():
        if key not in current_active_names:
            hidden_copy = dict(old_item)
            hidden_copy["status"] = "perpanjangan"
            hidden_copy["status_label"] = "Sedang Masa Perpanjangan Izin / Verifikasi Ulang Kemenag"
            hidden_copy["is_hidden"] = True
            updated_list.append(hidden_copy)
            hidden_count += 1
            print(f"  ⚠️ Lembaga '{old_item['name']}' tidak muncul di SIMZAT -> otomatis di-hide (status: perpanjangan).")

    # Simpan kembali jika berhasil
    with open(LAZ_FILE, 'w', encoding='utf-8') as f:
        json.dump(updated_list, f, ensure_ascii=False, indent=2)

    active_count = len(updated_list) - hidden_count
    print(f"🎉 Sukses menyinkronkan {len(updated_list)} data LAZ ke {LAZ_FILE}!")
    print(f"   • Aktif tampil: {active_count}")
    print(f"   • Disembunyikan (Hide/Perpanjangan): {hidden_count}")
    return True

if __name__ == '__main__':
    sync_simzat()
