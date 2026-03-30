'use client';

import type { StayItem } from '@/types/tourapi';
import { PinIcon, PhoneIcon } from '@/components/icons/Icons';

interface StayCardProps {
  stay: StayItem;
  onClick?: (stay: StayItem) => void;
}

export default function StayCard({ stay, onClick }: StayCardProps) {
  const badges: string[] = [];
  if (stay.goodstay === '1') badges.push('굿스테이');
  if (stay.hanok === '1') badges.push('한옥');
  if (stay.benikia === '1') badges.push('베니키아');

  return (
    <button
      onClick={() => onClick?.(stay)}
      className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 text-left group"
    >
      {/* 이미지 */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {stay.firstimage ? (
          <img
            src={stay.firstimage}
            alt={stay.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex gap-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3.5">
        <h4 className="font-bold text-gray-900 text-sm truncate">{stay.title}</h4>
        <p className="text-xs text-gray-500 mt-1.5 truncate flex items-center gap-1">
          <PinIcon className="w-3 h-3 flex-shrink-0 text-gray-400" /> {stay.addr1}
        </p>
        {stay.tel && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><PhoneIcon className="w-3 h-3 flex-shrink-0" /> {stay.tel}</p>
        )}

        {/* 외부 링크 */}
        <div className="flex gap-2 mt-3">
          <a
            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(stay.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 text-center text-[11px] font-semibold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            네이버 검색
          </a>
          <a
            href={`https://map.kakao.com/link/search/${encodeURIComponent(stay.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 text-center text-[11px] font-semibold bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            카카오맵
          </a>
        </div>
      </div>
    </button>
  );
}
