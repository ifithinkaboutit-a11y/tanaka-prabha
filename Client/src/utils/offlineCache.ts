/**
 * Simple AsyncStorage-backed cache for offline-first data.
 * Stores data with a TTL; stale data is still returned when offline.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

export async function cacheSet<T>(key: string, data: T, ttl = DEFAULT_TTL_MS): Promise<void> {
  const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };
  await AsyncStorage.setItem(key, JSON.stringify(entry));
}

export async function cacheGet<T>(key: string): Promise<{ data: T; stale: boolean } | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const entry: CacheEntry<T> = JSON.parse(raw);
  const stale = Date.now() - entry.cachedAt > entry.ttl;
  return { data: entry.data, stale };
}

/**
 * Fetch-with-cache: tries network first, falls back to cache when offline.
 * Always updates cache on successful network fetch.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL_MS
): Promise<T> {
  const net = await NetInfo.fetch();
  const isOnline = net.isConnected && net.isInternetReachable !== false;

  if (isOnline) {
    try {
      const data = await fetcher();
      await cacheSet(cacheKey, data, ttl);
      return data;
    } catch (err) {
      // Network failed — fall through to cache
    }
  }

  const cached = await cacheGet<T>(cacheKey);
  if (cached) return cached.data;

  // Nothing cached and offline — throw so callers can show empty state
  throw new Error("Offline and no cached data available");
}

export const CACHE_KEYS = {
  SCHEMES: "cache_schemes_all",
  BANNERS: "cache_banners_all",
  PROGRAMS: "cache_programs_all",
  HOME_SCHEMES: "cache_home_schemes",
} as const;
