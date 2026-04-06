'use client';

import { useState } from 'react';

interface RouteInfo {
  distance: number;
  duration: number;
  tollFare: number;
  taxiFare: number;
}

interface GuideStep {
  guidance: string;
  name: string;
  type: number;
  distance: number;
}

interface RouteSection {
  distance: number;
  duration: number;
  guides: GuideStep[];
}

interface RoutePolylineProps {
  routeInfo: RouteInfo | null;
  loading?: boolean;
  sections?: RouteSection[];
  stopNames?: string[];
}

function GuideIcon({ type }: { type: number }) {
  const base = 'w-4 h-4 flex-shrink-0';
  if (type === 1)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
  if (type === 2)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
  if (type === 3)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
  if (type === 8)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>;
  if (type === 9 || type === 12)
    return <svg className={base} fill="currentColor" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>;
  if (type === 10)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (type === 11)
    return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  return <svg className={base} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
}

function guideColor(type: number): string {
  if (type === 1) return 'text-blue-500';
  if (type === 2) return 'text-orange-500';
  if (type === 3) return 'text-purple-500';
  if (type === 8) return 'text-yellow-600';
  if (type === 9 || type === 12) return 'text-green-600';
  if (type === 10) return 'text-red-500';
  if (type === 11) return 'text-indigo-500';
  return 'text-gray-400';
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}
function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

export default function RoutePolyline({ routeInfo, loading, sections = [], stopNames = [] }: RoutePolylineProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur rounded-xl shadow border border-gray-200 animate-pulse">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">경로를 계산하고 있습니다...</span>
      </div>
    );
  }

  if (!routeInfo) return null;

  return (
    <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* 요약 바 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1.5 text-orange-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm font-bold">{fmtDist(routeInfo.distance)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold">{fmtTime(routeInfo.duration)}</span>
        </div>
        {routeInfo.tollFare > 0 && (
          <span className="text-xs bg-yellow-100 border border-yellow-200 rounded px-1.5 py-0.5 font-semibold text-yellow-700">
            통행료 {routeInfo.tollFare.toLocaleString()}원
          </span>
        )}
        <div className="ml-auto">
          {sections.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              {expanded ? '접기' : '상세 경로'}
              <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 상세 경로 펼침 */}
      {expanded && sections.length > 0 && (
        <div className="border-t border-gray-100 max-h-72 overflow-y-auto">
          {sections.map((sec, si) => (
            <div key={si} className="px-4 py-2.5 border-b border-gray-50 last:border-0">
              {/* 구간 헤더 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {si + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[80px]">
                    {stopNames[si] ?? '출발지'}
                  </span>
                  <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[80px]">
                    {stopNames[si + 1] ?? '도착지'}
                  </span>
                </div>
                <div className="flex gap-1.5 text-xs text-gray-400 flex-shrink-0 ml-2">
                  <span>{fmtDist(sec.distance)}</span>
                  <span>·</span>
                  <span>{fmtTime(sec.duration)}</span>
                </div>
              </div>
              {/* 턴-바이-턴 */}
              {sec.guides.length > 0 && (
                <ul className="space-y-1 pl-1">
                  {sec.guides.map((g, gi) => (
                    <li key={gi} className="flex items-center gap-2">
                      <span className={guideColor(g.type)}>
                        <GuideIcon type={g.type} />
                      </span>
                      <span className="text-xs text-gray-700 flex-1 min-w-0 truncate">
                        {g.guidance}{g.name ? ` — ${g.name}` : ''}
                      </span>
                      {g.distance > 0 && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {fmtDist(g.distance)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
    </div>
  );
}
