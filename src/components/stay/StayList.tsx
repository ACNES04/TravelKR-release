'use client';

import { useEffect, useState } from 'react';
import type { StayItem } from '@/types/tourapi';
import StayCard from './StayCard';
import { SkeletonList } from '@/components/common/Skeleton';
import ErrorFallback from '@/components/common/ErrorFallback';
import { HotelIcon } from '@/components/icons/Icons';

interface StayListProps {
  areaCode: string;
  sigunguCode?: string;
  onStayClick?: (stay: StayItem) => void;
}

export default function StayList({ areaCode, sigunguCode, onStayClick }: StayListProps) {
  const [stays, setStays] = useState<StayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'default'>('default');

  async function fetchStays() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ areaCode, numOfRows: '12' });
      if (sigunguCode) params.set('sigunguCode', sigunguCode);
      const res = await fetch(`/api/stay?${params.toString()}`);
      if (!res.ok) throw new Error('숙박시설을 불러올 수 없습니다.');
      const data = await res.json();
      setStays(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '숙박시설 조회 실패');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (areaCode) fetchStays();
  }, [areaCode, sigunguCode]);

  const sorted = [...stays].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><HotelIcon className="w-4 h-4" /></div>
          숙박시설
          {!loading && <span className="text-sm font-normal text-gray-400">({stays.length})</span>}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setSortBy('default')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              sortBy === 'default' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            기본순
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              sortBy === 'name' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            이름순
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
            로딩중...
          </div>
          <SkeletonList count={3} />
        </div>
      )}
      {error && <ErrorFallback message={error} onRetry={fetchStays} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((stay) => (
            <StayCard key={stay.contentid} stay={stay} onClick={() => onStayClick?.(stay)} />
          ))}
          {sorted.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
              숙박시설 데이터가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
