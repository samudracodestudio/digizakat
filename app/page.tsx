'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  BookOpen, 
  Radio, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  HeartHandshake,
  CheckCircle2,
  Info,
  Globe,
  Phone,
  Mail,
  X,
  UserCheck,
  TrendingUp,
  Clock,
  Compass,
  FileText,
  Calculator
} from 'lucide-react';
import { LAZItem, OPZPost, EncyclopediaEntry, SAMPLE_POSTS, SAMPLE_ENCYCLOPEDIA } from '../data/types';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
  className,
  priority = false
}: { 
  src: string; 
  alt: string; 
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image 
      src={imgSrc || fallbackSrc} 
      alt={alt} 
      fill 
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={className} 
    />
  );
}

export default function HomePage() {
  // Mobile Navigation tabs
  const [activeTab, setActiveTab] = useState<'berita' | 'laz' | 'ensiklopedia'>('berita');
  
  // Data states
  const [lazList, setLazList] = useState<LAZItem[]>([]);
  const [loadingLaz, setLoadingLaz] = useState(true);
  const [postsList, setPostsList] = useState<OPZPost[]>(SAMPLE_POSTS);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedSkala, setSelectedSkala] = useState<string>('Semua');
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>('Semua');

  // Selected LAZ for in-app Profile Modal
  const [activeLazDetail, setActiveLazDetail] = useState<LAZItem | null>(null);

  // Quick Zakat Calculator Modal State
  const [showCalculator, setShowCalculator] = useState(false);
  const [gajiBulanan, setGajiBulanan] = useState<number | ''>('');
  const [bonusLain, setBonusLain] = useState<number | ''>('');
  const hargaEmasPerGram = 1450000; // Standar emas terkini
  const nisabTahunan = 85 * hargaEmasPerGram; // 85 gram emas
  const nisabBulanan = Math.round(nisabTahunan / 12);

  const totalPendapatan = (Number(gajiBulanan) || 0) + (Number(bonusLain) || 0);
  const wajibZakat = totalPendapatan >= nisabBulanan;
  const nilaiZakat = wajibZakat ? Math.round(totalPendapatan * 0.025) : 0;

  // Fetch verified 218 LAZ data and live wire news
  useEffect(() => {
    fetch('/data/laz_verified.json')
      .then((res) => res.json())
      .then((data: LAZItem[]) => {
        setLazList(data);
        setLoadingLaz(false);
      })
      .catch((err) => {
        console.error('Failed to load LAZ data', err);
        setLoadingLaz(false);
      });

    fetch('/data/live_news.json')
      .then((res) => res.json())
      .then((data: OPZPost[]) => {
        if (data && data.length > 0) {
          setPostsList(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load live news, fallback to sample', err);
      });
  }, []);

  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);

  // Filtered LAZ
  const filteredLaz = useMemo(() => {
    return lazList.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.provinsi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSkala = selectedSkala === 'Semua' || item.skala === selectedSkala;
      const matchProvinsi = selectedProvinsi === 'Semua' || item.provinsi === selectedProvinsi;
      return matchSearch && matchSkala && matchProvinsi;
    });
  }, [lazList, searchQuery, selectedSkala, selectedProvinsi]);

  // Unique provinces list
  const provinces = useMemo(() => {
    const setP = new Set(lazList.map((item) => item.provinsi).filter(Boolean));
    return ['Semua', ...Array.from(setP).sort()];
  }, [lazList]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return postsList.filter((post) => {
      const matchCat = selectedCategory === 'Semua' || post.category === selectedCategory || post.asnaf.includes(selectedCategory);
      const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.opz_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [postsList, selectedCategory, searchQuery]);

  // 4 Berita Teratas untuk Headline Rolling Deck
  const top4Posts = useMemo(() => {
    return filteredPosts.slice(0, 4);
  }, [filteredPosts]);

  // Auto-roll headline tiap 10 detik
  useEffect(() => {
    if (top4Posts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveHeadlineIndex((prev) => (prev + 1) % top4Posts.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [top4Posts.length]);

  // Headline item yang sedang aktif di-rolling
  const headlinePost = top4Posts[activeHeadlineIndex] || filteredPosts[0] || postsList[0];
  // Sub-cards (3 berita lain dari top 4 selain headlinePost, atau semua 4 berita dengan indikator aktif)
  const secondaryPosts = filteredPosts.slice(4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP BAR & EDITORIAL TICKER (ALA TEMPO.CO)                    */}
      {/* ============================================================== */}
      <div className="bg-[#1e1b4b] text-slate-200 text-xs border-b border-slate-800">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-[#5a4ea4] text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase shrink-0">
              RADAR TERKINI
            </span>
            <span className="text-slate-300 truncate text-xs">
              Memonitor 218 Lembaga Amil Zakat Resmi Kemenag RI & Anggota Forum Zakat (FOZ)
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-[11px] text-slate-300">
            <button 
              onClick={() => setShowCalculator(true)}
              className="flex items-center gap-1.5 text-teal-300 hover:text-white font-medium transition"
            >
              <Calculator className="w-3.5 h-3.5 text-[#31c0c6]" />
              <span>Kalkulator Zakat</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independen & Nirlaba</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN HEADER & LOGO (EDITORIAL JOURNALISM STYLE)             */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] h-20 flex items-center justify-between gap-6">
          
          {/* Logo Brand & Slogan */}
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0">
              <Image 
                src="/digizakat_icon.png" 
                alt="Digizakat Icon" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#5a4ea4] leading-tight">
                Digizakat
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Radar & Ensiklopedi
              </span>
            </div>
            <div className="hidden lg:block pl-3 border-l border-slate-200 ml-1">
              <span className="text-xs font-semibold text-slate-600">
                Gerakan Zakat Indonesia
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari program, LAZ, fiqh nisab, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#5a4ea4] rounded-full focus:outline-none transition-all"
            />
          </div>

          {/* Cek Legalitas Button */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="#direktori-laz"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#f2f0fa] hover:bg-[#e4e0f5] text-[#382f6e] border border-[#d6d0ee] transition"
            >
              <Building2 className="w-3.5 h-3.5 text-[#5a4ea4]" />
              <span>Direktori 218 LAZ</span>
            </a>
          </div>

        </div>

        {/* Editorial Rubric Categories Bar */}
        <div className="border-t border-slate-100 bg-white">
          <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%] flex items-center gap-6 overflow-x-auto no-scrollbar py-2 text-xs font-medium text-slate-600">
            <button 
              onClick={() => setSelectedCategory('Semua')}
              className={`whitespace-nowrap pb-0.5 border-b-2 font-semibold transition ${
                selectedCategory === 'Semua' ? 'border-[#5a4ea4] text-[#5a4ea4]' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Semua Berita
            </button>
            <button 
              onClick={() => setSelectedCategory('Ekonomi Mustahik')}
              className={`whitespace-nowrap pb-0.5 border-b-2 font-semibold transition ${
                selectedCategory === 'Ekonomi Mustahik' ? 'border-[#5a4ea4] text-[#5a4ea4]' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Ekonomi Mustahik
            </button>
            <button 
              onClick={() => setSelectedCategory('Kebencanaan')}
              className={`whitespace-nowrap pb-0.5 border-b-2 font-semibold transition ${
                selectedCategory === 'Kebencanaan' ? 'border-[#5a4ea4] text-[#5a4ea4]' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Tanggap Bencana
            </button>
            <button 
              onClick={() => setSelectedCategory('Pendidikan')}
              className={`whitespace-nowrap pb-0.5 border-b-2 font-semibold transition ${
                selectedCategory === 'Pendidikan' ? 'border-[#5a4ea4] text-[#5a4ea4]' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Pendidikan & Beasiswa
            </button>
            <button 
              onClick={() => setSelectedCategory('Kesehatan')}
              className={`whitespace-nowrap pb-0.5 border-b-2 font-semibold transition ${
                selectedCategory === 'Kesehatan' ? 'border-[#5a4ea4] text-[#5a4ea4]' : 'border-transparent hover:text-slate-900'
              }`}
            >
              Kesehatan Dhuafa
            </button>
            <a 
              href="#khazanah-fiqh" 
              className="whitespace-nowrap pb-0.5 border-b-2 border-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1 ml-auto"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#5a4ea4]" /> Fiqh & Fatwa
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. MAIN EDITORIAL CONTENT (TEMPO.CO 2-COLUMN STRUCTURE)        */}
      {/* ============================================================== */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 md:px-[10%] py-6">
        
        {/* DESKTOP VIEW (>= md) - PERSIS TEMPO 75% : 25% DENGAN 10% MARGIN KANAN-KIRI */}
        <div className="hidden md:grid grid-cols-12 gap-8 items-start">
          
          {/* ----------------------------------------------------------- */}
          {/* KOLOM KIRI (9 Kolom = 75%): HEADLINE + 3 SUB-KOLOM + FEED  */}
          {/* ----------------------------------------------------------- */}
          <div className="col-span-9 space-y-8 pr-2">
            
            {/* BERITA UTAMA / HEADLINE EDITORIAL (FOKUS ALA TEMPO DENGAN ROLLING 4 TERBARU) */}
            {headlinePost && (
              <section className="border-b border-slate-200 pb-8">
                
                <a 
                  href={headlinePost.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group block cursor-pointer"
                >
                  {/* Foto Utama Besar Dominan */}
                  <div className="relative h-[420px] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                    <SafeImage 
                      src={headlinePost.image_url} 
                      alt={headlinePost.title} 
                      className="object-cover group-hover:scale-101 transition duration-500" 
                      priority
                    />
                    <div className="absolute bottom-3 left-4 text-[11px] font-semibold text-white/95 drop-shadow-md tracking-wider uppercase bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      DIGIZAKAT / {headlinePost.opz_name}
                    </div>
                  </div>

                  {/* Judul Headline Besar Bold */}
                  <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-slate-950 group-hover:text-[#5a4ea4] transition leading-tight tracking-tight">
                    {headlinePost.title}
                  </h1>

                  {/* Ringkasan Berita */}
                  <p className="mt-3 text-base text-slate-600 leading-relaxed font-normal">
                    {headlinePost.summary}
                  </p>
                </a>

                {/* Bar Aksi (Instagram & Baca Rilis) Tepat Di Bawah Judul & Ringkasan Berita */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {headlinePost.instagram_url ? (
                      <a 
                        href={headlinePost.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" /> <span>Instagram Resmi</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        RILIS RESMI OPZ
                      </span>
                    )}
                  </div>

                  <a
                    href={headlinePost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#31c0c6] hover:bg-[#259fa4] text-white font-semibold text-xs shadow-xs hover:shadow transition"
                  >
                    <span>Baca Rilis Selengkapnya</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* ROLLING DECK: 4 BERITA TERBARU DI BAWAH HEADLINE */}
                {top4Posts.length > 1 && (
                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                        PILIH HEADLINE (4 TERBARU)
                      </span>
                      <span className="text-[11px] text-[#5a4ea4] font-medium">
                        Klik kolom untuk memutar headline
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {top4Posts.map((post, idx) => {
                        const isActive = idx === activeHeadlineIndex;
                        return (
                          <button
                            key={post.id || idx}
                            type="button"
                            onClick={() => setActiveHeadlineIndex(idx)}
                            className={`p-3 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                              isActive 
                                ? 'bg-[#f4f2fb] border-[#5a4ea4] shadow-xs ring-1 ring-[#5a4ea4]/30' 
                                : 'bg-slate-50 hover:bg-[#f7f6fc] border-slate-200 hover:border-[#d6d0ee]'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#5a4ea4]' : 'text-slate-400'}`}>
                                  {isActive ? '● SEDANG AKTIF' : `#${idx + 1}`}
                                </span>
                              </div>
                              <h4 className={`text-xs font-semibold leading-snug line-clamp-2 ${isActive ? 'text-[#382f6e]' : 'text-slate-800'}`}>
                                {post.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-medium mt-2 truncate">
                              {post.opz_name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* DAFTAR BERITA SUB-HEADLINE (LIST HORIZONTAL ALA TEMPO) */}
            <section className="space-y-6">
              <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 uppercase tracking-wide">
                  LIPUTAN KHUSUS & PROGRAM GERAKAN
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {secondaryPosts.length} rilis terverifikasi
                </span>
              </div>

              <div className="divide-y divide-slate-200 space-y-6">
                {secondaryPosts.map((post) => (
                  <article key={post.id} className="pt-6 first:pt-0 group">
                    <div className="grid grid-cols-12 gap-5 items-start">
                      
                      {/* Konten Teks */}
                      <div className="col-span-9 space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-[#5a4ea4]">{post.opz_name}</span>
                          <span>•</span>
                          <span>{post.published_at}</span>
                          <span>•</span>
                          <span className="text-slate-400">{post.location}</span>
                        </div>

                        <a 
                          href={post.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#5a4ea4] transition leading-snug">
                            {post.title}
                          </h3>
                        </a>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>

                        <div className="pt-2 flex items-center gap-3">
                          <a
                            href={post.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#1d8286] hover:text-[#176a6e] inline-flex items-center gap-1 bg-[#eaf9fa] px-2.5 py-1 rounded-lg border border-[#cbfbf1]"
                          >
                            <span>Baca Rilis</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {post.instagram_url && (
                            <>
                              <span className="text-slate-300">•</span>
                              <a
                                href={post.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-400 hover:text-rose-600 inline-flex items-center gap-1"
                              >
                                <InstagramIcon className="w-3 h-3" /> IG
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Gambar (Bisa di-klik juga) */}
                      <a 
                        href={post.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="col-span-3 relative h-24 rounded-xl overflow-hidden bg-slate-100 shadow-xs block shrink-0"
                      >
                        <SafeImage 
                          src={post.image_url} 
                          alt={post.title} 
                          className="object-cover group-hover:scale-105 transition duration-300" 
                        />
                      </a>

                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* KHAZANAH & ENSIKLOPEDI FIQH ZAKAT (MODULAR BOX ALA EDITORIAL) */}
            <section id="khazanah-fiqh" className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-[#5a4ea4] uppercase block">
                    RUJUKAN FIQH & ASNAF
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#5a4ea4]" /> Ensiklopedi & Fatwa Zakat
                  </h3>
                </div>
                <button 
                  onClick={() => setShowCalculator(true)}
                  className="px-3 py-1.5 bg-white border border-[#d6d0ee] hover:bg-[#f2f0fa] text-[#433880] rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#5a4ea4]" /> Hitung Zakat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_ENCYCLOPEDIA.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-[#5a4ea4] transition group shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#5a4ea4]">
                        {item.term}
                      </h4>
                      {item.arabic && (
                        <span className="text-xs font-serif text-slate-400">
                          {item.arabic}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.definition}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Rujukan: {item.references[0]}</span>
                      <span className="text-[#5a4ea4] font-medium group-hover:underline">Detail ↗</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>


          {/* ----------------------------------------------------------- */}
          {/* KOLOM KANAN (3 Kolom = 25%): ARTIKEL TERBARU ALA TEMPO       */}
          {/* ----------------------------------------------------------- */}
          <aside className="col-span-3 space-y-6">
            
            {/* WIDGET ARTIKEL TERBARU PERSIS TAMPILAN TEMPO */}
            <div className="bg-white pb-5">
              <h3 className="text-sm font-semibold text-slate-950 uppercase tracking-tight mb-4 border-b border-slate-900 pb-1.5">
                ARTIKEL TERBARU
              </h3>

              <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <a 
                    key={post.id} 
                    href={post.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="py-3 first:pt-0 group cursor-pointer block"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Thumbnail Kotak Persegi Kecil */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                        <SafeImage 
                          src={post.image_url} 
                          alt={post.title} 
                          className="object-cover" 
                        />
                      </div>
                      
                      {/* Judul & Waktu */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#5a4ea4] transition leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {post.published_at}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* DIREKTORI 218 LAZ RESMI (KOMPAK & STICKY) */}
            <div id="direktori-laz" className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sticky top-24 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
                <h3 className="text-xs font-semibold text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#5a4ea4]" /> DIREKTORI 218 LAZ
                </h3>
                <span className="text-[10px] font-semibold bg-[#f2f0fa] text-[#433880] px-2.5 py-0.5 rounded-full border border-[#d6d0ee]">
                  {filteredLaz.length}
                </span>
              </div>

              {/* Filter Skala Ringkas */}
              <select
                value={selectedSkala}
                onChange={(e) => setSelectedSkala(e.target.value)}
                className="w-full text-[11px] bg-white border border-slate-200 rounded-xl p-2 font-medium mb-2.5 focus:outline-none focus:border-[#5a4ea4] shadow-xs"
              >
                <option value="Semua">Semua Skala</option>
                <option value="Nasional">Nasional (62)</option>
                <option value="Provinsi">Provinsi (49)</option>
                <option value="Kabupaten/Kota">Kab/Kota (107)</option>
              </select>

              {/* Daftar LAZ */}
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1 space-y-1">
                {loadingLaz ? (
                  <div className="py-6 text-center text-xs text-slate-400">Memuat data...</div>
                ) : filteredLaz.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Tidak ditemukan.</div>
                ) : (
                  filteredLaz.map((laz) => (
                    <div key={laz.no} className="py-2.5 px-2 rounded-xl hover:bg-white transition group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 
                            onClick={() => setActiveLazDetail(laz)}
                            className="text-xs font-semibold text-slate-900 group-hover:text-[#5a4ea4] transition leading-snug cursor-pointer line-clamp-1"
                          >
                            {laz.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                            {laz.skala} • {laz.provinsi}
                          </span>
                        </div>
                        <a
                          href={laz.donation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-[#1d8286] bg-[#eaf9fa] hover:bg-[#d5f5f7] px-2.5 py-1 rounded-lg shrink-0 border border-[#cbfbf1] transition shadow-xs"
                        >
                          Donasi ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 text-center">
                SIMZAT Kemenag & FOZ
              </div>
            </div>

          </aside>

        </div>


        {/* ------------------------------------------------------------- */}
        {/* MOBILE VIEW (< md)                                            */}
        {/* ------------------------------------------------------------- */}
        <div className="md:hidden pb-16 space-y-4">
          
          {/* TAB 1: RADAR BERITA */}
          {activeTab === 'berita' && (
            <div className="space-y-4">
              {headlinePost && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <a 
                    href={headlinePost.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative h-48 w-full bg-slate-100">
                      <SafeImage 
                        src={headlinePost.image_url} 
                        alt={headlinePost.title} 
                        className="object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-[#1e1b4b]/90 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                        {headlinePost.opz_name}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-slate-400 mb-1">{headlinePost.published_at} • {headlinePost.location}</div>
                      <h2 className="text-base font-semibold text-slate-900 leading-snug">
                        {headlinePost.title}
                      </h2>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                        {headlinePost.summary}
                      </p>
                    </div>
                  </a>

                  {/* Bar Aksi di Bawah Teks Judul & Ringkasan Berita (Mobile) */}
                  <div className="p-3 bg-slate-50 flex items-center justify-between gap-2">
                    {headlinePost.instagram_url ? (
                      <a 
                        href={headlinePost.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        RILIS OPZ
                      </span>
                    )}
                    <a 
                      href={headlinePost.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#31c0c6] hover:bg-[#259fa4] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <span>Baca Rilis</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Rolling 4 Berita Selector di Mobile */}
                  {top4Posts.length > 1 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-2">
                        PILIH HEADLINE
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {top4Posts.map((post, idx) => {
                          const isActive = idx === activeHeadlineIndex;
                          return (
                            <button
                              key={post.id || idx}
                              type="button"
                              onClick={() => setActiveHeadlineIndex(idx)}
                              className={`p-2 rounded-lg text-left border transition text-[11px] leading-tight ${
                                isActive 
                                  ? 'bg-[#f4f2fb] border-[#5a4ea4] text-[#382f6e] font-semibold' 
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="truncate font-bold text-[9px] uppercase text-slate-400 mb-0.5">
                                {isActive ? '● AKTIF' : `#${idx + 1}`}
                              </div>
                              <span className="line-clamp-2">{post.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* List Berita Lainnya */}
              <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl p-3">
                {secondaryPosts.map((post) => (
                  <a 
                    key={post.id} 
                    href={post.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="py-3 first:pt-1 block"
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] text-[#5a4ea4] font-semibold block">{post.opz_name}</span>
                        <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 mt-0.5">{post.title}</h3>
                        <span className="text-[10px] text-slate-400 mt-1 block">{post.published_at}</span>
                      </div>
                      <div className="relative w-20 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                        <SafeImage src={post.image_url} alt={post.title} className="object-cover" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DIREKTORI 218 LAZ */}
          {activeTab === 'laz' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">218 Lembaga Resmi Kemenag RI</span>
                <span className="bg-[#5a4ea4] text-white px-2 py-0.5 rounded-full font-semibold text-[10px]">{filteredLaz.length}</span>
              </div>
              
              <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl p-3">
                {filteredLaz.map((laz) => (
                  <div key={laz.no} className="py-3 first:pt-1 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 onClick={() => setActiveLazDetail(laz)} className="text-xs font-semibold text-slate-900 truncate">
                        {laz.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{laz.skala} • {laz.provinsi}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => setActiveLazDetail(laz)} 
                        className="text-[10px] bg-slate-100 px-2 py-1 rounded font-semibold text-slate-700"
                      >
                        Profil
                      </button>
                      <a 
                        href={laz.donation_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] bg-[#31c0c6] text-white px-2 py-1 rounded font-semibold"
                      >
                        Donasi ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENSIKLOPEDI */}
          {activeTab === 'ensiklopedia' && (
            <div className="space-y-3">
              {SAMPLE_ENCYCLOPEDIA.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900">{item.term}</h4>
                    {item.arabic && <span className="text-xs font-serif text-slate-400">{item.arabic}</span>}
                  </div>
                  <p className="text-xs text-slate-600">{item.definition}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* ============================================================== */}
      {/* 4. MODAL KALKULATOR ZAKAT (RINGKAS & EDUKATIF)                  */}
      {/* ============================================================== */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-4 bg-gradient-to-r from-[#433880] to-[#5a4ea4] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-300" />
                <h3 className="font-semibold text-sm">Kalkulator Zakat Penghasilan</h3>
              </div>
              <button 
                onClick={() => setShowCalculator(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Standar Nisab Emas (85 gr):</span>
                  <span className="font-semibold text-slate-800">Rp {nisabTahunan.toLocaleString('id-ID')} / tahun</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Nisab per Bulan:</span>
                  <span className="font-semibold text-[#5a4ea4]">Rp {nisabBulanan.toLocaleString('id-ID')} / bulan</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gaji / Penghasilan Pokok per Bulan (Rp):</label>
                <input 
                  type="number"
                  placeholder="Contoh: 10000000"
                  value={gajiBulanan}
                  onChange={(e) => setGajiBulanan(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:border-[#5a4ea4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tunjangan, Bonus, atau Freelance (Rp):</label>
                <input 
                  type="number"
                  placeholder="Contoh: 2000000"
                  value={bonusLain}
                  onChange={(e) => setBonusLain(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:border-[#5a4ea4] focus:outline-none"
                />
              </div>

              {/* Hasil Perhitungan */}
              <div className={`p-4 rounded-xl border ${
                wajibZakat 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Status Nisab:
                </div>
                {wajibZakat ? (
                  <div>
                    <div className="text-sm font-semibold text-emerald-800">
                      Wajib Zakat (Mencapai Nisab)
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-emerald-200">
                      <span className="text-xs">Besaran Zakat (2.5%):</span>
                      <span className="text-base font-semibold text-emerald-700">
                        Rp {nilaiZakat.toLocaleString('id-ID')} / bulan
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      Belum Mencapai Nisab
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Total pendapatan belum melampaui batas Rp {nisabBulanan.toLocaleString('id-ID')}/bln. Anda dianjurkan bersedekah atau infak sukarela.
                    </p>
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400">Rujukan: Fatwa MUI No. 3 Th 2003</span>
              <button
                onClick={() => {
                  setShowCalculator(false);
                  const el = document.getElementById('direktori-laz');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-[#31c0c6] hover:bg-[#259fa4] text-white rounded-lg text-xs font-semibold transition"
              >
                Salurkan ke LAZ Pilihan ↗
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL PROFIL LAZ (TERVERIFIKASI & LENGKAP)                   */}
      {/* ============================================================== */}
      {activeLazDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-[#433880] to-[#5a4ea4] text-white relative">
              <button 
                onClick={() => setActiveLazDetail(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                {activeLazDetail.logo_url ? (
                  <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 shadow">
                    <img src={activeLazDetail.logo_url} alt={activeLazDetail.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-semibold text-lg">
                    {activeLazDetail.name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-400 text-emerald-950">
                    <ShieldCheck className="w-3 h-3" /> Berizin Kemenag RI
                  </div>
                  <h3 className="text-base font-semibold leading-tight mt-1">{activeLazDetail.name}</h3>
                  <p className="text-xs text-purple-200">{activeLazDetail.skala} • {activeLazDetail.provinsi}</p>
                </div>
              </div>
            </div>

            {/* Konten Detail Profil */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Nomor Registrasi SIMZAT:</span>
                  <span className="font-mono font-semibold text-slate-800">#{activeLazDetail.no}</span>
                </div>
                {activeLazDetail.sk_number && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Nomor SK Izin LAZ:</span>
                    <span className="font-semibold text-purple-900">{activeLazDetail.sk_number}</span>
                  </div>
                )}
                {activeLazDetail.berlaku_sampai && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Masa Berlaku Izin:</span>
                    <span className="font-medium text-slate-700">s.d. {activeLazDetail.berlaku_sampai}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Keanggotaan Forum Zakat (FOZ):</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terdaftar Aktif
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#5a4ea4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Kantor:</span>
                    <span>{activeLazDetail.alamat || `${activeLazDetail.provinsi}, Indonesia`}</span>
                  </div>
                </div>

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
                    <InstagramIcon className="w-4 h-4" /> Instagram Resmi
                  </a>
                )}
                {activeLazDetail.website_url && (
                  <a
                    href={activeLazDetail.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition border border-slate-200"
                  >
                    <Globe className="w-4 h-4" /> Web Utama
                  </a>
                )}
              </div>

            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <a
                href={activeLazDetail.simzat_detail_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1 flex items-center gap-1"
              >
                Cek SK Kemenag <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={activeLazDetail.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#31c0c6] hover:bg-[#259fa4] text-white rounded-xl text-center text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition"
              >
                <HeartHandshake className="w-4 h-4" />
                Donasi di Situs Resmi ↗
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MOBILE BOTTOM NAVIGATION (FIXED)                            */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('berita')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'berita' ? 'text-[#5a4ea4] font-semibold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px]">Radar Berita</span>
        </button>

        <button
          onClick={() => setActiveTab('laz')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'laz' ? 'text-[#5a4ea4] font-semibold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">218 LAZ</span>
        </button>

        <button
          onClick={() => setActiveTab('ensiklopedia')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'ensiklopedia' ? 'text-[#5a4ea4] font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Ensiklopedi</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* 7. FOOTER (EDITORIAL CLEAN)                                    */}
      {/* ============================================================== */}
      <footer className="hidden md:block bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 py-10 text-xs">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-[10%]">
          <div className="grid grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            <div className="col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-9 shrink-0">
                  <Image 
                    src="/digizakat_icon.png" 
                    alt="Digizakat Icon" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Digizakat</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Ensiklopedi independen dan radar gerakan zakat di Indonesia. Tidak mengumpulkan maupun memotong donasi publik. Seluruh transaksi diarahkan langsung ke portal crowdfunding resmi 218 LAZ berizin Kementerian Agama RI.
              </p>
            </div>

            <div className="col-span-3 space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Rubrik & Liputan</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#" className="hover:text-white">Ekonomi Mustahik</a></li>
                <li><a href="#" className="hover:text-white">Tanggap Darurat Bencana</a></li>
                <li><a href="#" className="hover:text-white">Pendidikan & Santri</a></li>
                <li><a href="#" className="hover:text-white">Kesehatan Dhuafa</a></li>
              </ul>
            </div>

            <div className="col-span-4 space-y-2">
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Transparansi & Regulasi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Basis data kelembagaan disinkronkan secara berkala dengan Sistem Informasi Manajemen Zakat (SIMZAT) Ditjen Bimas Islam Kemenag RI dan Forum Zakat (FOZ).
              </p>
              <div className="pt-2 text-teal-400 font-semibold">
                Domain Resmi: digizakat.com
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <div>© {new Date().getFullYear()} Neo Digizakat. Ensiklopedi & Radar Gerakan Zakat Indonesia.</div>
            <div className="flex gap-4">
              <span>Nirlaba & Edukasi Publik</span>
              <span>•</span>
              <span>SIMZAT Kemenag RI</span>
              <span>•</span>
              <span>Forum Zakat (FOZ)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
