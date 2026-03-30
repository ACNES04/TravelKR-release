// 서버 사이드 인메모리 캐시 (TTL: 1시간)

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 60 * 60 * 1000; // 1시간

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });

  // 최대 500개 항목 유지 (LRU 아닌 단순 제한)
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}
