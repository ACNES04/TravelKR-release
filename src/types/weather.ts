// 기상청 날씨 API 응답 타입

export interface WeatherAPIResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: WeatherForecastItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface WeatherForecastItem {
  baseDate: string;
  baseTime: string;
  category: WeatherCategory;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export type WeatherCategory =
  | 'TMP'  // 1시간 기온
  | 'TMN'  // 일 최저기온
  | 'TMX'  // 일 최고기온
  | 'SKY'  // 하늘상태
  | 'POP'  // 강수확률
  | 'PTY'  // 강수형태
  | 'PCP'  // 1시간 강수량
  | 'REH'  // 습도
  | 'SNO'  // 1시간 신적설
  | 'UUU'  // 풍속(동서)
  | 'VVV'  // 풍속(남북)
  | 'WAV'  // 파고
  | 'VEC'  // 풍향
  | 'WSD'; // 풍속

export type SkyStatus = '1' | '3' | '4'; // 1:맑음 3:구름많음 4:흐림
export type PrecipitationType = '0' | '1' | '2' | '3'; // 0:없음 1:비 2:비/눈 3:눈

export const SKY_LABELS: Record<string, string> = {
  '1': '맑음',
  '3': '구름많음',
  '4': '흐림',
};

export const PTY_LABELS: Record<string, string> = {
  '0': '없음',
  '1': '비',
  '2': '비/눈',
  '3': '눈',
  '4': '소나기',
};

export interface DailyWeather {
  date: string;
  sky: string;
  skyLabel: string;
  tempMin: number | null;
  tempMax: number | null;
  pop: number; // 강수확률
  pty: string; // 강수형태
  ptyLabel: string;
}

// 중기예보 타입
export interface MidTermForecast {
  regId: string;
  taMin3: number;
  taMax3: number;
  taMin4: number;
  taMax4: number;
  taMin5: number;
  taMax5: number;
  taMin6: number;
  taMax6: number;
  taMin7: number;
  taMax7: number;
  taMin8: number;
  taMax8: number;
  taMin9: number;
  taMax9: number;
  taMin10: number;
  taMax10: number;
}

export interface MidTermWeatherResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: MidTermForecast[];
      };
    };
  };
}
