'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchForm from '@/components/search/SearchForm';
import DatePicker from '@/components/search/DatePicker';
import StyleTags from '@/components/search/StyleTags';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { TravelStyle } from '@/types';
import { getAreaByName } from '@/lib/utils/areaCode';
import { v4 as uuidv4 } from 'uuid';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  SuitcaseIcon, PinIcon, CloseIcon, PeopleIcon, SparkleIcon,
  MapIcon, WeatherIcon, HotelIcon, LandmarkIcon, RestaurantIcon,
  RobotIcon, RouteIcon, CalendarIcon, FestivalIcon,
} from '@/components/icons/Icons';

export default function Home() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [styles, setStyles] = useState<TravelStyle[]>([]);
  const [loading, setLoading] = useState(false);

  function handleCreatePlan() {
    if (!selectedPlace || !startDate || !endDate) return;

    setLoading(true);

    const area = getAreaByName(selectedPlace.name) || getAreaByName(selectedPlace.address);
    const planId = uuidv4();

    const params = new URLSearchParams({
      destination: selectedPlace.name,
      areaCode: area?.code || '',
      lat: String(selectedPlace.lat),
      lng: String(selectedPlace.lng),
      startDate,
      endDate,
      adults: String(adults),
      children: String(children),
      styles: styles.join(','),
    });

    const planData = {
      id: planId,
      destination: selectedPlace.name,
      areaCode: area?.code || '',
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      startDate,
      endDate,
      adults,
      children,
      styles,
    };
    localStorage.setItem(`plan-${planId}`, JSON.stringify(planData));

    router.push(`/plan/${planId}?${params.toString()}`);
  }

  const isValid = selectedPlace && startDate && endDate;

  const [featuresRef, featuresVisible] = useScrollReveal();
  const [howRef, howVisible] = useScrollReveal();
  const [formRef, formVisible] = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* ───────── 히어로 섹션 ───────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
          {/* 배경 장식 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-0 -left-16 w-80 h-80 bg-indigo-100 rounded-full opacity-30 blur-3xl animate-pulse-soft delay-700" />
            <svg className="absolute right-0 bottom-0 w-1/3 max-w-sm text-blue-100 opacity-40 hidden lg:block" viewBox="0 0 200 200" fill="currentColor">
              <path d="M47.3,-57.1C59.9,-46.2,67.8,-29.6,71.4,-11.7C75,6.2,74.3,25.5,65.2,39.4C56.2,53.3,38.9,61.9,20.7,67.1C2.5,72.3,-16.5,74.2,-33.2,68C-49.9,61.7,-64.3,47.2,-71.4,29.9C-78.5,12.5,-78.4,-7.6,-71.2,-24.3C-64,-41,-49.8,-54.3,-34.8,-64.3C-19.8,-74.2,-4,-80.9,9.4,-78.4C22.8,-75.9,34.7,-68.1,47.3,-57.1Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 좌측 텍스트 */}
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6 animate-fade-in-down">
                  <SparkleIcon className="w-4 h-4" />
                  AI 기반 여행 추천 서비스
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-gray-900 leading-tight mb-5 animate-fade-in-up">
                  여행을 더 쉽게,<br />
                  <span className="text-blue-600">스마트하게 떠나세요</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg mb-8 animate-fade-in-up delay-200">
                  여행지와 날짜만 선택하면 숙박시설, 관광지, 맛집, 날씨,<br className="hidden sm:block" />
                  최적 루트까지 AI가 한번에 추천해드립니다.
                </p>
                <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
                  <a
                    href="#plan-form"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white text-base font-bold rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <SparkleIcon className="w-5 h-5" />
                    여행 계획 시작하기
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 text-base font-bold rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    서비스 둘러보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>

              {/* 우측 카드 미리보기 */}
              <div className="hidden lg:block relative animate-fade-in-right delay-300">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md ml-auto transform rotate-1 hover:rotate-0 transition-transform duration-500 animate-float">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <MapIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">제주도 3박4일</div>
                      <div className="text-xs text-gray-500">2026.04.10 ~ 04.13 · 성인 2명</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: <WeatherIcon className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600', label: '맑음 18°C ~ 23°C' },
                      { icon: <HotelIcon className="w-4 h-4" />, color: 'bg-red-50 text-red-500', label: '제주 해비치호텔' },
                      { icon: <LandmarkIcon className="w-4 h-4" />, color: 'bg-blue-50 text-blue-500', label: '성산일출봉, 만장굴, 협재해변' },
                      { icon: <RestaurantIcon className="w-4 h-4" />, color: 'bg-green-50 text-green-600', label: '흑돼지 거리, 해녀의 집' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          {item.icon}
                        </div>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 보조 카드 */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 transform -rotate-3">
                  <div className="flex items-center gap-2">
                    <RobotIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-800">AI가 최적 일정을 생성했어요!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── 서비스 소개 그리드 (대한민국 구석구석 스타일) ───────── */}
        <section id="features" className="py-16 md:py-20 bg-white border-t border-gray-100">
          <div ref={featuresRef} className={`max-w-7xl mx-auto px-4 sm:px-6 ${featuresVisible ? '' : 'opacity-0'}`}>
            <div className={`grid md:grid-cols-2 gap-8 mb-12 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div>
                <h2 className="text-sm font-bold text-blue-600 mb-2">여행 정보</h2>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-blue-600 mb-2">여행 서비스</h2>
                <div className="h-0.5 w-12 bg-blue-600 rounded-full" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              {[
                { icon: <LandmarkIcon className="w-6 h-6" />, title: '관광지', desc: '전국 인기 관광지와 숨은 명소를 한눈에 확인하세요.' },
                { icon: <RestaurantIcon className="w-6 h-6" />, title: '맛집', desc: '지역 대표 맛집과 로컬 맛집 정보를 제공합니다.' },
                { icon: <HotelIcon className="w-6 h-6" />, title: '숙박시설', desc: '호텔, 펜션, 한옥 등 다양한 숙소를 비교해 보세요.' },
                { icon: <FestivalIcon className="w-6 h-6" />, title: '축제·행사', desc: '지역 축제와 문화 행사 일정을 확인할 수 있습니다.' },
                { icon: <WeatherIcon className="w-6 h-6" />, title: '날씨 예보', desc: '여행 기간 동안의 상세 날씨 정보를 제공합니다.' },
                { icon: <RouteIcon className="w-6 h-6" />, title: '최적 경로', desc: '관광지 간 최적 이동 경로와 소요 시간을 안내합니다.' },
                { icon: <RobotIcon className="w-6 h-6" />, title: 'AI 일정 추천', desc: 'Gemini AI가 맞춤형 여행 일정을 자동으로 생성합니다.' },
                { icon: <MapIcon className="w-6 h-6" />, title: '지도 보기', desc: '카카오맵에서 모든 장소를 한번에 확인하세요.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 group cursor-default transition-all duration-700 ${
                    featuresVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: featuresVisible ? `${150 + i * 80}ms` : '0ms' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── 이용 방법 ───────── */}
        <section id="how" className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
          <div ref={howRef} className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className={`text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 transition-all duration-700 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>간단한 3단계로 완성하는 여행 계획</h2>
            <p className={`text-gray-500 mb-12 transition-all duration-700 delay-100 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>복잡한 여행 준비, AI가 도와드립니다</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', icon: <PinIcon className="w-7 h-7" />, title: '여행지 선택', desc: '가고 싶은 지역을 검색하고 선택하세요' },
                { step: '02', icon: <CalendarIcon className="w-7 h-7" />, title: '날짜·인원 설정', desc: '여행 기간과 인원, 스타일을 정해주세요' },
                { step: '03', icon: <RobotIcon className="w-7 h-7" />, title: 'AI 일정 생성', desc: 'AI가 최적의 여행 일정을 추천해드려요' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ${
                    howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: howVisible ? `${200 + i * 150}ms` : '0ms' }}
                >
                  <div className="text-xs font-bold text-blue-600 tracking-wider mb-4">STEP {item.step}</div>
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── 여행 계획 폼 ───────── */}
        <section id="plan-form" className="py-16 md:py-20 bg-white border-t border-gray-100">
          <div ref={formRef} className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className={`text-center mb-10 transition-all duration-700 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">여행 계획 만들기</h2>
              <p className="text-gray-500">여행지와 일정을 입력하면 모든 정보를 한번에 확인할 수 있어요</p>
            </div>

            <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6 transition-all duration-700 delay-200 ${formVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.97]'}`}>
              {/* 여행지 검색 */}
              <SearchForm
                value={destination}
                onChange={setDestination}
                onSelect={(place) => {
                  setSelectedPlace(place);
                  setDestination(place.name);
                }}
              />

              {/* 선택된 여행지 */}
              {selectedPlace && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                  <PinIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-blue-700 font-semibold">{selectedPlace.name}</span>
                  <span className="text-xs text-blue-400">{selectedPlace.address}</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedPlace(null); setDestination(''); }}
                    className="ml-auto w-6 h-6 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    aria-label="여행지 선택 취소"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 날짜 */}
              <DatePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />

              {/* 인원 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <PeopleIcon className="w-4 h-4" /> 인원
                </label>
                <div className="flex gap-6">
                  <CounterInput label="성인" value={adults} min={1} max={20} onChange={setAdults} />
                  <CounterInput label="아동" value={children} min={0} max={20} onChange={setChildren} />
                </div>
              </div>

              {/* 스타일 */}
              <StyleTags selected={styles} onChange={setStyles} />

              {/* 여행 계획 만들기 */}
              <button
                type="button"
                onClick={handleCreatePlan}
                disabled={!isValid || loading}
                className={`
                  w-full py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2
                  ${
                    isValid && !loading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    여행 계획 생성 중...
                  </>
                ) : (
                  <>
                    <SparkleIcon className="w-5 h-5" />
                    여행 계획 만들기
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ── 인원 카운터 컴포넌트 ── */
function CounterInput({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-8">{label}</span>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-lg"
          aria-label={`${label} 감소`}
        >
          −
        </button>
        <span className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-gray-900 bg-white border-x border-gray-200">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-lg"
          aria-label={`${label} 증가`}
        >
          +
        </button>
      </div>
    </div>
  );
}
