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
  Share2, 
  MapPin, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Bookmark, 
  HeartHandshake,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Globe,
  Phone,
  Mail,
  FileText,
  X,
  UserCheck
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

export default function HomePage() {
  // Navigation tabs for mobile view
  const [activeTab, setActiveTab] = useState<'radar' | 'ensiklopedia' | 'laz' | 'about'>('radar');
  
  // Data states
  const [lazList, setLazList] = useState<LAZItem[]>([]);
  const [loadingLaz, setLoadingLaz] = useState(true);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedSkala, setSelectedSkala] = useState<string>('Semua');
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>('Semua');

  // Selected LAZ for dedicated in-app Profile Modal
  const [activeLazDetail, setActiveLazDetail] = useState<LAZItem | null>(null);

  // Fetch verified 218 LAZ data
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
  }, []);

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
    return SAMPLE_POSTS.filter((post) => {
      const matchCat = selectedCategory === 'Semua' || post.category === selectedCategory || post.asnaf.includes(selectedCategory);
      const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.opz_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* ============================================================== */}
      {/* 1. TOP NAVBAR (SHARED DESKTOP & MOBILE)                        */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-28 sm:w-36">
              <Image 
                src="/digizakat_logo.png" 
                alt="Digizakat Logo" 
                fill 
                className="object-contain object-left"
                priority
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f2f0fa] text-[#382f6e] border border-[#d6d0ee]">
              <Sparkles className="w-3 h-3 text-[#5a4ea4]" /> Neo Ensiklopedi
            </span>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari 218 LAZ resmi, fatwa, istilah asnaf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#5a4ea4] rounded-full focus:outline-none transition-all shadow-sm"
            />
          </div>

          {/* Official Verification Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>218 LAZ SIMZAT Kemenag RI & FOZ</span>
          </div>
        </div>

        {/* Mobile Sub-Navigation Header Bar (Only visible on Mobile) */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-100 border-t border-slate-200 no-scrollbar gap-2">
          <button 
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'radar' ? 'bg-[#5a4ea4] text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" /> Radar Aksi
          </button>
          <button 
            onClick={() => setActiveTab('laz')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'laz' ? 'bg-[#5a4ea4] text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Building2 className="w-3 h-3" /> 218 LAZ Legal
          </button>
          <button 
            onClick={() => setActiveTab('ensiklopedia')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'ensiklopedia' ? 'bg-[#5a4ea4] text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3" /> Ensiklopedi
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN CONTAINER                                             */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner Hero Mini */}
        <div className="mb-6 bg-gradient-to-r from-[#433880] via-[#5a4ea4] to-[#1e1b4b] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-300 via-purple-300 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-teal-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Direktori & Agregator Independen Gerakan Zakat
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ensiklopedi & Radar Penyaluran Zakat Indonesia
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Memantau rilis aksi penyaluran 218 LAZ berizin resmi Kemenag RI, khazanah fiqh asnaf, dan akses langsung ke portal crowdfunding lembaga terpercaya anggota Forum Zakat (FOZ).
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP VIEW: 3-COLUMN MODERN DASHBOARD (>= md screens)        */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-start">
          
          {/* KOLOM KIRI (3 Cols): Ensiklopedi & Khazanah Knowledge */}
          <aside className="col-span-3 sticky top-24 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#5a4ea4]" /> Khazanah Zakat
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {SAMPLE_ENCYCLOPEDIA.length} Entri
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {SAMPLE_ENCYCLOPEDIA.map((item) => (
                  <div key={item.id} className="group p-2.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-[#433880]">
                        {item.term}
                      </span>
                      {item.arabic && (
                        <span className="text-xs font-arabic text-slate-400 font-serif">
                          {item.arabic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.definition}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#5a4ea4] font-medium">
                      <span>Lihat dalil & rujukan</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-400">
                  Data referensi: Fatwa MUI, BAZNAS & UU No. 23/2011
                </span>
              </div>
            </div>
          </aside>

          {/* KOLOM TENGAH (6 Cols): Kanal Eksposur (Radar Aksi OPZ) */}
          <section className="col-span-6 space-y-4">
            
            {/* Filter Kategori Asnaf & Isu */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 pl-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {['Semua', 'Ekonomi Mustahik', 'Pendidikan', 'Kebencanaan', 'Kesehatan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                    selectedCategory === cat 
                      ? 'bg-[#5a4ea4] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Feed Berita & Aksi */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Live Wire Rilis Aksi OPZ
                </span>
                <span>Menampilkan {filteredPosts.length} rilis</span>
              </div>

              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="p-4 sm:p-5">
                    
                    {/* Header Card: Nama OPZ & Asnaf */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#f2f0fa] flex items-center justify-center text-[#5a4ea4] font-bold text-xs">
                          {post.opz_name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{post.opz_name}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                              Legal
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location}</span>
                            <span>•</span>
                            <span>{post.published_at}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                        Asnaf: {post.asnaf}
                      </span>
                    </div>

                    {/* Judul & Ringkasan */}
                    <h2 className="text-base font-bold text-slate-900 hover:text-[#5a4ea4] transition leading-snug cursor-pointer">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Image Preview */}
                    <div className="mt-3 relative h-44 w-full rounded-lg overflow-hidden bg-slate-100">
                      <Image 
                        src={post.image_url} 
                        alt={post.title} 
                        fill 
                        className="object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    </div>

                    {/* Action Bar: Direct Donation & Source & Instagram */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <a 
                          href={post.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-[#5a4ea4] flex items-center gap-1"
                        >
                          Baca rilis asli <ExternalLink className="w-3 h-3" />
                        </a>
                        {post.instagram_url && (
                          <a
                            href={post.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md"
                          >
                            <InstagramIcon className="w-3.5 h-3.5" /> Instagram
                          </a>
                        )}
                      </div>

                      {/* TOMBOL DONASI KE LEMBAGA TERPERCAYA */}
                      <a
                        href={post.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#31c0c6] hover:bg-[#259fa4] text-white font-semibold text-xs shadow-sm hover:shadow transition transform active:scale-95"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        Donasi di Portal Resmi OPZ ↗
                      </a>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* KOLOM KANAN (3 Cols): Direktori 218 LAZ Kemenag */}
          <aside className="col-span-3 sticky top-24 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#5a4ea4]" /> Direktori LAZ Legal
                </h3>
                <span className="text-xs bg-[#f7f6fc] text-[#433880] font-bold px-2 py-0.5 rounded-full">
                  {lazList.length || '218'} LAZ
                </span>
              </div>

              {/* Filter Skala & Provinsi */}
              <div className="mt-3 space-y-2">
                <select
                  value={selectedSkala}
                  onChange={(e) => setSelectedSkala(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-[#5a4ea4]"
                >
                  <option value="Semua">Semua Skala</option>
                  <option value="Nasional">Skala Nasional (62)</option>
                  <option value="Provinsi">Skala Provinsi (49)</option>
                  <option value="Kabupaten/Kota">Skala Kab/Kota (107)</option>
                </select>

                <select
                  value={selectedProvinsi}
                  onChange={(e) => setSelectedProvinsi(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-[#5a4ea4]"
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* LAZ List Mini Scrollable */}
              <div className="mt-3 divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
                {loadingLaz ? (
                  <div className="py-6 text-center text-xs text-slate-400">Memuat 218 LAZ...</div>
                ) : filteredLaz.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Tidak ada LAZ yang cocok.</div>
                ) : (
                  filteredLaz.map((laz) => (
                    <div key={laz.no} className="py-2.5 first:pt-0 group">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 
                            onClick={() => setActiveLazDetail(laz)}
                            className="text-xs font-semibold text-slate-900 group-hover:text-[#5a4ea4] transition leading-snug cursor-pointer"
                          >
                            {laz.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-medium">
                              {laz.skala}
                            </span>
                            <span>{laz.provinsi}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi: Profile Detail, Instagram, Donasi */}
                      <div className="mt-2 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveLazDetail(laz)}
                            className="text-[11px] font-medium text-slate-600 hover:text-[#5a4ea4] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition flex items-center gap-1"
                          >
                            <Info className="w-3 h-3 text-[#5a4ea4]" /> Profil
                          </button>
                          
                          {laz.instagram_url && (
                            <a
                              href={laz.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1 rounded transition"
                              title="Instagram Resmi"
                            >
                              <InstagramIcon className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <a
                          href={laz.donation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-[#1d8286] hover:text-[#176a6e] bg-[#eaf9fa] hover:bg-[#d6f4f5] px-2.5 py-1 rounded-md transition flex items-center gap-1"
                        >
                          Donasi ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                Sumber resmi: SIMZAT Kemenag RI & FOZ
              </div>
            </div>
          </aside>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* MOBILE VIEW: APP-LIKE SINGLE FEED + BOTTOM NAVIGATION (< md)   */}
        {/* ------------------------------------------------------------- */}
        <div className="md:hidden pb-16">
          
          {/* TAB 1: RADAR AKSI OPZ */}
          {activeTab === 'radar' && (
            <div className="space-y-4">
              
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Semua', 'Ekonomi Mustahik', 'Pendidikan', 'Kebencanaan', 'Kesehatan'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition ${
                      selectedCategory === cat 
                        ? 'bg-[#5a4ea4] text-white shadow-sm' 
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cards Feed */}
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Image */}
                  <div className="relative h-48 w-full bg-slate-100">
                    <Image 
                      src={post.image_url} 
                      alt={post.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-900 shadow">
                      {post.opz_name}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#433880] text-white px-2 py-0.5 rounded-full text-[10px] font-medium shadow">
                      {post.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                      <span>{post.location}</span>
                      <span>•</span>
                      <span>{post.published_at}</span>
                      <span>•</span>
                      <span className="text-[#5a4ea4] font-medium">Asnaf: {post.asnaf}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Mobile Card Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      {post.instagram_url && (
                        <a
                          href={post.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-200"
                        >
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}
                      <a
                        href={post.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-[#31c0c6] active:bg-[#208b8f] text-white rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1.5"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        Salurkan Donasi ke Portal Resmi ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: DIREKTORI 218 LAZ RESMI */}
          {activeTab === 'laz' && (
            <div className="space-y-4">
              <div className="bg-[#f2f0fa] border border-[#d6d0ee] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#2a2354]">218 LAZ Berizin Kemenag RI</h3>
                  <p className="text-[11px] text-[#433880]">Lembaga resmi terdaftar & anggota FOZ</p>
                </div>
                <span className="text-xs bg-[#5a4ea4] text-white font-bold px-2 py-1 rounded-lg">
                  {filteredLaz.length}
                </span>
              </div>

              {/* Skala Selector */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedSkala}
                  onChange={(e) => setSelectedSkala(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium"
                >
                  <option value="Semua">Semua Skala</option>
                  <option value="Nasional">Nasional (62)</option>
                  <option value="Provinsi">Provinsi (49)</option>
                  <option value="Kabupaten/Kota">Kab/Kota (107)</option>
                </select>

                <select
                  value={selectedProvinsi}
                  onChange={(e) => setSelectedProvinsi(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium"
                >
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* LAZ List Cards */}
              <div className="space-y-2.5">
                {filteredLaz.map((laz) => (
                  <div key={laz.no} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-[#433880] bg-[#f7f6fc] px-2 py-0.5 rounded">
                          {laz.skala} • {laz.provinsi}
                        </span>
                        <h4 
                          onClick={() => setActiveLazDetail(laz)}
                          className="mt-1 text-xs font-bold text-slate-900 cursor-pointer hover:text-[#5a4ea4]"
                        >
                          {laz.name}
                        </h4>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveLazDetail(laz)}
                          className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 text-[#5a4ea4]" /> Profil
                        </button>
                        {laz.instagram_url && (
                          <a
                            href={laz.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100"
                          >
                            <InstagramIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <a
                        href={laz.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-[#31c0c6] active:bg-[#208b8f] text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1"
                      >
                        Donasi ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENSIKLOPEDIA & KHAZANAH */}
          {activeTab === 'ensiklopedia' && (
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-4 rounded-xl">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" /> Ensiklopedia Fiqh & Gerakan
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  Panduan komprehensif istilah nisab, 8 asnaf, fatwa kontemporer, dan sejarah gerakan zakat.
                </p>
              </div>

              {SAMPLE_ENCYCLOPEDIA.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#382f6e] bg-[#f7f6fc] px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.arabic && (
                      <span className="text-xs font-serif text-slate-500">
                        {item.arabic}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.term}</h4>
                  <p className="text-xs text-slate-600">{item.definition}</p>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {item.explanation}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Rujukan: {item.references.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* ============================================================== */}
      {/* 3. MODAL PROFILE LEMBAGA RESMI (INTERNAL DIALOG)               */}
      {/* ============================================================== */}
      {activeLazDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#433880] to-[#5a4ea4] text-white flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-teal-200 mb-1">
                  <ShieldCheck className="w-3 h-3" /> Lembaga Amil Zakat Berizin Kemenag RI
                </div>
                <h3 className="text-base sm:text-lg font-bold leading-snug">
                  {activeLazDetail.name}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  Tingkat: <span className="font-semibold text-white">{activeLazDetail.skala}</span> • Wilayah: <span className="font-semibold text-white">{activeLazDetail.provinsi}</span>
                </p>
              </div>
              <button 
                onClick={() => setActiveLazDetail(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content Modal */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              
              {/* Info Legalitas & SK */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Nomor Registrasi SIMZAT:</span>
                  <span className="font-mono font-bold text-slate-800">#{activeLazDetail.no}</span>
                </div>
                {activeLazDetail.sk_number && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Nomor SK Izin LAZ:</span>
                    <span className="font-bold text-purple-900">{activeLazDetail.sk_number}</span>
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
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terdaftar Aktif
                  </span>
                </div>
              </div>

              {/* Detail Kantor & Kontak */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#5a4ea4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Kantor Pusat:</span>
                    <span>{activeLazDetail.alamat || `${activeLazDetail.provinsi}, Indonesia`}</span>
                  </div>
                </div>

                {activeLazDetail.pimpinan && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <UserCheck className="w-4 h-4 text-[#5a4ea4] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 block">Pimpinan Lembaga:</span>
                      <span>{activeLazDetail.pimpinan}</span>
                    </div>
                  </div>
                )}

                {activeLazDetail.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-[#5a4ea4] shrink-0" />
                    <span className="font-semibold text-slate-900">Kontak:</span>
                    <span>{activeLazDetail.phone}</span>
                  </div>
                )}

                {activeLazDetail.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-[#5a4ea4] shrink-0" />
                    <span className="font-semibold text-slate-900">Email:</span>
                    <span>{activeLazDetail.email}</span>
                  </div>
                )}
              </div>

              {/* Tautan Resmi (Website & Instagram) */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {activeLazDetail.instagram_url ? (
                  <a
                    href={activeLazDetail.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition border border-rose-200"
                  >
                    <InstagramIcon className="w-4 h-4" /> Instagram Resmi
                  </a>
                ) : (
                  <div className="text-[11px] text-slate-400 italic py-1">Akun media sosial terdaftar di direktori FOZ</div>
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

            {/* Footer Modal CTA */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <a
                href={activeLazDetail.simzat_detail_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1 flex items-center gap-1"
              >
                Cek Dokumen SK SIMZAT <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={activeLazDetail.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#31c0c6] hover:bg-[#259fa4] text-white rounded-xl text-center text-xs font-bold shadow flex items-center justify-center gap-1.5 transition"
              >
                <HeartHandshake className="w-4 h-4" />
                Salurkan Donasi di Portal Resmi ↗
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (FIXED)                         */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'radar' ? 'text-[#5a4ea4] font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px]">Radar Aksi</span>
        </button>

        <button
          onClick={() => setActiveTab('laz')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'laz' ? 'text-[#5a4ea4] font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">218 LAZ</span>
        </button>

        <button
          onClick={() => setActiveTab('ensiklopedia')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'ensiklopedia' ? 'text-[#5a4ea4] font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Ensiklopedi</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* 5. FOOTER (DESKTOP)                                            */}
      {/* ============================================================== */}
      <footer className="hidden md:block bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-28">
              <Image 
                src="/digizakat_logo.png" 
                alt="Digizakat Logo" 
                fill 
                className="object-contain object-left"
              />
            </div>
            <span>• Neo Ensiklopedi & Kanal Eksposur Gerakan Zakat</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Data 218 LAZ bersumber dari SIMZAT Kementerian Agama RI & Forum Zakat (FOZ).</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
