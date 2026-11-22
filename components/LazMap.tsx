'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLazItem {
  no: number;
  name: string;
  skala: string;
  provinsi: string;
  lokasi_singkat?: string;
  sk_number?: string;
  lat?: number;
  lng?: number;
  coord_exact?: boolean;
  jumlah_perwakilan?: number;
}

interface LazMapProps {
  items: MapLazItem[];
  onSelectLaz: (no: number) => void;
}

const SCALE_COLORS: Record<string, { fill: string; stroke: string }> = {
  Nasional: { fill: '#059669', stroke: '#065f46' }, // Hijau
  Provinsi: { fill: '#31c0c6', stroke: '#1d8286' }, // Tosca
  'Kabupaten/Kota': { fill: '#2563eb', stroke: '#1e40af' }, // Biru
};

export default function LazMap({ items, onSelectLaz }: LazMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectLaz);

  useEffect(() => {
    onSelectRef.current = onSelectLaz;
  }, [onSelectLaz]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update markers whenever filtered items change
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const validPoints: [number, number][] = [];

    items.forEach((laz) => {
      if (typeof laz.lat !== 'number' || typeof laz.lng !== 'number') return;

      const style = SCALE_COLORS[laz.skala] || { fill: '#5a4ea4', stroke: '#382f6e' };
      const radius = laz.skala === 'Nasional' ? 7 : laz.skala === 'Provinsi' ? 6 : 5.5;

      const marker = L.circleMarker([laz.lat, laz.lng], {
        radius,
        fillColor: style.fill,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      const branchNote =
        laz.jumlah_perwakilan && laz.jumlah_perwakilan > 0
          ? `<span style="display:inline-block;margin-left:4px;padding:1px 6px;border-radius:999px;background:#f2f0fa;color:#5a4ea4;font-size:10px;font-weight:600;">+${laz.jumlah_perwakilan} Cabang</span>`
          : '';

      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '210px';
      popupEl.style.fontFamily = 'inherit';
      popupEl.innerHTML = `
        <div style="margin-bottom:4px;">
          <span style="display:inline-block;padding:2px 7px;border-radius:999px;background:${style.fill}18;color:${style.stroke};font-size:10px;font-weight:700;text-transform:uppercase;">
            ${laz.skala}
          </span>
          ${branchNote}
        </div>
        <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.3;margin-bottom:4px;">
          ${laz.name}
        </div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;">
          ${laz.lokasi_singkat || laz.provinsi}
        </div>
        <button type="button" data-laz-open="${laz.no}" style="width:100%;padding:6px 10px;border-radius:8px;background:#5a4ea4;color:#ffffff;font-size:11px;font-weight:600;border:none;cursor:pointer;">
          Lihat Profil & SK
        </button>
      `;

      const btn = popupEl.querySelector('button[data-laz-open]');
      if (btn) {
        btn.addEventListener('click', () => {
          onSelectRef.current(laz.no);
          map.closePopup();
        });
      }

      marker.bindPopup(popupEl, { maxWidth: 260 });
      marker.addTo(group);
      validPoints.push([laz.lat, laz.lng]);
    });

    if (validPoints.length > 0 && validPoints.length < 180) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
    } else {
      map.setView([-2.5, 118.0], 5);
    }
  }, [items]);

  const handleResetView = () => {
    mapRef.current?.setView([-2.5, 118.0], 5);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Map Top Bar & Legend */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">Peta Sebaran Lokasi LAZ</span>
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Nasional
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#31c0c6] inline-block" />
              Provinsi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Kab/Kota
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">
            <strong className="text-slate-800">{items.length}</strong> titik lokasi
          </span>
          <button
            type="button"
            onClick={handleResetView}
            className="text-[#5a4ea4] hover:underline font-semibold cursor-pointer"
          >
            Reset Peta
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[300px] sm:h-[360px] z-10 relative"
      />
    </div>
  );
}
