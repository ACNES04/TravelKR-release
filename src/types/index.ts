// 공통 타입 정의

export interface TravelPlan {
  id: string;
  destination: string;
  areaCode: string;
  sigunguCode?: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  styles: TravelStyle[];
  centerLat: number;
  centerLng: number;
  createdAt: string;
  updatedAt: string;
}

export type TravelStyle =
  | '자연'
  | '역사'
  | '맛집'
  | '액티비티'
  | '힐링'
  | '문화'
  | '쇼핑'
  | '축제';

export const TRAVEL_STYLES: TravelStyle[] = [
  '자연',
  '역사',
  '맛집',
  '액티비티',
  '힐링',
  '문화',
  '쇼핑',
  '축제',
];

export type PlanningStage =
  | 'explore'    // 탐색 단계
  | 'place'      // 장소 확정
  | 'itinerary'  // 일정 수립
  | 'booking'    // 예약 완료
  | 'final';     // 마무리 점검

export const PLANNING_STAGES: { id: PlanningStage; label: string; description: string }[] = [
  { id: 'explore',   label: '아직 탐색 중',        description: '여행지와 날짜가 아직 미정이에요' },
  { id: 'place',     label: '장소만 정했어요',      description: '일정과 세부 계획을 세워볼까요?' },
  { id: 'itinerary', label: '일정 짜는 중',         description: '동선과 장소를 최적화해 볼게요' },
  { id: 'booking',   label: '예약까지 했어요',      description: '현지 액티비티를 추천해 드릴게요' },
  { id: 'final',     label: '출발 전 마무리',       description: '최종 체크리스트를 확인해 보세요' },
];

export interface PlaceMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category: 'stay' | 'attraction' | 'food' | 'festival' | 'culture' | 'departure';
  image?: string;
  address?: string;
  tel?: string;
  overview?: string;
}

export const MARKER_COLORS: Record<PlaceMarker['category'], string> = {
  stay: '#EF4444',       // 빨강
  attraction: '#3B82F6', // 파랑
  food: '#22C55E',       // 초록
  festival: '#EAB308',   // 노랑
  culture: '#8B5CF6',    // 보라
  departure: '#111827',  // 검정
};

export const CATEGORY_LABELS: Record<PlaceMarker['category'], string> = {
  stay: '숙박시설',
  attraction: '관광지',
  food: '맛집',
  festival: '축제/행사',
  culture: '문화시설',
  departure: '출발지',
};

export interface SearchParams {
  destination: string;
  areaCode: string;
  sigunguCode?: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  styles: TravelStyle[];
  lat: number;
  lng: number;
}

export interface AIRecommendationRequest {
  planId: string;
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  styles: TravelStyle[];
  stays: PlaceMarker[];
  attractions: PlaceMarker[];
  foods: PlaceMarker[];
  festivals: PlaceMarker[];
  weather: import('./weather').DailyWeather[];
}
