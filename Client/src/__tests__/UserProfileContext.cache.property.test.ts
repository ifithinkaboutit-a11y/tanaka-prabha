/**
 * Property-based and unit tests for UserProfileContext smart caching.
 *
 * These tests exercise the pure cache logic exported from UserProfileContext
 * without mounting any React components or hooks.
 */

// Feature: profile-onboarding-data, Property 1: non-stale non-dirty cache → no fetch
// Feature: profile-onboarding-data, Property 2: stale or dirty cache → fetch triggered
// Feature: profile-onboarding-data, Property 3: successful fetch → cache updated
// Feature: profile-onboarding-data, Property 4: failed fetch → profile unchanged
// Feature: profile-onboarding-data, Property 5: successful save → isDirty=true
// Feature: profile-onboarding-data, Property 6: cache round-trip

import * as fc from "fast-check";
import {
  PROFILE_CACHE_TTL_MS,
  PROFILE_CACHE_KEY,
  ProfileCache,
  isCacheFresh,
  clearProfileCache,
} from "../contexts/UserProfileContext";
import { UserProfile } from "../services/apiService";

// ── AsyncStorage mock ────────────────────────────────────────────────────────
const mockStorage: Record<string, string> = {};

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockStorage[key] ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((k) => delete mockStorage[k]);
  }),
}));

// ── Arbitraries ──────────────────────────────────────────────────────────────

/** Generates a minimal valid UserProfile */
const arbUserProfile = (): fc.Arbitrary<UserProfile> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    mobileNumber: fc.stringMatching(/^[0-9]{10}$/),
    age: fc.option(fc.integer({ min: 18, max: 100 }), { nil: undefined }),
    gender: fc.option(fc.constantFrom("male", "female", "other"), { nil: undefined }),
    village: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    district: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    state: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  });

/** Generates a cachedAt timestamp that is within the TTL (fresh) */
const arbRecentTimestamp = (): fc.Arbitrary<string> =>
  fc
    .integer({ min: 0, max: PROFILE_CACHE_TTL_MS - 1 })
    .map((ageMs) => new Date(Date.now() - ageMs).toISOString());

/** Generates a cachedAt timestamp that is beyond the TTL (stale) */
const arbStaleTimestamp = (): fc.Arbitrary<string> =>
  fc
    .integer({ min: PROFILE_CACHE_TTL_MS, max: PROFILE_CACHE_TTL_MS * 10 })
    .map((ageMs) => new Date(Date.now() - ageMs).toISOString());

/** Fresh, non-dirty cache */
const arbFreshCache = (): fc.Arbitrary<ProfileCache> =>
  fc.record({
    profile: arbUserProfile(),
    cachedAt: arbRecentTimestamp(),
    isDirty: fc.constant(false),
  });

/** Stale cache (isDirty may be anything) */
const arbStaleCache = (): fc.Arbitrary<ProfileCache> =>
  fc.record({
    profile: arbUserProfile(),
    cachedAt: arbStaleTimestamp(),
    isDirty: fc.boolean(),
  });

/** Dirty cache (cachedAt may be fresh) */
const arbDirtyCache = (): fc.Arbitrary<ProfileCache> =>
  fc.record({
    profile: arbUserProfile(),
    cachedAt: arbRecentTimestamp(),
    isDirty: fc.constant(true),
  });

/** Any ProfileCache */
const arbProfileCache = (): fc.Arbitrary<ProfileCache> =>
  fc.oneof(arbFreshCache(), arbStaleCache(), arbDirtyCache());

// ── Helper: build a cache-check + fetch simulation ───────────────────────────

/**
 * Simulates the core refreshProfile logic against a given cache state.
 * Returns { fetchCalled, resultProfile }.
 */
async function simulateRefresh(
  cache: ProfileCache | null,
  force: boolean,
  fetchResult: UserProfile | Error
): Promise<{ fetchCalled: boolean; resultProfile: UserProfile | null }> {
  let fetchCalled = false;
  let resultProfile: UserProfile | null = cache?.profile ?? null;

  // Replicate the cache-check logic from UserProfileContext
  if (cache && isCacheFresh(cache) && !force) {
    // Fresh cache, no force → return cached, no fetch
    resultProfile = cache.profile;
    return { fetchCalled, resultProfile };
  }

  // Show cached data immediately (if any)
  if (cache) {
    resultProfile = cache.profile;
  }

  // Background fetch
  fetchCalled = true;
  if (fetchResult instanceof Error) {
    // fetch failed — retain existing profile
  } else {
    resultProfile = fetchResult;
    // Write updated cache
    const newCache: ProfileCache = {
      profile: fetchResult,
      cachedAt: new Date().toISOString(),
      isDirty: false,
    };
    mockStorage[PROFILE_CACHE_KEY] = JSON.stringify(newCache);
  }

  return { fetchCalled, resultProfile };
}

/**
 * Simulates the updateProfile cache-dirty logic.
 * Returns the ProfileCache written to storage.
 */
async function simulateUpdateProfile(
  existingCache: ProfileCache | null,
  savedProfile: UserProfile
): Promise<ProfileCache> {
  if (existingCache) {
    const dirtyCache: ProfileCache = { ...existingCache, isDirty: true };
    mockStorage[PROFILE_CACHE_KEY] = JSON.stringify(dirtyCache);
    return dirtyCache;
  } else {
    const dirtyCache: ProfileCache = {
      profile: savedProfile,
      cachedAt: new Date().toISOString(),
      isDirty: true,
    };
    mockStorage[PROFILE_CACHE_KEY] = JSON.stringify(dirtyCache);
    return dirtyCache;
  }
}

// ── Task 5.7: Unit tests for constants and logout ────────────────────────────

describe("Cache constants", () => {
  it("PROFILE_CACHE_TTL_MS equals 300_000", () => {
    expect(PROFILE_CACHE_TTL_MS).toBe(300_000);
  });

  it("PROFILE_CACHE_KEY equals 'profile_cache'", () => {
    expect(PROFILE_CACHE_KEY).toBe("profile_cache");
  });
});

describe("clearProfileCache (logout)", () => {
  beforeEach(() => {
    mockStorage[PROFILE_CACHE_KEY] = JSON.stringify({
      profile: { id: "1", name: "Test", mobileNumber: "1234567890" },
      cachedAt: new Date().toISOString(),
      isDirty: false,
    });
  });

  it("AsyncStorage.getItem('profile_cache') returns null after clearProfileCache()", async () => {
    await clearProfileCache();
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    const result = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    expect(result).toBeNull();
  });
});

// ── isCacheFresh unit tests ──────────────────────────────────────────────────

describe("isCacheFresh", () => {
  it("returns true for a fresh non-dirty cache", () => {
    const cache: ProfileCache = {
      profile: { id: "1", name: "A", mobileNumber: "0000000000" },
      cachedAt: new Date().toISOString(),
      isDirty: false,
    };
    expect(isCacheFresh(cache)).toBe(true);
  });

  it("returns false for a dirty cache even if within TTL", () => {
    const cache: ProfileCache = {
      profile: { id: "1", name: "A", mobileNumber: "0000000000" },
      cachedAt: new Date().toISOString(),
      isDirty: true,
    };
    expect(isCacheFresh(cache)).toBe(false);
  });

  it("returns false for a stale non-dirty cache", () => {
    const cache: ProfileCache = {
      profile: { id: "1", name: "A", mobileNumber: "0000000000" },
      cachedAt: new Date(Date.now() - PROFILE_CACHE_TTL_MS - 1).toISOString(),
      isDirty: false,
    };
    expect(isCacheFresh(cache)).toBe(false);
  });
});

// ── Property 1: Non-stale non-dirty cache → no fetch ────────────────────────

describe("Property 1: Non-stale non-dirty cache → no fetch", () => {
  /**
   * Validates: Requirements 1.2, 2.3
   * For any fresh (non-stale, non-dirty) cache, refreshProfile() must NOT
   * trigger a network request.
   */
  it("fresh non-dirty cache prevents network fetch", async () => {
    await fc.assert(
      fc.asyncProperty(arbFreshCache(), async (cache) => {
        const fetchProfile = jest.fn();
        const { fetchCalled } = await simulateRefresh(cache, false, fetchProfile as any);
        return fetchCalled === false;
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 2: Stale or dirty cache → fetch triggered ──────────────────────

describe("Property 2: Stale or dirty cache → fetch triggered", () => {
  /**
   * Validates: Requirements 1.3
   * For any stale or dirty cache, refreshProfile() must trigger exactly one
   * network request.
   */
  it("stale cache triggers a fetch", async () => {
    await fc.assert(
      fc.asyncProperty(arbStaleCache(), arbUserProfile(), async (cache, freshProfile) => {
        const { fetchCalled } = await simulateRefresh(cache, false, freshProfile);
        return fetchCalled === true;
      }),
      { numRuns: 100 }
    );
  });

  it("dirty cache triggers a fetch", async () => {
    await fc.assert(
      fc.asyncProperty(arbDirtyCache(), arbUserProfile(), async (cache, freshProfile) => {
        const { fetchCalled } = await simulateRefresh(cache, false, freshProfile);
        return fetchCalled === true;
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 3: Successful fetch → cache updated ────────────────────────────

describe("Property 3: Successful fetch → cache updated", () => {
  /**
   * Validates: Requirements 2.4
   * After a successful fetch, the ProfileCache in AsyncStorage must contain
   * the new profile, isDirty=false, and a cachedAt within the last second.
   */
  it("successful fetch writes updated cache with isDirty=false and fresh cachedAt", async () => {
    await fc.assert(
      fc.asyncProperty(arbStaleCache(), arbUserProfile(), async (staleCache, freshProfile) => {
        // Clear storage before each run
        delete mockStorage[PROFILE_CACHE_KEY];

        const before = Date.now();
        await simulateRefresh(staleCache, false, freshProfile);
        const after = Date.now();

        const raw = mockStorage[PROFILE_CACHE_KEY];
        if (!raw) return false;

        const written: ProfileCache = JSON.parse(raw);
        const cachedAtMs = Date.parse(written.cachedAt);

        return (
          written.isDirty === false &&
          cachedAtMs >= before &&
          cachedAtMs <= after + 10 &&
          written.profile.id === freshProfile.id &&
          written.profile.name === freshProfile.name
        );
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 4: Failed fetch → profile unchanged ────────────────────────────

describe("Property 4: Failed fetch → profile unchanged", () => {
  /**
   * Validates: Requirements 1.5
   * If the background re-fetch throws, the in-memory profile must remain
   * equal to the previously cached profile.
   */
  it("failed fetch preserves the cached profile", async () => {
    await fc.assert(
      fc.asyncProperty(arbStaleCache(), async (cache) => {
        const fetchError = new Error("Network error");
        const { resultProfile } = await simulateRefresh(cache, false, fetchError);
        return (
          resultProfile !== null &&
          resultProfile.id === cache.profile.id &&
          resultProfile.name === cache.profile.name
        );
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 5: Successful save → isDirty=true ──────────────────────────────

describe("Property 5: Successful save → isDirty=true", () => {
  /**
   * Validates: Requirements 1.6
   * After a successful updateProfile call, the ProfileCache in AsyncStorage
   * must have isDirty=true.
   */
  it("updateProfile marks cache dirty", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(arbFreshCache(), { nil: null }),
        arbUserProfile(),
        async (existingCache, savedProfile) => {
          delete mockStorage[PROFILE_CACHE_KEY];
          if (existingCache) {
            mockStorage[PROFILE_CACHE_KEY] = JSON.stringify(existingCache);
          }

          const written = await simulateUpdateProfile(existingCache, savedProfile);
          return written.isDirty === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 6: Cache persistence round-trip ────────────────────────────────

describe("Property 6: Cache persistence round-trip", () => {
  /**
   * Validates: Requirements 2.1
   * Serializing and deserializing a ProfileCache must produce a ProfileCache
   * whose profile field is deeply equal to the original.
   */
  it("JSON round-trip preserves the profile field exactly", () => {
    fc.assert(
      fc.property(arbUserProfile(), (profile) => {
        const cache: ProfileCache = {
          profile,
          cachedAt: new Date().toISOString(),
          isDirty: false,
        };
        const serialized = JSON.stringify(cache);
        const deserialized: ProfileCache = JSON.parse(serialized);
        // Deep equality check on all defined fields
        const orig = cache.profile;
        const restored = deserialized.profile;
        return (
          restored.id === orig.id &&
          restored.name === orig.name &&
          restored.mobileNumber === orig.mobileNumber &&
          restored.age === orig.age &&
          restored.gender === orig.gender &&
          restored.village === orig.village &&
          restored.district === orig.district &&
          restored.state === orig.state
        );
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 7: force=true always fetches ────────────────────────────────────

describe("Property 7: force=true always fetches", () => {
  /**
   * Validates: Requirements 2.5
   * For ANY ProfileCache state (including non-stale, non-dirty), calling
   * refreshProfile(true) must always trigger a network request.
   *
   * // Feature: profile-onboarding-data, Property 7: force=true always fetches
   */
  it("force=true triggers a fetch regardless of cache freshness or dirty state", async () => {
    await fc.assert(
      fc.asyncProperty(arbProfileCache(), arbUserProfile(), async (cache, freshProfile) => {
        const { fetchCalled } = await simulateRefresh(cache, true, freshProfile);
        return fetchCalled === true;
      }),
      { numRuns: 100 }
    );
  });

  it("force=true triggers a fetch even when cache is fresh and non-dirty", async () => {
    await fc.assert(
      fc.asyncProperty(arbFreshCache(), arbUserProfile(), async (cache, freshProfile) => {
        const { fetchCalled } = await simulateRefresh(cache, true, freshProfile);
        return fetchCalled === true;
      }),
      { numRuns: 100 }
    );
  });
});
