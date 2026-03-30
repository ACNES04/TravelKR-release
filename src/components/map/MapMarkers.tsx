'use client';

import type { PlaceMarker } from '@/types';
import { MARKER_COLORS, CATEGORY_LABELS } from '@/types';

interface MapMarkersProps {
  markers: PlaceMarker[];
  onMarkerClick?: (marker: PlaceMarker) => void;
  selectedCategory?: string | null;
}

export default function MapMarkers({
  markers,
  onMarkerClick,
  selectedCategory,
}: MapMarkersProps) {
  const filtered = selectedCategory
    ? markers.filter((m) => m.category === selectedCategory)
    : markers;

  const categoryGroups = filtered.reduce(
    (acc, marker) => {
      if (!acc[marker.category]) acc[marker.category] = [];
      acc[marker.category].push(marker);
      return acc;
    },
    {} as Record<string, PlaceMarker[]>
  );

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {Object.entries(categoryGroups).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center gap-2 px-2 py-1 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: MARKER_COLORS[category as PlaceMarker['category']] }}
            />
            <span className="text-xs font-semibold text-gray-700">
              {CATEGORY_LABELS[category as PlaceMarker['category']]} ({items.length})
            </span>
          </div>
          {items.map((marker) => (
            <button
              key={marker.id}
              onClick={() => onMarkerClick?.(marker)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {marker.image ? (
                <img
                  src={marker.image}
                  alt={marker.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={{ backgroundColor: MARKER_COLORS[category as PlaceMarker['category']] }}
                >
                  {marker.title[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{marker.title}</div>
                {marker.address && (
                  <div className="text-xs text-gray-500 truncate">{marker.address}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
