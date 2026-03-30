'use client';

// RoutePolyline is handled directly in KakaoMap component
// This component manages the route info display

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  tollFare: number;
  taxiFare: number;
}

interface RoutePolylineProps {
  routeInfo: RouteInfo | null;
  loading?: boolean;
}

export default function RoutePolyline({ routeInfo, loading }: RoutePolylineProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-lg animate-pulse">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-blue-600">경로를 계산하고 있습니다...</span>
      </div>
    );
  }

  if (!routeInfo) return null;

  const distanceKm = (routeInfo.distance / 1000).toFixed(1);
  const hours = Math.floor(routeInfo.duration / 3600);
  const minutes = Math.floor((routeInfo.duration % 3600) / 60);
  const durationStr = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-sm font-medium text-blue-700">{distanceKm}km</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-blue-700">{durationStr}</span>
      </div>
      {routeInfo.tollFare > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-blue-600">통행료</span>
          <span className="text-sm font-medium text-blue-700">
            {routeInfo.tollFare.toLocaleString()}원
          </span>
        </div>
      )}
    </div>
  );
}
