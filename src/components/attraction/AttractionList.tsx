'use client';

import { useEffect, useState, useMemo } from 'react';
import type { AttractionItem, ContentTypeId } from '@/types/tourapi';
import CategoryTabs from './CategoryTabs';
import AttractionCard from './AttractionCard';
import { SkeletonList } from '@/components/common/Skeleton';
import ErrorFallback from '@/components/common/ErrorFallback';
import { LandmarkIcon } from '@/components/icons/Icons';

const ATTRACTION_PAGE_SIZE = 1000;

// TourAPI cat3 코드 → 맛집 세부 분류
const FOOD_CAT3_LABELS: Record<string, string> = {
  A05020100: '한식',
  A05020200: '서양식',
  A05020300: '일식',
  A05020400: '중식',
  A05020700: '이색음식점',
  A05020900: '카페/찻집',
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [foodCat, setFoodCat] = useState<string | null>(null);

  // 탭 변경 시 음식 세부 필터 초기화
  function handleTabChange(tab: ContentTypeId) {
    setContentTypeId(tab);
    setFoodCat(null);
    setSearchQuery('');
  }

  const filteredItems = useMemo(() => {
    let result = items;
    // 맛집 세부 분류 필터
    if (contentTypeId === '39' && foodCat) {
      result = result.filter((item) => item.cat3 === foodCat);
    }
    // 텍스트 검색 필터
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.addr1 && item.addr1.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, searchQuery, foodCat, contentTypeId]);

  // 현재 아이템에 실제로 존재하는 맛집 세부 분류만 추출
  const availableFoodCats = useMemo(() => {
    if (contentTypeId !== '39') return [];
    const codes = Array.from(new Set(items.map((i) => i.cat3).filter(Boolean))) as string[];
    return codes
      .filter((c) => FOOD_CAT3_LABELS[c])
      .sort((a, b) => (FOOD_CAT3_LABELS[a] ?? '').localeCompare(FOOD_CAT3_LABELS[b] ?? ''));
  }, [items, contentTypeId]);

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
        {!loading && (
          <span className="text-sm font-normal text-gray-400">
            {searchQuery ? `${filteredItems.length} / ${items.length}` : items.length}
          </span>
        )}
        {selectedIds.length > 0 && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
            선택 {selectedIds.length}
          </span>
        )}
      </h3>

      {/* 검색 입력 */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="이름 또는 주소로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="검색어 지우기"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

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

      <CategoryTabs selected={contentTypeId} onChange={handleTabChange} />

      {/* 맛집 세부 분류 칩 */}
      {contentTypeId === '39' && !loading && availableFoodCats.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button
            type="button"
            onClick={() => setFoodCat(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              foodCat === null
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
            }`}
          >
            전체
          </button>
          {availableFoodCats.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setFoodCat(foodCat === code ? null : code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                foodCat === code
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
              }`}
            >
              {FOOD_CAT3_LABELS[code]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {loading && (
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
              로딩중...
            </div>
            <SkeletonList count={4} />
          </div>
        )}
        {error && <ErrorFallback message={error} onRetry={fetchItems} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <AttractionCard
                key={item.contentid}
                item={item}
                selected={selectedIds.includes(item.contentid)}
                onClick={() => {
                  onToggleSelect?.(item);
                }}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                {searchQuery ? `'${searchQuery}'에 해당하는 결과가 없습니다` : '데이터가 없습니다'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
