// 한국관광공사 TourAPI 클라이언트

import { getCached, setCache, createCacheKey } from '../cache';
import type { TourAPIResponse, StayItem, AttractionItem, DetailCommonItem, DetailImageItem, ContentTypeId } from '../../types/tourapi';

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

function getCommonParams(): URLSearchParams {
  const params = new URLSearchParams();
  params.set('serviceKey', process.env.TOUR_API_KEY || '');
  params.set('MobileOS', 'ETC');
  params.set('MobileApp', 'TravelPlanner');
  params.set('_type', 'json');
  return params;
}

async function fetchTourAPI<T>(endpoint: string, extraParams: Record<string, string>): Promise<T[]> {
  const cacheKey = createCacheKey('tour', endpoint, ...Object.values(extraParams));
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  const params = getCommonParams();
  Object.entries(extraParams).forEach(([k, v]) => params.set(k, v));

  const url = `${BASE_URL}${endpoint}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`TourAPI error: ${res.status} ${res.statusText}`);
  }

  const json: TourAPIResponse<T> = await res.json();

  if (json.response.header.resultCode !== '0000') {
    throw new Error(`TourAPI error: ${json.response.header.resultMsg}`);
  }

  const items = json.response.body?.items?.item || [];
  const result = Array.isArray(items) ? items : [items];

  setCache(cacheKey, result);
  return result;
}

/** 숙박시설 검색 */
export async function searchStay(areaCode: string, sigunguCode?: string, pageNo = 1, numOfRows = 10): Promise<StayItem[]> {
  const params: Record<string, string> = {
    areaCode,
    numOfRows: String(numOfRows),
    pageNo: String(pageNo),
  };
  if (sigunguCode) params.sigunguCode = sigunguCode;
  return fetchTourAPI<StayItem>('/searchStay2', params);
}

/** 지역 기반 관광지/맛집/축제 검색 */
export async function searchByArea(
  areaCode: string,
  contentTypeId: ContentTypeId,
  sigunguCode?: string,
  pageNo = 1,
  numOfRows = 20
): Promise<AttractionItem[]> {
  const params: Record<string, string> = {
    areaCode,
    contentTypeId,
    numOfRows: String(numOfRows),
    pageNo: String(pageNo),
  };
  if (sigunguCode) params.sigunguCode = sigunguCode;
  return fetchTourAPI<AttractionItem>('/areaBasedList2', params);
}

/** GPS 좌표 기반 주변 검색 */
export async function searchByLocation(
  mapX: number,
  mapY: number,
  contentTypeId?: ContentTypeId,
  radius = 5000,
  numOfRows = 20
): Promise<AttractionItem[]> {
  const params: Record<string, string> = {
    mapX: String(mapX),
    mapY: String(mapY),
    radius: String(radius),
    numOfRows: String(numOfRows),
    pageNo: '1',
  };
  if (contentTypeId) params.contentTypeId = contentTypeId;
  return fetchTourAPI<AttractionItem>('/locationBasedList2', params);
}

/** 장소 상세정보 */
export async function getDetailCommon(contentId: string): Promise<DetailCommonItem | null> {
  const items = await fetchTourAPI<DetailCommonItem>('/detailCommon2', {
    contentId,
    defaultYN: 'Y',
    overviewYN: 'Y',
    addrinfoYN: 'Y',
    mapinfoYN: 'Y',
  });
  return items[0] || null;
}

/** 장소 이미지 목록 */
export async function getDetailImages(contentId: string): Promise<DetailImageItem[]> {
  return fetchTourAPI<DetailImageItem>('/detailImage2', {
    contentId,
    imageYN: 'Y',
  });
}
