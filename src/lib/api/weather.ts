// 기상청 날씨 API 클라이언트

import { getCached, setCache, createCacheKey } from '../cache';
import { latLngToGrid } from '../utils/gridConverter';
import { formatDateYMD, getBaseTime, formatDateYMDHM, getDaysFromToday, getDateRange } from '../utils/dateFormat';
import type { WeatherAPIResponse, WeatherForecastItem, DailyWeather, MidTermWeatherResponse, MidTermForecast } from '../../types/weather';
import { SKY_LABELS, PTY_LABELS } from '../../types/weather';
import { getAreaByCode } from '../utils/areaCode';

const SHORT_FORECAST_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService2/getVilageFcst';
const MID_TEMP_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa';

/** 단기예보 조회 (3일) */
async function getShortForecast(lat: number, lng: number, baseDate: string): Promise<WeatherForecastItem[]> {
  const cacheKey = createCacheKey('weather-short', lat.toFixed(2), lng.toFixed(2), baseDate);
  const cached = getCached<WeatherForecastItem[]>(cacheKey);
  if (cached) return cached;

  const { nx, ny } = latLngToGrid(lat, lng);
  const now = new Date();
  const baseTime = getBaseTime(now);

  const params = new URLSearchParams({
    serviceKey: process.env.WEATHER_API_KEY || '',
    numOfRows: '1000',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate || formatDateYMD(now),
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const res = await fetch(`${SHORT_FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const json: WeatherAPIResponse = await res.json();
  if (json.response.header.resultCode !== '00') {
    throw new Error(`Weather API error: ${json.response.header.resultMsg}`);
  }

  const items = json.response.body?.items?.item || [];
  setCache(cacheKey, items);
  return items;
}

/** 중기기온예보 조회 (3~10일) */
async function getMidTermTemp(regId: string): Promise<MidTermForecast | null> {
  const cacheKey = createCacheKey('weather-mid', regId);
  const cached = getCached<MidTermForecast>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const tmFc = formatDateYMDHM(now);

  const params = new URLSearchParams({
    serviceKey: process.env.WEATHER_API_KEY || '',
    dataType: 'JSON',
    regId,
    tmFc,
  });

  const res = await fetch(`${MID_TEMP_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Mid-term weather API error: ${res.status}`);

  const json: MidTermWeatherResponse = await res.json();
  if (json.response.header.resultCode !== '00') {
    throw new Error(`Mid-term weather API error: ${json.response.header.resultMsg}`);
  }

  const items = json.response.body?.items?.item;
  const forecast = items?.[0] || null;
  if (forecast) setCache(cacheKey, forecast);
  return forecast;
}

/** 단기예보 데이터를 일별 날씨로 파싱 */
function parseShortForecast(items: WeatherForecastItem[]): Map<string, DailyWeather> {
  const dailyMap = new Map<string, DailyWeather>();

  for (const item of items) {
    const date = item.fcstDate;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        sky: '1',
        skyLabel: '맑음',
        tempMin: null,
        tempMax: null,
        pop: 0,
        pty: '0',
        ptyLabel: '없음',
      });
    }

    const daily = dailyMap.get(date)!;

    switch (item.category) {
      case 'TMN':
        daily.tempMin = parseFloat(item.fcstValue);
        break;
      case 'TMX':
        daily.tempMax = parseFloat(item.fcstValue);
        break;
      case 'SKY':
        // 대표 하늘상태로 12시 기준
        if (item.fcstTime === '1200') {
          daily.sky = item.fcstValue;
          daily.skyLabel = SKY_LABELS[item.fcstValue] || item.fcstValue;
        }
        break;
      case 'POP':
        daily.pop = Math.max(daily.pop, parseInt(item.fcstValue));
        break;
      case 'PTY':
        if (item.fcstValue !== '0' && item.fcstTime === '1200') {
          daily.pty = item.fcstValue;
          daily.ptyLabel = PTY_LABELS[item.fcstValue] || item.fcstValue;
        }
        break;
    }
  }

  return dailyMap;
}

/** 여행 기간에 대한 통합 날씨 정보 조회 */
export async function getWeatherForPeriod(
  lat: number,
  lng: number,
  areaCode: string,
  startDate: string,
  endDate: string
): Promise<DailyWeather[]> {
  const dates = getDateRange(startDate, endDate);
  const results: DailyWeather[] = [];
  const area = getAreaByCode(areaCode);

  // 단기예보: 오늘부터 3일
  try {
    const now = new Date();
    const baseDate = formatDateYMD(now);
    const shortItems = await getShortForecast(lat, lng, baseDate);
    const shortDaily = parseShortForecast(shortItems);

    for (const date of dates) {
      const daysFromToday = getDaysFromToday(date);

      if (daysFromToday <= 3 && daysFromToday >= 0) {
        const ymd = date.replace(/-/g, '');
        const daily = shortDaily.get(ymd);
        if (daily) {
          results.push(daily);
          continue;
        }
      }

      // 중기예보: 4~10일
      if (daysFromToday >= 4 && daysFromToday <= 10 && area) {
        try {
          const midForecast = await getMidTermTemp(area.midTaRegId);
          if (midForecast) {
            const dayOffset = daysFromToday;
            const minKey = `taMin${dayOffset}` as keyof MidTermForecast;
            const maxKey = `taMax${dayOffset}` as keyof MidTermForecast;
            const tempMin = midForecast[minKey] as number | undefined;
            const tempMax = midForecast[maxKey] as number | undefined;

            results.push({
              date: date.replace(/-/g, ''),
              sky: '0',
              skyLabel: '중기예보',
              tempMin: tempMin ?? null,
              tempMax: tempMax ?? null,
              pop: 0,
              pty: '0',
              ptyLabel: '없음',
            });
            continue;
          }
        } catch {
          // 중기예보 실패 시 월평균으로 폴백
        }
      }

      // 예보 범위 초과 (10일 이상)
      results.push({
        date: date.replace(/-/g, ''),
        sky: '-1',
        skyLabel: '예보 범위 초과',
        tempMin: null,
        tempMax: null,
        pop: 0,
        pty: '0',
        ptyLabel: '없음',
      });
    }
  } catch {
    // 전체 실패 시 빈 배열
    return [];
  }

  return results;
}
