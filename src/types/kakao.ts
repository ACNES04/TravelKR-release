// Kakao API 응답 타입

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    is_end: boolean;
    pageable_count: number;
    same_name: {
      keyword: string;
      region: string[];
      selected_region: string;
    };
    total_count: number;
  };
}

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
  place_url: string;
  distance?: string;
}

export interface KakaoDirectionsResponse {
  trans_id: string;
  routes: KakaoRoute[];
}

export interface KakaoRoute {
  result_code: number;
  result_msg: string;
  summary: {
    origin: KakaoLocation;
    destination: KakaoLocation;
    waypoints: KakaoLocation[];
    distance: number; // 미터
    duration: number; // 초
    fare: {
      taxi: number;
      toll: number;
    };
  };
  sections: KakaoSection[];
}

export interface KakaoSection {
  distance: number;
  duration: number;
  roads: KakaoRoad[];
  guides: KakaoGuide[];
}

export interface KakaoRoad {
  name: string;
  distance: number;
  duration: number;
  traffic_speed: number;
  traffic_state: number;
  vertexes: number[]; // [x1, y1, x2, y2, ...]
}

export interface KakaoGuide {
  name: string;
  x: number;
  y: number;
  distance: number;
  duration: number;
  type: number;
  guidance: string;
  road_index: number;
}

export interface KakaoLocation {
  name?: string;
  x: number;
  y: number;
}

// Kakao Maps SDK 전역 타입
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance;
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindowInstance;
        Polyline: new (options: KakaoPolylineOptions) => KakaoPolylineInstance;
        LatLngBounds: new () => KakaoLatLngBounds;
        MarkerImage: new (src: string, size: KakaoSize, options?: { offset: KakaoPoint }) => KakaoMarkerImage;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        event: {
          addListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void;
          removeListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void;
        };
        services: {
          Places: new () => KakaoPlacesService;
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
      };
    };
  }
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

export interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  getLevel: () => number;
  getCenter: () => KakaoLatLng;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  panTo: (latlng: KakaoLatLng) => void;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng;
  map?: KakaoMapInstance;
  image?: KakaoMarkerImage;
  title?: string;
}

export interface KakaoMarkerInstance {
  setMap: (map: KakaoMapInstance | null) => void;
  getPosition: () => KakaoLatLng;
  setPosition: (position: KakaoLatLng) => void;
}

export interface KakaoInfoWindowOptions {
  content: string;
  removable?: boolean;
}

export interface KakaoInfoWindowInstance {
  open: (map: KakaoMapInstance, marker: KakaoMarkerInstance) => void;
  close: () => void;
}

export interface KakaoPolylineOptions {
  path: KakaoLatLng[];
  strokeWeight: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeStyle: string;
  map?: KakaoMapInstance;
}

export interface KakaoPolylineInstance {
  setMap: (map: KakaoMapInstance | null) => void;
  setPath: (path: KakaoLatLng[]) => void;
}

export interface KakaoLatLngBounds {
  extend: (latlng: KakaoLatLng) => void;
}

export interface KakaoMarkerImage {}

export interface KakaoSize {}

export interface KakaoPoint {}

export interface KakaoPlacesService {
  keywordSearch: (
    keyword: string,
    callback: (data: KakaoPlace[], status: string, pagination: unknown) => void,
    options?: { x?: string; y?: string; radius?: number }
  ) => void;
}
