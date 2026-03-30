'use client';

import { useEffect, useState } from 'react';
import type { DailyWeather } from '@/types/weather';
import { SkeletonWeather } from '@/components/common/Skeleton';
import ErrorFallback from '@/components/common/ErrorFallback';
import { formatDateKorean } from '@/lib/utils/dateFormat';
import { MONTHLY_AVG_TEMPS } from '@/lib/utils/areaCode';
import {
  SunnyIcon, PartlyCloudyIcon, CloudyIcon, ThermometerIcon, QuestionIcon,
  RainIcon, SleetIcon, SnowIcon, PartlyRainyIcon, WeatherIcon, DropletIcon,
} from '@/components/icons/Icons';

interface WeatherPanelProps {
  lat: number;
  lng: number;
  areaCode: string;
  startDate: string;
  endDate: string;
  destination: string;
}

function getSkyIcon(sky: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    '1': <SunnyIcon className="w-8 h-8 text-amber-400" />,
    '3': <PartlyCloudyIcon className="w-8 h-8 text-gray-500" />,
    '4': <CloudyIcon className="w-8 h-8 text-gray-400" />,
    '0': <ThermometerIcon className="w-8 h-8 text-orange-400" />,
    '-1': <QuestionIcon className="w-8 h-8 text-gray-300" />,
  };
  return icons[sky] || <ThermometerIcon className="w-8 h-8 text-orange-400" />;
}

function getPtyIcon(pty: string): React.ReactNode | null {
  const icons: Record<string, React.ReactNode> = {
    '1': <RainIcon className="w-8 h-8 text-blue-500" />,
    '2': <SleetIcon className="w-8 h-8 text-indigo-400" />,
    '3': <SnowIcon className="w-8 h-8 text-cyan-400" />,
    '4': <PartlyRainyIcon className="w-8 h-8 text-blue-400" />,
  };
  return icons[pty] || null;
}

export default function WeatherPanel({
  lat,
  lng,
  areaCode,
  startDate,
  endDate,
  destination,
}: WeatherPanelProps) {
  const [weather, setWeather] = useState<DailyWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function fetchWeather() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        areaCode,
        startDate,
        endDate,
      });
      const res = await fetch(`/api/weather?${params.toString()}`);
      if (!res.ok) throw new Error('날씨 데이터를 불러올 수 없습니다.');
      const data = await res.json();
      setWeather(data.weather || []);
      if (data.notice) setNotice(data.notice);
    } catch (err) {
      setError(err instanceof Error ? err.message : '날씨 조회 실패');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (lat && lng && startDate && endDate) {
      fetchWeather();
    }
  }, [lat, lng, startDate, endDate]);

  if (loading) return <SkeletonWeather />;
  if (error) return <ErrorFallback message={error} onRetry={fetchWeather} />;

  // 월평균 기온 참고 데이터
  const monthlyTemps = MONTHLY_AVG_TEMPS[destination] || null;
  const startMonth = new Date(startDate).getMonth();

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500"><WeatherIcon className="w-4 h-4" /></div>
        날씨 예보
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {weather.map((day, idx) => {
          const isOverRange = day.sky === '-1';
          const isMidTerm = day.sky === '0';
          const icon = day.pty !== '0' ? getPtyIcon(day.pty) : getSkyIcon(day.sky);
          const highPrecip = day.pop >= 60;

          return (
            <div
              key={idx}
              className={`
                flex-shrink-0 w-28 rounded-2xl border p-3 text-center transition-all
                ${isOverRange ? 'bg-gray-50 border-gray-200' : ''}
                ${highPrecip ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}
              `}
            >
              <div className="text-xs font-medium text-gray-500 mb-1">
                {formatDateKorean(day.date)}
              </div>
              <div className="flex justify-center my-2">{icon}</div>
              {isOverRange ? (
                <div className="text-xs text-gray-400">
                  예보 범위 초과
                  {monthlyTemps && (
                    <div className="mt-1 text-gray-500">
                      월평균 {monthlyTemps[startMonth]}°C
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-600 font-medium mb-1">
                    {isMidTerm ? '중기예보' : day.skyLabel}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {day.tempMin !== null ? `${day.tempMin}°` : '?'}
                    <span className="text-gray-300 mx-0.5">/</span>
                    {day.tempMax !== null ? `${day.tempMax}°` : '?'}
                  </div>
                  {!isMidTerm && (
                    <div className={`text-xs mt-1 flex items-center justify-center gap-0.5 ${highPrecip ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      <DropletIcon className="w-3 h-3" /> {day.pop}%
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {weather.length === 0 && (
          <div className="w-full text-center py-8">
            <div className="flex justify-center mb-3">
              <CloudyIcon className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              {notice || '날씨 데이터를 불러올 수 없습니다'}
            </p>
            <p className="text-gray-400 text-xs">
              기상청 API 서버 상태에 따라 일시적으로 제공되지 않을 수 있습니다
            </p>
            <button
              onClick={fetchWeather}
              className="mt-3 px-4 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
