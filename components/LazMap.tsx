'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';

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
  logo_url?: string;
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

const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.8, 94.2],   // Barat Laut (Aceh / Sabang)
  [-11.5, 141.5], // Tenggara (NTT / Papua)
];

const SCALE_COLORS: Record<string, { fill: string; stroke: string }> = {
  Nasional: { fill: '#059669', stroke: '#065f46' }, // Hijau
  Provinsi: { fill: '#31c0c6', stroke: '#1d8286' }, // Tosca
  'Kabupaten/Kota': { fill: '#2563eb', stroke: '#1e40af' }, // Biru
};

export default function LazMap({ items, selectedProvinsi, onSelectLaz }: LazMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const onSelectRef = useRef(onSelectLaz);

  useEffect(() => {
    onSelectRef.current = onSelectLaz;
  }, [onSelectLaz]);

  const isProvinceSelected = selectedProvinsi !== 'Semua';

  // Count HQ & branches in current view for top bar display
  let hqCount = 0;
  let branchCount = 0;
  items.forEach((laz) => {
    if (!isProvinceSelected || laz.provinsi === selectedProvinsi) {
      if (typeof laz.lat === 'number' && typeof laz.lng === 'number') hqCount++;
    }
    if (laz.perwakilan_daerah) {
      laz.perwakilan_daerah.forEach((c) => {
        const bp = c.wilayah.split(',')[0].trim();
        const matchProv = !isProvinceSelected || bp.toLowerCase() === selectedProvinsi.toLowerCase();
        if (matchProv && typeof c.lat === 'number' && typeof c.lng === 'number') {
          branchCount++;
        }
      });
    }
  });

  // Initialize Leaflet map + MarkerClusterGroup once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-2.4, 118.0],
      zoom: 4.5,
      minZoom: 3.5,
      maxZoom: 18,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    map.fitBounds(INDONESIA_BOUNDS, { padding: [16, 16] });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Reset View control tepat di bawah tombol Zoom In / Zoom Out
    const ResetControl = L.Control.extend({
      options: { position: 'topleft' as L.ControlPosition },
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const btn = L.DomUtil.create('a', '', container);
        btn.href = '#';
        btn.title = 'Reset ke tampilan peta Indonesia';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', 'Reset ke tampilan peta Indonesia');
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.backgroundColor = '#ffffff';
        btn.style.color = '#334155';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(btn, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          map.flyToBounds(INDONESIA_BOUNDS, { padding: [16, 16], duration: 0.6 });
        });
        return container;
      },
    });
    new ResetControl().addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: (zoom) => (zoom <= 5.5 ? 78 : zoom <= 7.5 ? 56 : 42),
      disableClusteringAtZoom: 13,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 34;
        let bg = '#9b91d4'; // Ungu muda (< 10)
        let ring = 'rgba(155, 145, 212, 0.30)';

        if (count >= 100) {
          size = 46;
          bg = '#382f6e'; // Ungu sangat pekat/kereng (>= 100)
          ring = 'rgba(56, 47, 110, 0.34)';
        } else if (count >= 30) {
          size = 42;
          bg = '#5a4ea4'; // Ungu pekat (30-99)
          ring = 'rgba(90, 78, 164, 0.30)';
        } else if (count >= 10) {
          size = 38;
          bg = '#7468be'; // Ungu sedang (10-29)
          ring = 'rgba(116, 104, 190, 0.28)';
        }

        return L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#ffffff;font-weight:700;font-size:${count >= 100 ? 11 : 12}px;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 0 0 4px ${ring}, 0 2px 6px rgba(15,23,42,0.22);">${count}</div>`,
          className: 'digizakat-cluster-icon',
          iconSize: L.point(size, size),
        });
      },
    });

    map.addLayer(clusterGroup);
    mapRef.current = map;
    clusterGroupRef.current = clusterGroup;

    const syncZoomClass = () => {
      if (!mapContainerRef.current) return;
      if (map.getZoom() <= 5.5) {
        mapContainerRef.current.classList.add('map-zoomed-out');
      } else {
        mapContainerRef.current.classList.remove('map-zoomed-out');
      }
    };
    syncZoomClass();
    map.on('zoomend', syncZoomClass);

    return () => {
      map.off('zoomend', syncZoomClass);
      map.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
    };
  }, []);

  // Update markers & auto-fly to selected province
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();

    const validPoints: [number, number][] = [];
    const markersToAdd: L.Layer[] = [];

    const createMarker = (
      lat: number,
      lng: number,
      laz: MapLazItem,
      isBranch: boolean,
      branchWilayah?: string,
      branchAlamat?: string
    ) => {
      const style = isBranch
        ? { fill: '#eab308', stroke: '#a16207' } // Kuning untuk Kantor Cabang
        : SCALE_COLORS[laz.skala] || { fill: '#5a4ea4', stroke: '#382f6e' };

      const dotSize = isBranch ? 12 : laz.skala === 'Nasional' ? 14 : 13;

      const dotIcon = L.divIcon({
        html: `<div class="pin-dot-inner" style="width:${dotSize}px;height:${dotSize}px;border-radius:9999px;background:${style.fill};border:2px solid #ffffff;box-shadow:0 1px 4px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center;"><span class="pin-single-count">1</span></div>`,
        className: 'digizakat-pin-dot',
        iconSize: L.point(dotSize, dotSize),
        iconAnchor: L.point(dotSize / 2, dotSize / 2),
      });

      const marker = L.marker([lat, lng], { icon: dotIcon });

      const typeBadge = isBranch
        ? `<span style="display:inline-block;padding:2px 7px;border-radius:999px;background:#fef9c3;color:#a16207;font-size:10px;font-weight:700;text-transform:uppercase;margin-right:4px;">Kantor Cabang</span>`
        : '';

      const branchNote =
        !isBranch && laz.jumlah_perwakilan && laz.jumlah_perwakilan > 0
          ? `<span style="display:inline-block;margin-left:4px;padding:1px 6px;border-radius:999px;background:#f2f0fa;color:#5a4ea4;font-size:10px;font-weight:600;">+${laz.jumlah_perwakilan} Cabang</span>`
          : '';

      const scaleStyle = SCALE_COLORS[laz.skala] || { fill: '#5a4ea4', stroke: '#382f6e' };

      const logoHtml = laz.logo_url
        ? `<div style="width:42px;height:42px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;padding:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">
            <img src="${laz.logo_url}" alt="${laz.name}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:contain;" />
          </div>`
        : '';

      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '230px';
      popupEl.style.fontFamily = 'inherit';
      popupEl.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
          ${logoHtml}
          <div style="min-width:0;flex:1;">
            <div style="margin-bottom:4px;">
              ${typeBadge}
              <span style="display:inline-block;padding:2px 7px;border-radius:999px;background:${scaleStyle.fill}18;color:${scaleStyle.stroke};font-size:10px;font-weight:700;text-transform:uppercase;">
                ${laz.skala}
              </span>
              ${branchNote}
            </div>
            <div style="font-weight:700;font-size:13px;color:#0f172a;line-height:1.3;margin-bottom:3px;">
              ${laz.name}
            </div>
            <div style="font-size:11px;color:#64748b;line-height:1.35;">
              ${isBranch ? `${branchWilayah || ''}${branchAlamat ? `<br/><span style="font-size:10px;color:#94a3b8;">${branchAlamat}</span>` : ''}` : laz.lokasi_singkat || laz.provinsi}
            </div>
          </div>
        </div>
        <button type="button" data-laz-open="${laz.no}" style="width:100%;padding:7px 10px;border-radius:8px;background:#5a4ea4;color:#ffffff;font-size:11px;font-weight:600;border:none;cursor:pointer;">
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

      marker.bindPopup(popupEl, { maxWidth: 265 });
      markersToAdd.push(marker);
      validPoints.push([lat, lng]);
    };

    items.forEach((laz) => {
      // Plot Kantor Pusat
      if (!isProvinceSelected || laz.provinsi === selectedProvinsi) {
        if (typeof laz.lat === 'number' && typeof laz.lng === 'number') {
          createMarker(laz.lat, laz.lng, laz, false);
        }
      }

      // Plot seluruh Kantor Cabang (baik di Semua Provinsi maupun provinsi terpilih)
      if (laz.perwakilan_daerah) {
        laz.perwakilan_daerah.forEach((c) => {
          const bp = c.wilayah.split(',')[0].trim();
          const matchProv = !isProvinceSelected || bp.toLowerCase() === selectedProvinsi.toLowerCase();
          if (matchProv && typeof c.lat === 'number' && typeof c.lng === 'number') {
            createMarker(c.lat, c.lng, laz, true, c.wilayah, c.alamat);
          }
        });
      }
    });

    clusterGroup.addLayers(markersToAdd);

    if (validPoints.length > 0 && (isProvinceSelected || items.length < 180)) {
      if (validPoints.length === 1) {
        map.flyTo(validPoints[0], 11, { duration: 0.7 });
      } else {
        const bounds = L.latLngBounds(validPoints);
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 11, duration: 0.7 });
      }
    } else {
      map.flyToBounds(INDONESIA_BOUNDS, { padding: [16, 16], duration: 0.7 });
    }
  }, [items, selectedProvinsi, isProvinceSelected]);

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
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
              Cabang
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-500">
            <strong className="text-slate-800">{hqCount}</strong> pusat
            {branchCount > 0 && (
              <>
                {' • '}
                <strong className="text-yellow-600">{branchCount}</strong> cabang
              </>
            )}
          </span>
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
