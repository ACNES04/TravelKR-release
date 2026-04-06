// OpenWeatherMap 날씨 API 클라이언트

import { getCached, setCache, createCacheKey } from '../cache';
import { getDateRange } from '../utils/dateFormat';
import type { DailyWeather } from '../../types/weather';

const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

interface OpenWeatherEntry {
  dt: number;
  dt_txt: string;
  main: {
    temp_min: number;
    temp_max: number;
  };
  pop: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherEntry[];
}

function mapWeatherToDaily(entry: OpenWeatherEntry): Pick<DailyWeather, 'sky' | 'skyLabel' | 'pty' | 'ptyLabel'> {
  const weather = entry.weather[0];
  const weatherId = weather?.id ?? 800;
  const weatherMain = weather?.main ?? 'Clear';

  if (weatherMain === 'Snow') {
    return { sky: '4', skyLabel: '눈', pty: '3', ptyLabel: '눈' };
  }

  if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') {
    if (weatherId === 611 || weatherId === 612 || weatherId === 615 || weatherId === 616) {
      return { sky: '4', skyLabel: '비/눈', pty: '2', ptyLabel: '비/눈' };
    }
    return { sky: '4', skyLabel: '비', pty: '1', ptyLabel: '비' };
  }

  if (weatherId === 800) {
    return { sky: '1', skyLabel: '맑음', pty: '0', ptyLabel: '없음' };
  }

  if (weatherId >= 801 && weatherId <= 803) {
    return { sky: '3', skyLabel: '구름많음', pty: '0', ptyLabel: '없음' };
  }

  return { sky: '4', skyLabel: '흐림', pty: '0', ptyLabel: '없음' };
}

async function getOpenWeatherForecast(lat: number, lng: number): Promise<OpenWeatherEntry[]> {
  const cacheKey = createCacheKey('weather-owm', lat.toFixed(2), lng.toFixed(2));
  const cached = getCached<OpenWeatherEntry[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENWEATHER_API_KEY || '';
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    appid: apiKey,
    units: 'metric',
    lang: 'kr',
  });

  const res = await fetch(`${OPENWEATHER_FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`OpenWeather API error: ${res.status}`);
  }

  const json: OpenWeatherForecastResponse = await res.json();
  const list = json.list || [];
  setCache(cacheKey, list);
  return list;
}

function parseForecastByDate(list: OpenWeatherEntry[]): Map<string, DailyWeather> {
  type DailyAccumulator = {
    tempMin: number;
    tempMax: number;
    pop: number;
    representative: OpenWeatherEntry;
    repDistanceToNoon: number;
  };

  const accMap = new Map<string, DailyAccumulator>();

  for (const item of list) {
    const datePart = item.dt_txt.split(' ')[0] || '';
    const dateKey = datePart.replace(/-/g, '');
    const hour = Number((item.dt_txt.split(' ')[1] || '00:00:00').split(':')[0]);
    const distanceToNoon = Math.abs(12 - hour);

    if (!accMap.has(dateKey)) {
      accMap.set(dateKey, {
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        pop: Math.round(item.pop * 100),
        representative: item,
        repDistanceToNoon: distanceToNoon,
      });
      continue;
    }

    const acc = accMap.get(dateKey)!;
    acc.tempMin = Math.min(acc.tempMin, item.main.temp_min);
    acc.tempMax = Math.max(acc.tempMax, item.main.temp_max);
    acc.pop = Math.max(acc.pop, Math.round(item.pop * 100));

    if (distanceToNoon < acc.repDistanceToNoon) {
      acc.representative = item;
      acc.repDistanceToNoon = distanceToNoon;
    }
  }

  const dailyMap = new Map<string, DailyWeather>();
  for (const [date, acc] of accMap) {
    const mapped = mapWeatherToDaily(acc.representative);
    dailyMap.set(date, {
      date,
      sky: mapped.sky,
      skyLabel: mapped.skyLabel,
      tempMin: Number(acc.tempMin.toFixed(1)),
      tempMax: Number(acc.tempMax.toFixed(1)),
      pop: acc.pop,
      pty: mapped.pty,
      ptyLabel: mapped.ptyLabel,
    });
  }

  return dailyMap;
}

/** 여행 기간에 대한 통합 날씨 정보 조회 */
export async function getWeatherForPeriod(
  lat: number,
  lng: number,
  _areaCode: string,
  startDate: string,
  endDate: string
): Promise<DailyWeather[]> {
  try {
    const list = await getOpenWeatherForecast(lat, lng);
    const dailyMap = parseForecastByDate(list);
    const dates = getDateRange(startDate, endDate);

    return dates.map((date) => {
      const dateKey = date.replace(/-/g, '');
      const daily = dailyMap.get(dateKey);
      if (daily) return daily;

      return {
        date: dateKey,
        sky: '-1',
        skyLabel: '예보 범위 초과',
        tempMin: null,
        tempMax: null,
        pop: 0,
        pty: '0',
        ptyLabel: '없음',
      };
    });
  } catch (err) {
    console.error('OpenWeather API 전체 실패:', err);
    return [];
  }
}
