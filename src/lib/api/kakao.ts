// Kakao Maps / Local / Mobility API 클라이언트

import { getCached, setCache, createCacheKey } from '../cache';
import type { KakaoSearchResponse, KakaoPlace, KakaoDirectionsResponse } from '../../types/kakao';

const KAKAO_LOCAL_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const KAKAO_DIRECTIONS_URL = 'https://apis-navi.kakaomobility.com/v1/directions';

function getKakaoHeaders(): HeadersInit {
  return {
    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
  };
}

/** 키워드 장소 검색 */
export async function searchPlaces(
  query: string,
  x?: number,
  y?: number,
  radius?: number,
  page = 1
): Promise<KakaoSearchResponse> {
  const cacheKey = createCacheKey('kakao-search', query, x?.toFixed(4), y?.toFixed(4), String(page));
  const cached = getCached<KakaoSearchResponse>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ query, page: String(page), size: '15' });
  if (x !== undefined) params.set('x', String(x));
  if (y !== undefined) params.set('y', String(y));
  if (radius !== undefined) params.set('radius', String(radius));

  const res = await fetch(`${KAKAO_LOCAL_URL}?${params.toString()}`, {
    headers: getKakaoHeaders(),
  });

  if (!res.ok) throw new Error(`Kakao Local API error: ${res.status}`);

  const data: KakaoSearchResponse = await res.json();
  setCache(cacheKey, data, 30 * 60 * 1000); // 30분 캐시
  return data;
}

/** 자동차 경로 탐색 */
export async function getDirections(
  origin: { x: number; y: number },
  destination: { x: number; y: number },
  waypoints?: { x: number; y: number }[]
): Promise<KakaoDirectionsResponse> {
  const cacheKey = createCacheKey(
    'kakao-dir',
    `${origin.x},${origin.y}`,
    `${destination.x},${destination.y}`,
    waypoints?.map((w) => `${w.x},${w.y}`).join('|')
  );
  const cached = getCached<KakaoDirectionsResponse>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    origin: `${origin.x},${origin.y}`,
    destination: `${destination.x},${destination.y}`,
  });

  if (waypoints && waypoints.length > 0) {
    params.set('waypoints', waypoints.map((w) => `${w.x},${w.y}`).join('|'));
  }

  const res = await fetch(`${KAKAO_DIRECTIONS_URL}?${params.toString()}`, {
    headers: getKakaoHeaders(),
  });

  if (!res.ok) throw new Error(`Kakao Mobility API error: ${res.status}`);

  const data: KakaoDirectionsResponse = await res.json();
  setCache(cacheKey, data);
  return data;
}

/** Kakao 검색 결과를 PlaceMarker 호환 형식으로 변환 */
export function kakaoPlaceToMarker(place: KakaoPlace) {
  return {
    id: place.id,
    title: place.place_name,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
    address: place.road_address_name || place.address_name,
    tel: place.phone,
    category: categorizeKakaoPlace(place.category_group_code),
  };
}

function categorizeKakaoPlace(categoryCode: string): string {
  switch (categoryCode) {
    case 'AD5': return 'stay'; // 숙박
    case 'FD6': return 'food'; // 음식점
    case 'CE7': return 'food'; // 카페
    case 'AT4': return 'attraction'; // 관광명소
    case 'CT1': return 'culture'; // 문화시설
    default: return 'attraction';
  }
}
