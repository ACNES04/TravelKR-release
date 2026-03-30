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

export interface PlaceMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category: 'stay' | 'attraction' | 'food' | 'festival' | 'culture';
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
};

export const CATEGORY_LABELS: Record<PlaceMarker['category'], string> = {
  stay: '숙박시설',
  attraction: '관광지',
  food: '맛집',
  festival: '축제/행사',
  culture: '문화시설',
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
