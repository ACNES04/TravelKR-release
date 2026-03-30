// 지역코드 매핑 테이블

export interface AreaInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
  midTaRegId: string; // 중기기온예보 지역코드
  midLandRegId: string; // 중기육상예보 지역코드
}

export const AREA_CODES: AreaInfo[] = [
  { code: '1', name: '서울', lat: 37.5665, lng: 126.978, midTaRegId: '11B10101', midLandRegId: '11B00000' },
  { code: '2', name: '인천', lat: 37.4563, lng: 126.7052, midTaRegId: '11B20201', midLandRegId: '11B00000' },
  { code: '3', name: '대전', lat: 36.3504, lng: 127.3845, midTaRegId: '11C20401', midLandRegId: '11C20000' },
  { code: '4', name: '대구', lat: 35.8714, lng: 128.6014, midTaRegId: '11H10701', midLandRegId: '11H10000' },
  { code: '5', name: '광주', lat: 35.1595, lng: 126.8526, midTaRegId: '11F20501', midLandRegId: '11F20000' },
  { code: '6', name: '부산', lat: 35.1796, lng: 129.0756, midTaRegId: '11H20201', midLandRegId: '11H20000' },
  { code: '7', name: '울산', lat: 35.5384, lng: 129.3114, midTaRegId: '11H20101', midLandRegId: '11H20000' },
  { code: '8', name: '세종', lat: 36.48, lng: 127.2589, midTaRegId: '11C20404', midLandRegId: '11C20000' },
  { code: '31', name: '경기', lat: 37.2752, lng: 127.0095, midTaRegId: '11B20601', midLandRegId: '11B00000' },
  { code: '32', name: '강원', lat: 37.8853, lng: 127.73, midTaRegId: '11D10301', midLandRegId: '11D10000' },
  { code: '33', name: '충북', lat: 36.6357, lng: 127.4912, midTaRegId: '11C10301', midLandRegId: '11C10000' },
  { code: '34', name: '충남', lat: 36.5184, lng: 126.8, midTaRegId: '11C20101', midLandRegId: '11C20000' },
  { code: '35', name: '경북', lat: 36.576, lng: 128.5056, midTaRegId: '11H10201', midLandRegId: '11H10000' },
  { code: '36', name: '경남', lat: 35.2374, lng: 128.6922, midTaRegId: '11H20301', midLandRegId: '11H20000' },
  { code: '37', name: '전북', lat: 35.8205, lng: 127.1088, midTaRegId: '11F10201', midLandRegId: '11F10000' },
  { code: '38', name: '전남', lat: 34.8161, lng: 126.4629, midTaRegId: '11F20401', midLandRegId: '11F20000' },
  { code: '39', name: '제주', lat: 33.4996, lng: 126.5312, midTaRegId: '11G00201', midLandRegId: '11G00000' },
];

export function getAreaByCode(code: string): AreaInfo | undefined {
  return AREA_CODES.find((a) => a.code === code);
}

export function getAreaByName(name: string): AreaInfo | undefined {
  return AREA_CODES.find((a) => name.includes(a.name));
}

// 월평균 기온 (예보 범위 초과 시 참고용)
export const MONTHLY_AVG_TEMPS: Record<string, number[]> = {
  // [1월, 2월, ..., 12월] 평균기온(°C)
  서울: [-2.4, 0.4, 5.7, 12.5, 17.8, 22.2, 24.9, 25.7, 21.2, 14.8, 7.2, 0.4],
  부산: [3.5, 5.0, 9.0, 14.0, 18.2, 21.3, 24.6, 25.8, 22.5, 17.5, 11.3, 5.6],
  제주: [5.7, 6.6, 9.8, 14.3, 18.2, 21.7, 25.8, 26.8, 23.1, 18.0, 12.4, 7.7],
  대전: [-1.0, 1.4, 6.7, 13.1, 18.2, 22.3, 25.0, 25.6, 20.8, 14.2, 7.0, 0.6],
  대구: [0.6, 3.2, 8.4, 14.6, 19.4, 22.9, 25.6, 26.1, 21.5, 15.6, 8.7, 2.5],
  광주: [0.6, 2.7, 7.5, 13.5, 18.3, 22.0, 25.2, 25.9, 21.4, 15.3, 8.5, 2.5],
  강원: [-4.7, -2.0, 3.9, 11.0, 16.5, 20.7, 23.3, 23.6, 18.4, 12.0, 4.7, -2.2],
};
