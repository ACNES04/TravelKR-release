'use client';

export default function Skeleton({
  className = '',
  width,
  height,
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Skeleton className="w-full" height="160px" />
      <div className="p-4 space-y-3">
        <Skeleton className="w-3/4" height="20px" />
        <Skeleton className="w-full" height="14px" />
        <Skeleton className="w-1/2" height="14px" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonWeather() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-28 bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2"
        >
          <Skeleton className="w-full" height="14px" />
          <Skeleton className="w-12 h-12 mx-auto rounded-full" />
          <Skeleton className="w-full" height="14px" />
          <Skeleton className="w-full" height="12px" />
        </div>
      ))}
    </div>
  );
}
