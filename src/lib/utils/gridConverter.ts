// 위경도 → 기상청 격자 좌표 변환
// Lambert Conformal Conic Projection (기상청 제공 알고리즘)

interface GridCoord {
  nx: number;
  ny: number;
}

const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기준점 Y좌표(GRID)

const DEGRAD = Math.PI / 180.0;

export function latLngToGrid(lat: number, lng: number): GridCoord {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

// 주요 도시별 격자 좌표 매핑 (빠른 조회용)
export const CITY_GRID_MAP: Record<string, GridCoord> = {
  서울: { nx: 60, ny: 127 },
  인천: { nx: 55, ny: 124 },
  대전: { nx: 67, ny: 100 },
  대구: { nx: 89, ny: 90 },
  광주: { nx: 58, ny: 74 },
  부산: { nx: 98, ny: 76 },
  울산: { nx: 102, ny: 84 },
  세종: { nx: 66, ny: 103 },
  수원: { nx: 60, ny: 121 },
  춘천: { nx: 73, ny: 134 },
  강릉: { nx: 92, ny: 131 },
  청주: { nx: 69, ny: 107 },
  전주: { nx: 63, ny: 89 },
  제주: { nx: 52, ny: 38 },
  서귀포: { nx: 52, ny: 33 },
};
