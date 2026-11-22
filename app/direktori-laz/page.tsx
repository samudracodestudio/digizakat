'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowLeft,
  Globe,
  Phone,
  UserCheck,
  HeartHandshake,
  FileText,
  BadgeCheck,
  Layers,
  Sparkles
} from 'lucide-react';

interface LAZItem {
  no: number;
  name: string;
  skala: string;
  provinsi: string;
  kabupaten?: string;
  lokasi_singkat?: string;
  alamat_lengkap?: string;
  simzat_detail_url: string;
  foz_member?: boolean;
  donation_url?: string;
  slug?: string;
  instagram_url?: string;
  website_url?: string;
  sk_number?: string;
  berlaku_sampai?: string;
  alamat?: string;
  email?: string;
  phone?: string;
  pimpinan?: string;
  logo_url?: string;
  jumlah_perwakilan?: number;
  perwakilan_daerah?: { wilayah: string; alamat: string }[];
  status?: string;
  status_label?: string;
  is_hidden?: boolean;
}

export default function DirektoriLazPage() {
  const [lazList, setLazList] = useState<LAZItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkala, setSelectedSkala] = useState('Semua');
  const [selectedProvinsi, setSelectedProvinsi] = useState('Semua');
  const [activeLazDetail, setActiveLazDetail] = useState<LAZItem | null>(null);
  const [previewLogo, setPreviewLogo] = useState<{ url: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/data/laz_verified.json?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data: LAZItem[]) => {
        if (data && data.length > 0) {
          setLazList(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load LAZ directory', err);
        setIsLoading(false);
      });
  }, []);

  // Filtered LAZ (Otomatis menyembunyikan yang is_hidden === true kecuali jika user mencari spesifik)
  const filteredLaz = useMemo(() => {
    return lazList.filter((item) => {
      // Skenario HIDE: Jika disembunyikan/masa perpanjangan tanpa izin aktif, sembunyikan dari daftar default
      if (item.is_hidden) return false;

      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alamat && item.alamat.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSkala = selectedSkala === 'Semua' || item.skala === selectedSkala;
      const matchProvinsi = selectedProvinsi === 'Semua' || item.provinsi === selectedProvinsi;
      return matchSearch && matchSkala && matchProvinsi;
    });
  }, [lazList, searchQuery, selectedSkala, selectedProvinsi]);

  // Unique provinces list (hanya dari yang aktif tampil)
  const provinces = useMemo(() => {
    const activeItems = lazList.filter(item => !item.is_hidden);
    const setP = new Set(activeItems.map((item) => item.provinsi).filter(Boolean));
    return ['Semua', ...Array.from(setP).sort()];
  }, [lazList]);

  // Counts by scale (hanya dari yang aktif tampil)
  const skalaCounts = useMemo(() => {
    const activeItems = lazList.filter(item => !item.is_hidden);
    const counts: Record<string, number> = { Semua: activeItems.length, Nasional: 0, Provinsi: 0, 'Kabupaten/Kota': 0 };
    activeItems.forEach((item) => {
      if (counts[item.skala] !== undefined) {
        counts[item.skala]++;
      }
    });
    return counts;
  }, [lazList]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1e1b4b] text-slate-200 text-xs border-b border-slate-800">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-slate-300 truncate text-xs">
              Sinkronisasi SIMZAT Kementerian Agama RI
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>218 Terdata</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HEADER NAV */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] h-20 flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-10 w-10 shrink-0">
                <Image 
                  src="/digizakat_icon.png" 
                  alt="Digizakat Icon" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#5a4ea4] group-hover:text-[#433880] transition leading-tight">
                  Digizakat
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Direktori 218 LAZ
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md relative hidden sm:block ml-auto">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Ketik nama LAZ, kota, atau provinsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#5a4ea4] rounded-full focus:outline-none transition-all"
            />
          </div>

        </div>
      </header>

      {/* 3. HERO / PAGE TITLE */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-8">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%]">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#eaf9fa] text-[#1d8286] border border-[#cbfbf1]">
              <BadgeCheck className="w-4 h-4 text-[#31c0c6]" />
              <span>Direktori Lembaga Amil Zakat Berizin Kemenag RI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Pencarian LAZ Terdata
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Cari data Lembaga Amil Zakat (LAZ) yang terdaftar di Kementerian Agama Republik Indonesia (Kemenag RI).
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Lembaga</span>
              <span className="text-2xl font-bold text-[#5a4ea4]">218</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Berizin Kemenag RI</span>
            </div>
            {/* Skala Nasional: Hijau */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Skala Nasional</span>
              <span className="text-2xl font-bold text-emerald-600">{skalaCounts['Nasional'] || 62}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Cakupan Seluruh RI</span>
            </div>
            {/* Skala Provinsi: Tosca */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Skala Provinsi</span>
              <span className="text-2xl font-bold text-[#31c0c6]">{skalaCounts['Provinsi'] || 49}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tingkat Wilayah</span>
            </div>
            {/* Skala Kab/Kota: Biru */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Skala Kab/Kota</span>
              <span className="text-2xl font-bold text-blue-600">{skalaCounts['Kabupaten/Kota'] || 107}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Akar Rumput Daerah</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FILTER & SEARCH CONTROL */}
      <section className="bg-white border-b border-slate-200 py-4 sticky top-20 z-30 shadow-xs">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%]">
          
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Search Input (Always visible on mobile & desktop) */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama lembaga, kota, atau provinsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#5a4ea4] rounded-xl focus:outline-none transition"
              />
            </div>

            {/* Scale Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(['Semua', 'Nasional', 'Provinsi', 'Kabupaten/Kota'] as const).map((skala) => (
                <button
                  key={skala}
                  onClick={() => setSelectedSkala(skala)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedSkala === skala
                      ? 'bg-[#5a4ea4] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {skala} ({skalaCounts[skala] || 0})
                </button>
              ))}
            </div>

            {/* Province Select Dropdown */}
            <div className="w-full md:w-56">
              <select
                value={selectedProvinsi}
                onChange={(e) => setSelectedProvinsi(e.target.value)}
                aria-label="Filter berdasarkan Provinsi"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#5a4ea4] focus:outline-none font-medium text-slate-700"
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov === 'Semua' ? 'Semua Provinsi' : prov}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Results Summary bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <strong className="text-slate-900">{filteredLaz.length}</strong> dari 218 lembaga amil zakat
            </span>
            {(searchQuery || selectedSkala !== 'Semua' || selectedProvinsi !== 'Semua') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSkala('Semua');
                  setSelectedProvinsi('Semua');
                }}
                className="text-xs font-semibold text-[#5a4ea4] hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 5. MAIN DIRECTORY GRID / TABLE */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 md:px-[10%] py-8">
        
        {isLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#5a4ea4]" />
            <p className="text-xs text-slate-500 font-medium">Memuat data direktori 218 LAZ...</p>
          </div>
        ) : filteredLaz.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada lembaga ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada lembaga amil zakat yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba gunakan kata kunci nama lain atau ubah filter skala/provinsi.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkala('Semua');
                setSelectedProvinsi('Semua');
              }}
              className="mt-2 px-4 py-2 bg-[#5a4ea4] text-white rounded-xl text-xs font-semibold"
            >
              Tampilkan Semua Lembaga
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLaz.map((laz) => {
              const isNasional = laz.skala === 'Nasional';
              const isProvinsi = laz.skala === 'Provinsi';

              return (
                <div
                  key={laz.no}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#5a4ea4]/50 hover:shadow-md transition duration-200 p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        #{laz.no}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isNasional
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isProvinsi
                              ? 'bg-teal-50 text-[#1d8286] border border-[#cbfbf1]'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {laz.skala}
                        </span>

                        {laz.foz_member && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-[#5a4ea4] border border-purple-200">
                            FOZ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LAZ Name & Logo */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (laz.logo_url) {
                            setPreviewLogo({
                              url: laz.logo_url.replace('sz=w240', 'sz=w1000').replace('sz=w200', 'sz=w1000'),
                              name: laz.name,
                            });
                          } else {
                            setActiveLazDetail(laz);
                          }
                        }}
                        title={laz.logo_url ? `Klik untuk memperbesar logo ${laz.name}` : `Lihat profil ${laz.name}`}
                        className="relative h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs hover:border-[#5a4ea4] hover:ring-2 hover:ring-[#5a4ea4]/20 hover:scale-105 transition cursor-pointer"
                      >
                        {laz.logo_url ? (
                          <img
                            src={laz.logo_url}
                            alt={laz.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#5a4ea4] transition" />
                        )}
                      </button>

                      <h3 
                        onClick={() => setActiveLazDetail(laz)}
                        className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[#5a4ea4] transition cursor-pointer line-clamp-2 leading-snug flex-1"
                      >
                        {laz.name}
                      </h3>
                    </div>

                    {/* Location Info (Kabupaten, Provinsi) & Info Cabang */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#5a4ea4] shrink-0" />
                        <span className="truncate font-medium">
                          {laz.lokasi_singkat || (laz.kabupaten ? `${laz.kabupaten}, ${laz.provinsi}` : `${laz.provinsi}, Indonesia`)}
                        </span>
                      </div>
                      {laz.jumlah_perwakilan && laz.jumlah_perwakilan > 0 ? (
                        <span className="text-[10px] font-semibold text-[#5a4ea4] bg-[#f2f0fa] px-2 py-0.5 rounded-full border border-[#d6d0ee] shrink-0">
                          +{laz.jumlah_perwakilan} Cabang
                        </span>
                      ) : null}
                    </div>

                    {/* Legalitas status preview */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-slate-400 shrink-0">SK Kemenag:</span>
                      <span className="font-semibold text-slate-700 truncate text-right font-mono text-[10px]" title={laz.sk_number}>
                        {laz.sk_number ? `No. ${laz.sk_number}` : 'Terdaftar'}
                      </span>
                    </div>

                  </div>

                  {/* Actions CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setActiveLazDetail(laz)}
                      className="w-full py-2.5 px-3 bg-slate-50 hover:bg-[#f2f0fa] text-[#433880] rounded-xl text-xs font-semibold text-center border border-slate-200 hover:border-[#d6d0ee] transition cursor-pointer"
                    >
                      Lihat Profil & SK
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* 6. MODAL DETAIL POPUP */}
      {activeLazDetail && (
        <div
          onClick={() => setActiveLazDetail(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#1e1b4b] to-[#382f6e] text-white flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (activeLazDetail.logo_url) {
                      setPreviewLogo({
                        url: activeLazDetail.logo_url.replace('sz=w240', 'sz=w1000').replace('sz=w200', 'sz=w1000'),
                        name: activeLazDetail.name,
                      });
                    }
                  }}
                  disabled={!activeLazDetail.logo_url}
                  title={activeLazDetail.logo_url ? 'Klik untuk memperbesar logo' : undefined}
                  className={`relative h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden transition ${
                    activeLazDetail.logo_url ? 'cursor-zoom-in hover:scale-105 hover:ring-2 hover:ring-white/60' : 'cursor-default'
                  }`}
                >
                  {activeLazDetail.logo_url ? (
                    <img
                      src={activeLazDetail.logo_url}
                      alt={activeLazDetail.name}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#5a4ea4]" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                      {activeLazDetail.skala}
                    </span>
                    <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Terdaftar Kemenag
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
                    {activeLazDetail.name}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveLazDetail(null)}
                className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Nomor Registrasi:</span>
                  <span className="font-bold text-[#5a4ea4]">LAZ #{activeLazDetail.no}</span>
                </div>
                {activeLazDetail.sk_number && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Nomor SK Kemenag:</span>
                    <span className="font-mono text-slate-800 text-[11px] font-semibold">{activeLazDetail.sk_number}</span>
                  </div>
                )}
                {activeLazDetail.foz_member && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Keanggotaan Forum Zakat (FOZ):</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Anggota FOZ
                    </span>
                  </div>
                )}
                {activeLazDetail.jumlah_perwakilan && activeLazDetail.jumlah_perwakilan > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Kantor Perwakilan / Cabang:</span>
                    <span className="font-semibold text-[#5a4ea4]">{activeLazDetail.jumlah_perwakilan} Wilayah</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2.5 text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#5a4ea4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Lokasi Kantor Pusat:</span>
                    <span className="font-medium text-slate-800">
                      {activeLazDetail.lokasi_singkat || `${activeLazDetail.provinsi}, Indonesia`}
                    </span>
                    {activeLazDetail.alamat_lengkap && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {activeLazDetail.alamat_lengkap}
                      </span>
                    )}
                  </div>
                </div>

                {activeLazDetail.perwakilan_daerah && activeLazDetail.perwakilan_daerah.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-[#5a4ea4] shrink-0" />
                      <span className="font-semibold text-slate-900">
                        Kantor Perwakilan / Cabang ({activeLazDetail.perwakilan_daerah.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeLazDetail.perwakilan_daerah.map((cabang, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="font-semibold text-slate-800 block text-[11px]">
                            {idx + 1}. {cabang.wilayah}
                          </span>
                          {cabang.alamat && (
                            <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                              {cabang.alamat}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeLazDetail.pimpinan && (
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-[#5a4ea4] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Pimpinan:</span>
                      <span>{activeLazDetail.pimpinan}</span>
                    </div>
                  </div>
                )}

                {activeLazDetail.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#5a4ea4] shrink-0" />
                    <span className="font-semibold text-slate-900">Kontak:</span>
                    <span>{activeLazDetail.phone}</span>
                  </div>
                )}
              </div>

              {/* Tautan Media Sosial & Website */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {activeLazDetail.instagram_url && (
                  <a
                    href={activeLazDetail.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition border border-rose-200"
                  >
                    Instagram Resmi
                  </a>
                )}
                {activeLazDetail.website_url && (
                  <a
                    href={activeLazDetail.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition border border-slate-200"
                  >
                    <Globe className="w-4 h-4" /> Web Utama
                  </a>
                )}
              </div>

            </div>

            {/* Modal Footer CTA (Hanya muncul jika lembaga memiliki platform crowdfunding/donasi resmi) */}
            {activeLazDetail.donation_url && !activeLazDetail.donation_url.includes('simzat.kemenag.go.id') && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <a
                  href={activeLazDetail.donation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#31c0c6] hover:bg-[#259fa4] text-white rounded-xl text-center text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition"
                >
                  <HeartHandshake className="w-4 h-4" />
                  Donasi di Platform Resmi ↗
                </a>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6B. LIGHTBOX PREVIEW LOGO */}
      {previewLogo && (
        <div
          onClick={() => setPreviewLogo(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {previewLogo.name}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewLogo(null)}
                className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="p-8 bg-slate-50 flex items-center justify-center min-h-[260px]">
              <img
                src={previewLogo.url}
                alt={previewLogo.name}
                className="max-h-64 max-w-full object-contain drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end gap-2">
              <a
                href={previewLogo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#f2f0fa] hover:bg-[#e4e0f5] text-[#433880] border border-[#d6d0ee] transition"
              >
                <span>Buka Gambar Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER & ATRIBUSI RESMI SIMZAT */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] space-y-6">
          
          {/* Box Keterangan Sumber SIMZAT */}
          <div className="bg-[#f8f9fc] p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-xs sm:text-sm">Sumber Data: SIMZAT Kemenag RI</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Tersinkronisasi</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">
                Seluruh data direktori 218 Lembaga Amil Zakat di halaman ini bersumber langsung dari Sistem Informasi Manajemen Zakat (SIMZAT) Ditjen Bimas Islam Kementerian Agama Republik Indonesia.
              </p>
            </div>
            <a
              href="https://simzat.kemenag.go.id/simzat/apps/web/daftar_laz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-[#5a4ea4] border border-[#d6d0ee] transition shadow-xs shrink-0"
            >
              <span>Buka Portal SIMZAT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6">
                <Image src="/digizakat_icon.png" alt="Digizakat" fill className="object-contain" />
              </div>
              <span>© {new Date().getFullYear()} Digizakat.com — Ensiklopedi & Radar Gerakan Zakat Indonesia.</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
