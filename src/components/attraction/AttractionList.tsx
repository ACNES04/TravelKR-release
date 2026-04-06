'use client';

import { useEffect, useState } from 'react';
import type { AttractionItem, ContentTypeId } from '@/types/tourapi';
import CategoryTabs from './CategoryTabs';
import AttractionCard from './AttractionCard';
import { SkeletonList } from '@/components/common/Skeleton';
import ErrorFallback from '@/components/common/ErrorFallback';
import { LandmarkIcon } from '@/components/icons/Icons';

const ATTRACTION_PAGE_SIZE = 50;

interface AttractionListProps {
  areaCode: string;
  sigunguCode?: string;
  onItemClick?: (item: AttractionItem) => void;
  selectedIds?: string[];
  onToggleSelect?: (item: AttractionItem) => void;
  onClearSelected?: () => void;
}

export default function AttractionList({
  areaCode,
  sigunguCode,
  onItemClick,
  selectedIds = [],
  onToggleSelect,
  onClearSelected,
}: AttractionListProps) {
  const [contentTypeId, setContentTypeId] = useState<ContentTypeId>('12');
  const [items, setItems] = useState<AttractionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        areaCode,
        contentTypeId,
        numOfRows: String(ATTRACTION_PAGE_SIZE),
      });
      if (sigunguCode) params.set('sigunguCode', sigunguCode);

      const res = await fetch(`/api/attractions?${params.toString()}`);
      if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '조회 실패');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (areaCode) fetchItems();
  }, [areaCode, sigunguCode, contentTypeId]);

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><LandmarkIcon className="w-4 h-4" /></div>
        관광지 / 맛집 / 축제 / 문화시설
        {!loading && <span className="text-sm font-normal text-gray-400">({items.length})</span>}
        {selectedIds.length > 0 && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
            선택 {selectedIds.length}
          </span>
        )}
      </h3>

      <p className="text-xs text-gray-500 mb-3">카드를 클릭하면 선택/해제되며, 선택 목록 기준으로 경로와 AI 일정이 최적화됩니다.</p>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700">
            선택한 장소를 기준으로 경로 계산과 AI 일정 추천이 최적화됩니다.
          </p>
          <button
            onClick={onClearSelected}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            type="button"
          >
            전체 해제
          </button>
        </div>
      )}

      <CategoryTabs selected={contentTypeId} onChange={setContentTypeId} />

      <div className="mt-4">
        {loading && <SkeletonList count={4} />}
        {error && <ErrorFallback message={error} onRetry={fetchItems} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <AttractionCard
                key={item.contentid}
                item={item}
                selected={selectedIds.includes(item.contentid)}
                onClick={() => {
                  onToggleSelect?.(item);
                }}
              />
            ))}
            {items.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                데이터가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
