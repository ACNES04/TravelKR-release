'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlaceMarker } from '@/types';
import type { KakaoMapInstance, KakaoLatLng } from '@/types/kakao';

interface KakaoMapProps {
  center: { lat: number; lng: number };
  level?: number;
  markers?: PlaceMarker[];
  routePath?: { lat: number; lng: number }[];
  routeOrderMap?: Record<string, number>;
  onMarkerClick?: (marker: PlaceMarker) => void;
  className?: string;
}

export default function KakaoMap({
  center,
  level = 8,
  markers = [],
  routePath = [],
  routeOrderMap = {},
  onMarkerClick,
  className = '',
}: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const polylineRef = useRef<unknown>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // 이미 SDK가 로드된 경우(페이지 이동/재마운트) 즉시 반영, 아니면 polling으로 대기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.kakao?.maps) {
      setSdkLoaded(true);
      return;
    }
    const timer = setInterval(() => {
      if (window.kakao?.maps) {
        setSdkLoaded(true);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

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

  // SDK 로드 후 지도 초기화 (한 번만 실행)
  useEffect(() => {
    if (!sdkLoaded || !mapContainerRef.current) return;

    window.kakao.maps.load(() => {
      if (mapRef.current) return; // 이미 초기화됨
      const map = new window.kakao.maps.Map(mapContainerRef.current!, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
      mapRef.current = map;
      setMapReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkLoaded]);

  // 마커 업데이트 (CustomOverlay 사용 — 색상 라벨 + 경로 번호 뱃지)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // 기존 오버레이 제거
    markersRef.current.forEach((m: unknown) => {
      (m as { setMap: (map: null) => void }).setMap(null);
    });
    markersRef.current = [];

    if (markers.length === 0) return;

    // CustomOverlay는 타입 정의에 없으므로 캐스팅
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomOverlayClass = (window.kakao.maps as any).CustomOverlay as new (opts: {
      position: unknown; content: HTMLElement; map: unknown; yAnchor: number; zIndex: number;
    }) => { setMap: (m: unknown) => void };

    const bounds = new window.kakao.maps.LatLngBounds();

    markers.forEach((markerData) => {
      if (!markerData.lat || !markerData.lng) return;
      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
      bounds.extend(position);

      const color = MARKER_COLORS[markerData.category] || '#6B7280';
      const title = markerData.title.length > 9 ? markerData.title.slice(0, 9) + '…' : markerData.title;
      const order = routeOrderMap[markerData.id];
      const hasOrder = order !== undefined;
      const bgColor = hasOrder ? '#F97316' : color;

      const el = document.createElement('div');
      el.style.cssText = 'cursor:pointer;text-align:center;';

      const bubble = document.createElement('div');
      bubble.style.cssText = `display:inline-flex;align-items:center;gap:4px;background:${bgColor};color:white;padding:3px 8px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid rgba(255,255,255,0.8);user-select:none;`;

      if (hasOrder) {
        const numBadge = document.createElement('span');
        numBadge.style.cssText = 'background:white;color:#F97316;border-radius:50%;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;';
        numBadge.textContent = String(order + 1);
        bubble.appendChild(numBadge);
      }

      const textSpan = document.createElement('span');
      textSpan.textContent = title;
      bubble.appendChild(textSpan);

      const arrow = document.createElement('div');
      arrow.style.cssText = `width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${bgColor};margin:0 auto;`;

      el.appendChild(bubble);
      el.appendChild(arrow);
      el.addEventListener('click', () => onMarkerClick?.(markerData));

      const overlay = new CustomOverlayClass({
        position,
        content: el,
        map: mapRef.current!,
        yAnchor: 1,
        zIndex: hasOrder ? 5 : 3,
      });

      markersRef.current.push(overlay);
    });

    if (markers.length > 1) {
      mapRef.current.setBounds(bounds);
    }
  }, [mapReady, markers, onMarkerClick, routeOrderMap]);

  // 경로 폴리라인 업데이트
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (polylineRef.current) {
      (polylineRef.current as { setMap: (map: null) => void }).setMap(null);
    }

    if (routePath.length < 2) return;

    const path = routePath.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng));

    const polyline = new window.kakao.maps.Polyline({
      path,
      strokeWeight: 6,
      strokeColor: '#F97316',
      strokeOpacity: 0.9,
      strokeStyle: 'solid',
      map: mapRef.current,
    });

    polylineRef.current = polyline;
  }, [mapReady, routePath]);

  // 센터 변경 시 이동
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    mapRef.current.panTo(newCenter as KakaoLatLng);
  }, [mapReady, center.lat, center.lng]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full min-h-[300px] rounded-xl overflow-hidden ${className}`}
      role="application"
      aria-label="카카오맵 여행지 지도"
    />
  );
}
