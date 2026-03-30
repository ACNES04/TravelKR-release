'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import WeatherPanel from '@/components/weather/WeatherPanel';
import StayList from '@/components/stay/StayList';
import AttractionList from '@/components/attraction/AttractionList';
import AIRecommendation from '@/components/ai/AIRecommendation';
import RoutePolyline from '@/components/map/RoutePolyline';
import InfoWindowModal from '@/components/map/InfoWindow';
import { SuitcaseIcon, MapIcon, ClipboardIcon, WeatherIcon, HotelIcon, LandmarkIcon, RobotIcon } from '@/components/icons/Icons';
import type { PlaceMarker } from '@/types';
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
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    tollFare: number;
    taxiFare: number;
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelTab>('weather');

  // 수집된 데이터 (AI 추천용)
  const [collectedStays, setCollectedStays] = useState<{ title: string; address: string }[]>([]);
  const [collectedAttractions, setCollectedAttractions] = useState<{ title: string; address: string; category: string }[]>([]);
  const [collectedFoods, setCollectedFoods] = useState<{ title: string; address: string }[]>([]);
  const [collectedWeather, setCollectedWeather] = useState<{ date: string; skyLabel: string; tempMin: number | null; tempMax: number | null; pop: number }[]>([]);

  const dayCount = startDate && endDate ? getDaysBetween(startDate, endDate) : 0;

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
    const ctId = item.contenttypeid;
    let category: PlaceMarker['category'] = 'attraction';
    if (ctId === '39') category = 'food';
    else if (ctId === '15') category = 'festival';
    else if (ctId === '14') category = 'culture';

    const marker: PlaceMarker = {
      id: item.contentid,
      title: item.title,
      lat: parseFloat(item.mapy),
      lng: parseFloat(item.mapx),
      category,
      image: item.firstimage,
      address: item.addr1,
      tel: item.tel,
    };
    setSelectedMarker(marker);
    setMapCenter({ lat: marker.lat, lng: marker.lng });
  }, []);

  // 지도 마커 클릭
  const handleMarkerClick = useCallback((marker: PlaceMarker) => {
    setSelectedMarker(marker);
  }, []);

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

        // 관광지
        const attrRes = await fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=12&numOfRows=15`);
        if (attrRes.ok) {
          const attrData = await attrRes.json();
          const attrs = attrData.items || [];
          setCollectedAttractions(
            attrs.map((a: AttractionItem) => ({
              title: a.title,
              address: a.addr1,
              category: CONTENT_TYPE_LABELS[a.contenttypeid as keyof typeof CONTENT_TYPE_LABELS] || '관광지',
            }))
          );

          const attrMarkers: PlaceMarker[] = attrs
            .filter((a: AttractionItem) => a.mapx && a.mapy)
            .map((a: AttractionItem) => ({
              id: a.contentid,
              title: a.title,
              lat: parseFloat(a.mapy),
              lng: parseFloat(a.mapx),
              category: 'attraction' as const,
              image: a.firstimage2,
              address: a.addr1,
            }));
          setMarkers((prev) => [...prev.filter((m) => m.category !== 'attraction'), ...attrMarkers]);
        }

        // 맛집
        const foodRes = await fetch(`/api/attractions?areaCode=${areaCode}&contentTypeId=39&numOfRows=15`);
        if (foodRes.ok) {
          const foodData = await foodRes.json();
          const foods = foodData.items || [];
          setCollectedFoods(foods.map((f: AttractionItem) => ({ title: f.title, address: f.addr1 })));

          const foodMarkers: PlaceMarker[] = foods
            .filter((f: AttractionItem) => f.mapx && f.mapy)
            .map((f: AttractionItem) => ({
              id: f.contentid,
              title: f.title,
              lat: parseFloat(f.mapy),
              lng: parseFloat(f.mapx),
              category: 'food' as const,
              image: f.firstimage2,
              address: f.addr1,
            }));
          setMarkers((prev) => [...prev.filter((m) => m.category !== 'food'), ...foodMarkers]);
        }

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

  // 최적 루트 계산
  async function calculateRoute() {
    const routeMarkers = markers.filter((m) => m.category === 'attraction' || m.category === 'food').slice(0, 5);
    if (routeMarkers.length < 2) return;

    setRouteLoading(true);
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
      if (res.ok) {
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
        }
      }
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setRouteLoading(false);
    }
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
            <button
              onClick={calculateRoute}
              disabled={routeLoading || markers.length < 2}
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
          <div className="w-full lg:w-1/2 h-[40vh] lg:h-full relative animate-fade-in">
            <KakaoMap
              center={mapCenter}
              markers={markers}
              routePath={routePath}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
            {/* 경로 정보 오버레이 */}
            {(routeInfo || routeLoading) && (
              <div className="absolute bottom-4 left-4 right-4 animate-slide-in-bottom">
                <RoutePolyline routeInfo={routeInfo} loading={routeLoading} />
              </div>
            )}
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
                  attractions={collectedAttractions}
                  foods={collectedFoods}
                  weather={collectedWeather}
                />
              </div>

              {/* 모바일 경로 계산 버튼 */}
              <div className="lg:hidden">
                <button
                  onClick={calculateRoute}
                  disabled={routeLoading || markers.length < 2}
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
          />
        </div>
      )}
    </main>
  );
}
