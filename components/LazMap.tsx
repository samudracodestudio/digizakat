'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface BranchItem {
  wilayah: string;
  alamat: string;
  lat?: number;
  lng?: number;
}

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
  perwakilan_daerah?: BranchItem[];
}

interface LazMapProps {
  items: MapLazItem[];
  selectedProvinsi: string;
  onSelectLaz: (no: number) => void;
}

const SCALE_COLORS: Record<string, { fill: string; stroke: string }> = {
  Nasional: { fill: '#059669', stroke: '#065f46' }, // Hijau
  Provinsi: { fill: '#31c0c6', stroke: '#1d8286' }, // Tosca
  'Kabupaten/Kota': { fill: '#2563eb', stroke: '#1e40af' }, // Biru
};

export default function LazMap({ items, selectedProvinsi, onSelectLaz }: LazMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectLaz);

  useEffect(() => {
    onSelectRef.current = onSelectLaz;
  }, [onSelectLaz]);

  // Compute points to plot based on selectedProvinsi
  const isProvinceSelected = selectedProvinsi !== 'Semua';

  // Count HQ & branches in current view for top bar display
  let hqCount = 0;
  let branchCount = 0;
  items.forEach((laz) => {
    if (!isProvinceSelected || laz.provinsi === selectedProvinsi) {
      if (typeof laz.lat === 'number' && typeof laz.lng === 'number') hqCount++;
    }
    if (isProvinceSelected && laz.perwakilan_daerah) {
      laz.perwakilan_daerah.forEach((c) => {
        const bp = c.wilayah.split(',')[0].trim();
        if (bp.toLowerCase() === selectedProvinsi.toLowerCase() && typeof c.lat === 'number' && typeof c.lng === 'number') {
          branchCount++;
        }
      });
    }
  });

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

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

  // Update markers & auto-fly to selected province
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const validPoints: [number, number][] = [];

    const addMarker = (
      lat: number,
      lng: number,
      laz: MapLazItem,
      isBranch: boolean,
      branchWilayah?: string,
      branchAlamat?: string
    ) => {
      const style = isBranch
        ? { fill: '#5a4ea4', stroke: '#382f6e' } // Ungu untuk Kantor Cabang
        : SCALE_COLORS[laz.skala] || { fill: '#5a4ea4', stroke: '#382f6e' };

      const radius = isBranch ? 6 : laz.skala === 'Nasional' ? 7 : laz.skala === 'Provinsi' ? 6 : 5.5;

      const marker = L.circleMarker([lat, lng], {
        radius,
        fillColor: style.fill,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.92,
      });

      const typeBadge = isBranch
        ? `<span style="display:inline-block;padding:2px 7px;border-radius:999px;background:#f2f0fa;color:#5a4ea4;font-size:10px;font-weight:700;text-transform:uppercase;margin-right:4px;">Kantor Cabang</span>`
        : '';

      const branchNote =
        !isBranch && laz.jumlah_perwakilan && laz.jumlah_perwakilan > 0
          ? `<span style="display:inline-block;margin-left:4px;padding:1px 6px;border-radius:999px;background:#f2f0fa;color:#5a4ea4;font-size:10px;font-weight:600;">+${laz.jumlah_perwakilan} Cabang</span>`
          : '';

      const scaleStyle = SCALE_COLORS[laz.skala] || { fill: '#5a4ea4', stroke: '#382f6e' };

      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '215px';
      popupEl.style.fontFamily = 'inherit';
      popupEl.innerHTML = `
        <div style="margin-bottom:4px;">
          ${typeBadge}
          <span style="display:inline-block;padding:2px 7px;border-radius:999px;background:${scaleStyle.fill}18;color:${scaleStyle.stroke};font-size:10px;font-weight:700;text-transform:uppercase;">
            ${laz.skala}
          </span>
          ${branchNote}
        </div>
        <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.3;margin-bottom:4px;">
          ${laz.name}
        </div>
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;line-height:1.35;">
          ${isBranch ? `${branchWilayah || ''}${branchAlamat ? `<br/><span style="font-size:10px;color:#94a3b8;">${branchAlamat}</span>` : ''}` : laz.lokasi_singkat || laz.provinsi}
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
      validPoints.push([lat, lng]);
    };

    items.forEach((laz) => {
      // Plot Kantor Pusat jika tidak sedang filter provinsi, ATAU kantor pusat memang di provinsi terpilih
      if (!isProvinceSelected || laz.provinsi === selectedProvinsi) {
        if (typeof laz.lat === 'number' && typeof laz.lng === 'number') {
          addMarker(laz.lat, laz.lng, laz, false);
        }
      }

      // Jika sedang memilih provinsi tertentu, plot juga seluruh Kantor Cabang di provinsi tersebut
      if (isProvinceSelected && laz.perwakilan_daerah) {
        laz.perwakilan_daerah.forEach((c) => {
          const bp = c.wilayah.split(',')[0].trim();
          if (
            bp.toLowerCase() === selectedProvinsi.toLowerCase() &&
            typeof c.lat === 'number' &&
            typeof c.lng === 'number'
          ) {
            addMarker(c.lat, c.lng, laz, true, c.wilayah, c.alamat);
          }
        });
      }
    });

    if (validPoints.length > 0 && (isProvinceSelected || validPoints.length < 180)) {
      if (validPoints.length === 1) {
        map.flyTo(validPoints[0], 11, { duration: 0.7 });
      } else {
        const bounds = L.latLngBounds(validPoints);
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 11, duration: 0.7 });
      }
    } else {
      map.flyTo([-2.5, 118.0], 5, { duration: 0.7 });
    }
  }, [items, selectedProvinsi, isProvinceSelected]);

  const handleResetView = () => {
    mapRef.current?.flyTo([-2.5, 118.0], 5, { duration: 0.6 });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Map Top Bar & Legend */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">
            {isProvinceSelected ? `Peta Sebaran — ${selectedProvinsi}` : 'Peta Sebaran Lokasi LAZ'}
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
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
            {isProvinceSelected && branchCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5a4ea4] inline-block" />
                Cabang
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">
            {isProvinceSelected ? (
              <>
                <strong className="text-slate-800">{hqCount}</strong> pusat
                {branchCount > 0 && (
                  <>
                    {' • '}
                    <strong className="text-[#5a4ea4]">{branchCount}</strong> cabang
                  </>
                )}
              </>
            ) : (
              <>
                <strong className="text-slate-800">{hqCount}</strong> titik lokasi
              </>
            )}
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
