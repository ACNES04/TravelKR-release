'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import WeatherPanel from '@/components/weather/WeatherPanel';
import StayList from '@/components/stay/StayList';
import AttractionList from '@/components/attraction/AttractionList';
import AIRecommendation from '@/components/ai/AIRecommendation';
import RoutePolyline from '@/components/map/RoutePolyline';
import InfoWindowModal from '@/components/map/InfoWindow';
import { SuitcaseIcon, MapIcon, ClipboardIcon, WeatherIcon, HotelIcon, LandmarkIcon, RobotIcon } from '@/components/icons/Icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { getFeedback, toggleLike, addComment, getTopLikedAttractions } from '@/lib/feedbackStorage';
import { savePlan, isPlanSaved } from '@/lib/planStorage';
import type { PlaceMarker, SavedPlan } from '@/types';
import type { StayItem, AttractionItem } from '@/types/tourapi';
import { formatDateKoreanISO, getDaysBetween } from '@/lib/utils/dateFormat';
import { CONTENT_TYPE_LABELS } from '@/types/tourapi';

// KakaoMap을 dynamic import (SSR 비활성화)
const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-gray-400">지도 로딩 중...</span>
    </div>
  ),
});

type PanelTab = 'weather' | 'stay' | 'attraction' | 'ai';

type SelectableCategory = Extract<PlaceMarker['category'], 'attraction' | 'food' | 'festival' | 'culture'>;

function toSelectableMarker(item: AttractionItem): PlaceMarker {
  const ctId = item.contenttypeid;
  let category: SelectableCategory = 'attraction';
  if (ctId === '39') category = 'food';
  else if (ctId === '15') category = 'festival';
  else if (ctId === '14') category = 'culture';

  return {
    id: item.contentid,
    title: item.title,
    lat: parseFloat(item.mapy),
    lng: parseFloat(item.mapx),
    category,
    image: item.firstimage,
    address: item.addr1,
    tel: item.tel,
  };
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.asin(Math.sqrt(h));
}

function optimizeMarkerOrderByDistance(markers: PlaceMarker[], start: { lat: number; lng: number }) {
  if (markers.length <= 2) return markers;

  const remaining = [...markers];
  const ordered: PlaceMarker[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const dist = distanceMeters(current, remaining[i]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = { lat: next.lat, lng: next.lng };
  }

  return ordered;
}

export default function PlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const planId = params.id as string;
  const destination = searchParams.get('destination') || '';
  const areaCode = searchParams.get('areaCode') || '';
  const lat = parseFloat(searchParams.get('lat') || '37.5665');
  const lng = parseFloat(searchParams.get('lng') || '126.978');
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const styles = (searchParams.get('styles') || '').split(',').filter(Boolean);

  const [markers, setMarkers] = useState<PlaceMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<PlaceMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat, lng });
  const [departure, setDeparture] = useState<PlaceMarker | null>(null);
  const [departureQuery, setDepartureQuery] = useState('');
  const [departureSearching, setDepartureSearching] = useState(false);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    tollFare: number;
    taxiFare: number;
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeOrderMap, setRouteOrderMap] = useState<Record<string, number>>({});
  const [routeSections, setRouteSections] = useState<{
    distance: number;
    duration: number;
    guides: { guidance: string; name: string; type: number; distance: number }[];
  }[]>([]);
  const [routeStopNames, setRouteStopNames] = useState<string[]>([]);
  const [routeExpanded, setRouteExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelTab>('weather');

  // 수집된 데이터 (AI 추천용)
  const [collectedStays, setCollectedStays] = useState<{ title: string; address: string }[]>([]);
  const [collectedAttractions, setCollectedAttractions] = useState<{ title: string; address: string; category: string }[]>([]);
  const [collectedFoods, setCollectedFoods] = useState<{ title: string; address: string }[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceMarker[]>([]);
  const [collectedWeather, setCollectedWeather] = useState<{ date: string; skyLabel: string; tempMin: number | null; tempMax: number | null; pop: number }[]>([]);

  const dayCount = startDate && endDate ? getDaysBetween(startDate, endDate) : 0;
  const router = useRouter();
  const { user } = useAuth();
  const [planSaved, setPlanSaved] = useState(false);
  const [feedbackVersion, setFeedbackVersion] = useState(0);

  const currentMarkerFeedback = selectedMarker ? getFeedback(selectedMarker.id, selectedMarker.title) : { likes: 0, likedBy: [], comments: [] };
  const topLikedAttractions = getTopLikedAttractions(5);

  // 숙박시설 클릭 핸들러
  const handleStayClick = useCallback((stay: StayItem) => {
    const marker: PlaceMarker = {
      id: stay.contentid,
      title: stay.title,
      lat: parseFloat(stay.mapy),
      lng: parseFloat(stay.mapx),
      category: 'stay',
      image: stay.firstimage,
      address: stay.addr1,
      tel: stay.tel,
    };
    setSelectedMarker(marker);
    setMapCenter({ lat: marker.lat, lng: marker.lng });
  }, []);

  // 관광지/맛집 클릭 핸들러
  const handleAttractionClick = useCallback((item: AttractionItem) => {
    const marker = toSelectableMarker(item);
    setSelectedMarker(marker);
    setMapCenter({ lat: marker.lat, lng: marker.lng });
  }, []);

  const toggleSelectedPlace = useCallback((item: AttractionItem) => {
    const marker = toSelectableMarker(item);
    setSelectedPlaces((prev) => {
      const exists = prev.some((p) => p.id === marker.id);
      if (exists) {
        return prev.filter((p) => p.id !== marker.id);
      }
      return [...prev, marker];
    });
  }, []);

  const clearSelectedPlaces = useCallback(() => {
    setSelectedPlaces([]);
  }, []);

  // 지도 마커 클릭
  const handleMarkerClick = useCallback((marker: PlaceMarker) => {
    setSelectedMarker(marker);
  }, []);

  // 출발지 검색 (카카오맵 SDK Places 키워드 검색)
  async function searchDeparture() {
    if (!departureQuery.trim()) return;
    if (!window.kakao?.maps?.services) {
      alert('지도 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    setDepartureSearching(true);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(departureQuery.trim(), (data: { place_name: string; y: string; x: string; address_name: string }[], status: string) => {
      setDepartureSearching(false);
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0];
        const dep: PlaceMarker = {
          id: 'departure',
          title: place.place_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
          category: 'departure',
          address: place.address_name,
        };
        setDeparture(dep);
        setMapCenter({ lat: dep.lat, lng: dep.lng });
      } else {
        alert('검색 결과가 없습니다. 더 구체적인 주소를 입력해 주세요.');
      }
    });
  }

  function clearDeparture() {
    setDeparture(null);
    setDepartureQuery('');
  }

  // 데이터 수집 (마커 + AI용)
  useEffect(() => {
    if (!areaCode) return;

    async function collectData() {
      try {
        // 숙박시설
        const stayRes = await fetch(`/api/stay?areaCode=${areaCode}&numOfRows=10`);
        if (stayRes.ok) {
          const stayData = await stayRes.json();
          const stays = stayData.items || [];
          setCollectedStays(stays.map((s: StayItem) => ({ title: s.title, address: s.addr1 })));

          const stayMarkers: PlaceMarker[] = stays
            .filter((s: StayItem) => s.mapx && s.mapy)
            .map((s: StayItem) => ({
              id: s.contentid,
              title: s.title,
              lat: parseFloat(s.mapy),
              lng: parseFloat(s.mapx),
              category: 'stay' as const,
              image: s.firstimage2,
              address: s.addr1,
              tel: s.tel,
            }));
          setMarkers((prev) => [...prev.filter((m) => m.category !== 'stay'), ...stayMarkers]);
        }

        const [attrRes, cultureRes, festivalRes, foodRes] = await Promise.all([
          fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=12&numOfRows=1000`),
          fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=14&numOfRows=1000`),
          fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=15&numOfRows=1000`),
          fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=39&numOfRows=1000`),
        ]);

        const attrItems: AttractionItem[] = attrRes.ok ? (await attrRes.json()).items || [] : [];
        const cultureItems: AttractionItem[] = cultureRes.ok ? (await cultureRes.json()).items || [] : [];
        const festivalItems: AttractionItem[] = festivalRes.ok ? (await festivalRes.json()).items || [] : [];
        const foodItems: AttractionItem[] = foodRes.ok ? (await foodRes.json()).items || [] : [];

        const allScheduleTargets = [...attrItems, ...cultureItems, ...festivalItems];

        setCollectedAttractions(
          allScheduleTargets.map((a: AttractionItem) => ({
            title: a.title,
            address: a.addr1,
            category: CONTENT_TYPE_LABELS[a.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] || '관광지',
          }))
        );

        setCollectedFoods(foodItems.map((f: AttractionItem) => ({ title: f.title, address: f.addr1 })));

        const selectableMarkers: PlaceMarker[] = [...allScheduleTargets, ...foodItems]
          .filter((a: AttractionItem) => a.mapx && a.mapy)
          .map((a: AttractionItem) => ({
            ...toSelectableMarker(a),
            image: a.firstimage2,
          }));

        setMarkers((prev) => [
          ...prev.filter((m) => !['attraction', 'food', 'festival', 'culture'].includes(m.category)),
          ...selectableMarkers,
        ]);

        // 날씨
        if (startDate && endDate) {
          const weatherRes = await fetch(
            `/api/weather?lat=${lat}&lng=${lng}&areaCode=${areaCode}&startDate=${startDate}&endDate=${endDate}`
          );
          if (weatherRes.ok) {
            const weatherData = await weatherRes.json();
            setCollectedWeather(
              (weatherData.weather || []).map((w: { date: string; skyLabel: string; tempMin: number | null; tempMax: number | null; pop: number }) => ({
                date: w.date,
                skyLabel: w.skyLabel,
                tempMin: w.tempMin,
                tempMax: w.tempMax,
                pop: w.pop,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Data collection error:', err);
      }
    }

    collectData();
  }, [areaCode, lat, lng, startDate, endDate]);

  useEffect(() => {
    if (!user) {
      setPlanSaved(false);
      return;
    }
    setPlanSaved(isPlanSaved(user.email, planId));
  }, [user, planId]);

  // 최적 루트 계산
  async function calculateRoute() {
    const routeSource = selectedPlaces.length > 0
      ? selectedPlaces
      : markers.filter((m) => ['attraction', 'food', 'festival', 'culture'].includes(m.category)).slice(0, 8);

    const originPt = departure ? { lat: departure.lat, lng: departure.lng } : { lat, lng };
    const optimized = optimizeMarkerOrderByDistance(routeSource, originPt);

    // 출발지가 있으면 맨 앞에 추가
    let routeMarkers: PlaceMarker[];
    if (departure) {
      routeMarkers = [departure, ...optimized].slice(0, 7);
    } else {
      routeMarkers = optimized.slice(0, 7);
    }
    if (routeMarkers.length < 2) return;

    setRouteLoading(true);
    setRouteError(null);

    // 경로 순서맵 설정 (지도 번호 표시용)
    const orderMap: Record<string, number> = {};
    routeMarkers.forEach((m, i) => { orderMap[m.id] = i; });
    setRouteOrderMap(orderMap);

    try {
      const origin = routeMarkers[0];
      const dest = routeMarkers[routeMarkers.length - 1];
      const waypoints = routeMarkers.slice(1, -1);

      const params = new URLSearchParams({
        originX: String(origin.lng),
        originY: String(origin.lat),
        destX: String(dest.lng),
        destY: String(dest.lat),
      });

      if (waypoints.length > 0) {
        params.set('waypoints', waypoints.map((w) => `${w.lng},${w.lat}`).join('|'));
      }

      const res = await fetch(`/api/directions?${params.toString()}`);
      if (!res.ok) {
        setRouteError('경로 계산에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setRouteOrderMap({});
        return;
      }
      const data = await res.json();
      const route = data.routes?.[0];
      if (route && route.result_code === 0) {
        // 경로 좌표 추출
        const path: { lat: number; lng: number }[] = [];
        route.sections?.forEach((section: { roads: { vertexes: number[] }[] }) => {
          section.roads?.forEach((road: { vertexes: number[] }) => {
            for (let i = 0; i < road.vertexes.length; i += 2) {
              path.push({ lat: road.vertexes[i + 1], lng: road.vertexes[i] });
            }
          });
        });
        setRoutePath(path);
        setRouteInfo({
          distance: route.summary.distance,
          duration: route.summary.duration,
          tollFare: route.summary.fare?.toll || 0,
          taxiFare: route.summary.fare?.taxi || 0,
        });
        // 구간별 상세 안내 저장
        const sections = (route.sections ?? []).map((sec: {
          distance: number; duration: number;
          guides: { guidance: string; name: string; type: number; distance: number }[];
        }) => ({
          distance: sec.distance,
          duration: sec.duration,
          guides: (sec.guides ?? []).filter((g: { type: number }) => g.type !== 0), // 직진 제외
        }));
        setRouteSections(sections);
        setRouteStopNames(routeMarkers.map((m) => m.title));
      } else {
        setRouteError('선택한 장소 간 경로를 찾을 수 없습니다.');
        setRouteOrderMap({});
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setRouteError('경로 계산 중 오류가 발생했습니다.');
      setRouteOrderMap({});
    } finally {
      setRouteLoading(false);
    }
  }

  // 경로 초기화
  function resetRoute() {
    setRoutePath([]);
    setRouteInfo(null);
    setRouteSections([]);
    setRouteStopNames([]);
    setRouteExpanded(false);
    setRouteError(null);
    setRouteOrderMap({});
  }

  // 여행 계획 저장
  function handleSavePlan() {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const planData: SavedPlan = {
      id: planId,
      destination,
      areaCode,
      lat,
      lng,
      startDate,
      endDate,
      adults,
      children,
      styles,
      planningStage: null,
      savedAt: new Date().toISOString(),
    };

    savePlan(user.email, planData);
    setPlanSaved(true);
    alert('여행 계획이 저장되었습니다.');
  }

  function handleToggleLike() {
    if (!user || !selectedMarker) {
      router.push('/auth/login');
      return;
    }
    toggleLike(selectedMarker.id, user.email, selectedMarker.title);
    setFeedbackVersion((prev) => prev + 1);
  }

  function handleAddComment(message: string) {
    if (!user || !selectedMarker) {
      router.push('/auth/login');
      return;
    }
    if (!message.trim()) return;
    addComment(selectedMarker.id, user.name, user.email, message, selectedMarker.title);
    setFeedbackVersion((prev) => prev + 1);
  }

  // 공유 링크 복사
  function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('공유 링크가 클립보드에 복사되었습니다!');
  }

  const PANEL_TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'weather', label: '날씨', icon: <WeatherIcon className="w-4 h-4" /> },
    { id: 'stay', label: '숙박', icon: <HotelIcon className="w-4 h-4" /> },
    { id: 'attraction', label: '관광지', icon: <LandmarkIcon className="w-4 h-4" /> },
    { id: 'ai', label: 'AI추천', icon: <RobotIcon className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <SuitcaseIcon className="w-4 h-4 text-white" />
              </div>
            </a>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <h1 className="text-base font-bold text-gray-900">{destination}</h1>
              <p className="text-xs text-gray-500">
                {startDate && formatDateKoreanISO(startDate)} ~ {endDate && formatDateKoreanISO(endDate)}
                {dayCount > 0 && ` (${dayCount - 1}박 ${dayCount}일)`}
                {' · '}성인 {adults}명{children > 0 ? `, 아동 ${children}명` : ''}
                {styles.length > 0 && ` · ${styles.join(', ')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(routeInfo || !!routeError) && (
              <button
                onClick={resetRoute}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                경로 초기화
              </button>
            )}
            <button
              onClick={handleSavePlan}
              className={`hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${
                planSaved
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {planSaved ? '저장됨' : '저장하기'}
            </button>
            <button
              onClick={calculateRoute}
              disabled={routeLoading || (selectedPlaces.length > 0 ? selectedPlaces.length < 2 : markers.length < 2)}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <MapIcon className="w-4 h-4" /> 경로 계산
            </button>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <ClipboardIcon className="w-4 h-4" /> 공유
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* 데스크톱: 좌우 분할 */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)]">
          {/* 지도 영역 (좌측 50%) */}
          <div className="w-full lg:w-1/2 h-[40vh] lg:h-full relative animate-fade-in flex flex-col">
            {/* 출발지 검색 바 */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
              {departure ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">출</span>
                  <span className="text-sm font-medium text-gray-800 truncate">{departure.title}</span>
                  <span className="text-xs text-gray-400 truncate hidden sm:inline">{departure.address}</span>
                  <button onClick={clearDeparture} className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); searchDeparture(); }} className="flex items-center gap-2 flex-1">
                  <span className="w-5 h-5 rounded-full bg-gray-300 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">출</span>
                  <input
                    type="text"
                    value={departureQuery}
                    onChange={(e) => setDepartureQuery(e.target.value)}
                    placeholder="출발지 주소 또는 장소명 입력"
                    className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-800 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={departureSearching || !departureQuery.trim()}
                    className="flex-shrink-0 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-700 disabled:opacity-40 transition-colors"
                  >
                    {departureSearching ? '검색 중...' : '설정'}
                  </button>
                </form>
              )}
            </div>
            <div className="relative flex-1 min-h-0">
            <KakaoMap
              center={mapCenter}
              markers={[...(departure ? [departure] : []), ...(selectedPlaces.length > 0 ? selectedPlaces : markers)]}
              routePath={routePath}
              routeOrderMap={routeOrderMap}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
            {/* 경로 정보 오버레이 */}
            {(routeInfo || routeLoading || !!routeError) && (
              <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                {(routeInfo || routeLoading) && (
                  <RoutePolyline
                    routeInfo={routeInfo}
                    loading={routeLoading}
                    sections={routeSections}
                    stopNames={routeStopNames}
                    expanded={routeExpanded}
                    onToggleExpanded={() => setRouteExpanded((v) => !v)}
                  />
                )}
                {routeError && (
                  <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    ⚠️ {routeError}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* 패널 영역 (우측 50%) */}
          <div className="w-full lg:w-1/2 flex flex-col overflow-hidden bg-gray-50 animate-fade-in-right delay-200">
            {/* 모바일 탭 네비게이션 */}
            <div className="flex border-b border-gray-200 bg-white lg:hidden shadow-sm">
              {PANEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                    activePanel === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 데스크톱 탭 네비게이션 */}
            <div className="hidden lg:flex border-b border-gray-200 bg-white px-4 pt-2">
              {PANEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    activePanel === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 스크롤 가능한 패널 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
              {/* 날씨 패널 */}
              <div className={`${activePanel !== 'weather' ? 'hidden' : ''}`}>
                <WeatherPanel
                  lat={lat}
                  lng={lng}
                  areaCode={areaCode}
                  startDate={startDate}
                  endDate={endDate}
                  destination={destination}
                />
              </div>

              {/* 숙박 패널 */}
              <div className={`${activePanel !== 'stay' ? 'hidden' : ''}`}>
                <StayList
                  areaCode={areaCode}
                  onStayClick={handleStayClick}
                />
              </div>

              {/* 관광지/맛집 패널 */}
              <div className={`${activePanel !== 'attraction' ? 'hidden' : ''}`}>
                <AttractionList
                  areaCode={areaCode}
                  onItemClick={handleAttractionClick}
                  selectedIds={selectedPlaces.map((p) => p.id)}
                  onToggleSelect={toggleSelectedPlace}
                  onClearSelected={clearSelectedPlaces}
                  feedbackVersion={feedbackVersion}
                />
              </div>

              {/* AI 추천 패널 */}
              <div className={`${activePanel !== 'ai' ? 'hidden' : ''}`}>
                <AIRecommendation
                  destination={destination}
                  startDate={startDate}
                  endDate={endDate}
                  adults={adults}
                  children={children}
                  styles={styles}
                  stays={collectedStays}
                  attractions={
                    selectedPlaces.length > 0
                      ? selectedPlaces
                          .filter((p) => p.category !== 'food')
                          .map((p) => ({
                            title: p.title,
                            address: p.address || '',
                            category:
                              p.category === 'festival'
                                ? '축제/공연/행사'
                                : p.category === 'culture'
                                  ? '문화시설'
                                  : '관광지',
                          }))
                      : collectedAttractions
                  }
                  foods={
                    selectedPlaces.length > 0
                      ? selectedPlaces
                          .filter((p) => p.category === 'food')
                          .map((p) => ({ title: p.title, address: p.address || '' }))
                      : collectedFoods
                  }
                  weather={collectedWeather}
                  topLikedAttractions={topLikedAttractions}
                />
              </div>

              {/* 모바일 경로 계산 버튼 */}
              <div className="lg:hidden space-y-2">
                {(routeInfo || !!routeError) && (
                  <button
                    onClick={resetRoute}
                    className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    경로 초기화
                  </button>
                )}
                <button
                  onClick={handleSavePlan}
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    planSaved
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {planSaved ? '저장됨' : '여행 계획 저장'}
                </button>
                <button
                  onClick={calculateRoute}
                  disabled={routeLoading || (selectedPlaces.length > 0 ? selectedPlaces.length < 2 : markers.length < 2)}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {routeLoading ? '경로 계산 중...' : <><MapIcon className="w-5 h-5" /> 최적 경로 계산</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 장소 상세 모달 */}
      {selectedMarker && (
        <div className="animate-fade-in">
          <InfoWindowModal
            place={selectedMarker}
            onClose={() => setSelectedMarker(null)}
            likes={currentMarkerFeedback.likes}
            liked={user ? currentMarkerFeedback.likedBy.includes(user.email) : false}
            comments={currentMarkerFeedback.comments}
            user={user}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
          />
        </div>
      )}
    </main>
  );
}
