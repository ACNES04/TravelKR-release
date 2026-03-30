'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import type { PlaceMarker } from '@/types';
import type { KakaoMapInstance, KakaoLatLng } from '@/types/kakao';

interface KakaoMapProps {
  center: { lat: number; lng: number };
  level?: number;
  markers?: PlaceMarker[];
  routePath?: { lat: number; lng: number }[];
  onMarkerClick?: (marker: PlaceMarker) => void;
  className?: string;
}

export default function KakaoMap({
  center,
  level = 8,
  markers = [],
  routePath = [],
  onMarkerClick,
  className = '',
}: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const polylineRef = useRef<unknown>(null);
  const infoWindowRef = useRef<unknown>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const MARKER_COLORS: Record<string, string> = {
    stay: '#EF4444',
    attraction: '#3B82F6',
    food: '#22C55E',
    festival: '#EAB308',
    culture: '#8B5CF6',
  };

  const MARKER_SVG: Record<string, string> = {
    stay: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v14"/><path d="M21 7v14"/><rect x="6" y="3" width="12" height="4" rx="1"/><rect x="6" y="10" width="4" height="4" rx="0.5"/><rect x="14" y="10" width="4" height="4" rx="0.5"/><rect x="10" y="17" width="4" height="4" rx="0.5"/></svg>',
    attraction: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
    food: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    festival: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3L2 22l10.7-3.79"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12L18.2 9a2.9 2.9 0 0 1-2.31 3.09l-3.15.53a2.9 2.9 0 0 0-2.31 3.09l.16 1.09"/><path d="M13 21l1.94-6.65a2.9 2.9 0 0 1 3.09-2.06l3.15.29"/></svg>',
    culture: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.2" fill="white"/><circle cx="16" cy="9" r="1.2" fill="white"/><path d="M16 15c-.5 1-2 2-4 2s-3.5-1-4-2"/></svg>',
  };

  const PIN_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const PHONE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  // SDK 로드 후 지도 초기화
  useEffect(() => {
    if (!sdkLoaded || !mapContainerRef.current) return;

    window.kakao.maps.load(() => {
      const map = new window.kakao.maps.Map(mapContainerRef.current!, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
      mapRef.current = map;
    });
  }, [sdkLoaded, center.lat, center.lng, level]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((m: unknown) => {
      (m as { setMap: (map: null) => void }).setMap(null);
    });
    markersRef.current = [];

    if (markers.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    markers.forEach((markerData) => {
      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
      bounds.extend(position);

      // 커스텀 마커 이미지 생성
      const color = MARKER_COLORS[markerData.category] || '#6B7280';
      const svg = MARKER_SVG[markerData.category] || PIN_SVG;

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          background: ${color};
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        ">
          ${svg} ${markerData.title.length > 8 ? markerData.title.slice(0, 8) + '...' : markerData.title}
        </div>
      `;

      // 기본 마커 사용 (커스텀 오버레이 대신)
      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current!,
        title: markerData.title,
      });

      // 인포윈도우 생성
      const infoContent = `
        <div style="padding: 12px; min-width: 200px; max-width: 280px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #1a1a1a;">
            ${svg} ${markerData.title}
          </div>
          ${markerData.image ? `<img src="${markerData.image}" alt="${markerData.title}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ''}
          ${markerData.address ? `<div style="font-size:12px;color:#666;margin-bottom:4px;display:flex;align-items:center;gap:4px;">${PIN_SVG} ${markerData.address}</div>` : ''}
          ${markerData.tel ? `<div style="font-size:12px;color:#666;display:flex;align-items:center;gap:4px;">${PHONE_SVG} ${markerData.tel}</div>` : ''}
        </div>
      `;

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: true,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 기존 인포윈도우 닫기
        if (infoWindowRef.current) {
          (infoWindowRef.current as { close: () => void }).close();
        }
        infoWindow.open(mapRef.current!, marker);
        infoWindowRef.current = infoWindow;

        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      markersRef.current.push(marker);
    });

    // 마커가 모두 보이도록 맵 범위 조정
    if (markers.length > 1) {
      mapRef.current.setBounds(bounds);
    }
  }, [markers, onMarkerClick]);

  // 경로 폴리라인 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    // 기존 폴리라인 제거
    if (polylineRef.current) {
      (polylineRef.current as { setMap: (map: null) => void }).setMap(null);
    }

    if (routePath.length < 2) return;

    const path = routePath.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng));

    const polyline = new window.kakao.maps.Polyline({
      path,
      strokeWeight: 4,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      map: mapRef.current,
    });

    polylineRef.current = polyline;
  }, [routePath]);

  // 센터 변경 시 이동
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.panTo(newCenter as KakaoLatLng);
  }, [center.lat, center.lng]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
      <div
        ref={mapContainerRef}
        className={`w-full h-full min-h-[300px] rounded-xl overflow-hidden ${className}`}
        role="application"
        aria-label="카카오맵 여행지 지도"
      />
    </>
  );
}
