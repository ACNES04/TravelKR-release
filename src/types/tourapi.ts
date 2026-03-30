// 한국관광공사 TourAPI 응답 타입

export interface TourAPIResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface StayItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도
  mapy: string; // 위도
  areacode: string;
  sigungucode?: string;
  goodstay?: string;
  hanok?: string;
  benikia?: string;
}

export interface AttractionItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx: string;
  mapy: string;
  areacode: string;
  sigungucode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  overview?: string;
}

export interface DetailCommonItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  tel?: string;
  homepage?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx: string;
  mapy: string;
  overview?: string;
}

export interface DetailImageItem {
  contentid: string;
  originimgurl: string;
  smallimageurl: string;
  imgname?: string;
  serialnum: string;
}

export type ContentTypeId =
  | '12'  // 관광지
  | '14'  // 문화시설
  | '15'  // 축제/공연/행사
  | '25'  // 여행코스
  | '28'  // 레포츠
  | '32'  // 숙박
  | '38'  // 쇼핑
  | '39'; // 음식점

export const CONTENT_TYPE_LABELS: Record<ContentTypeId, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/공연/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};
