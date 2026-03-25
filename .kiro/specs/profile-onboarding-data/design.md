# Design Document: Profile & Onboarding Data

## Overview

This document covers five targeted improvements to the Tanak Prabha React Native/Expo app:

1. **Focus-triggered profile refresh** — profile screen fetches fresh data on every tab focus instead of only on mount.
2. **Smart caching with TTL** — `UserProfileContext` caches the profile in AsyncStorage with a 5-minute TTL and an `isDirty` flag to avoid redundant API calls at scale.
3. **Cascading address dropdowns** — a four-level hierarchy (Tehsil → Nyay Panchayat → Gram Panchayat → Village) for Bhadohi and Mirzapur districts, backed by a static data file.
4. **Crop categorisation by season** — crops grouped into Rabi, Kharif, and Zayed sections in all crop-selection forms.
5. **Cotton removal** — cotton removed from all crop option arrays.

The app is built with Expo Router, React Native, Zustand (with AsyncStorage persistence), and a REST backend. All changes are client-side only.

---

## Architecture

### Current State

```
UserProfileContext
  └── refreshProfile() → userApi.getProfile() → in-memory state only
  └── useFocusEffect in profile.tsx calls refreshProfile() unconditionally on every focus
```

The current `useFocusEffect` in `profile.tsx` already calls `refreshProfile()` on every focus, but `UserProfileContext` has no cache — it always hits the network. The profile screen shows stale data between the focus event and the API response completing.

### Target State

```
UserProfileContext
  ├── PROFILE_CACHE_TTL_MS = 300_000 (5 min)
  ├── ProfileCache (AsyncStorage key: "profile_cache")
  │     ├── profile: UserProfile
  │     ├── cachedAt: ISO-8601 string
  │     └── isDirty: boolean
  ├── On mount: hydrate from cache → background fetch if stale/dirty
  ├── refreshProfile(force?: boolean):
  │     ├── force=true (pull-to-refresh): skip TTL check, always fetch
  │     ├── non-stale + !isDirty: return cached data, no fetch
  │     └── stale OR isDirty: show cached, fetch in background, update cache
  └── On logout: clear "profile_cache" from AsyncStorage

onboardingOptions.ts
  ├── cropsBySeason: { rabi: SelectOption[], kharif: SelectOption[], zayed: SelectOption[] }
  ├── cropTypes: SelectOption[]  ← cotton removed
  └── (existing exports unchanged)

src/data/addressHierarchy/
  ├── bhadohi.ts   ← static Tehsil→NyayPanchayat→GramPanchayat→Village tree
  └── mirzapur.ts  ← same structure

AddressDropdowns component (new)
  ├── Props: district, value, onChange, language
  ├── Renders 4 cascading Select components for Bhadohi/Mirzapur
  └── Falls back to free-text inputs for other districts
```

### Data Flow: Profile Cache

```
App launch / tab focus
       │
       ▼
Read AsyncStorage "profile_cache"
       │
  ┌────┴────────────────────────────────────────┐
  │ Cache empty?                                │
  │   YES → show spinner → fetch → cache result │
  │   NO  → show cached data immediately        │
  │         ├── non-stale AND !isDirty → done   │
  │         └── stale OR isDirty                │
  │               → background fetch            │
  │               → update cache on success     │
  │               → retain cache on failure     │
  └─────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. `UserProfileContext` changes

```typescript
// New constant
export const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PROFILE_CACHE_KEY = "profile_cache";

// New cache shape
interface ProfileCache {
  profile: UserProfile;
  cachedAt: string;   // ISO-8601
  isDirty: boolean;
}

// Updated context type — refreshProfile gains optional force flag
interface UserProfileContextType {
  // ... existing fields ...
  refreshProfile: (force?: boolean) => Promise<void>;
}
```

Key behaviour changes:
- `refreshProfile(force = false)`: reads cache first; skips fetch if fresh and not dirty (unless `force=true`).
- `updateProfile(...)`: after a successful save, writes `isDirty: true` to the cache.
- `init()` on mount: reads cache, hydrates state immediately, then calls `refreshProfile()`.
- Logout handler (called from `AuthContext.signOut`): removes `PROFILE_CACHE_KEY` from AsyncStorage.

### 2. `profile.tsx` changes

The `useFocusEffect` already calls `refreshProfile()`. The only change needed is to pass `force=true` from the pull-to-refresh handler:

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  await refreshProfile(true); // bypass TTL
  setRefreshing(false);
};
```

The focus-triggered call stays as-is — the cache logic inside `UserProfileContext` decides whether to fetch.

### 3. `AddressDropdowns` component (new)

```typescript
// src/components/molecules/AddressDropdowns.tsx

interface AddressValue {
  tehsil: string;
  nyayPanchayat: string;
  gramPanchayat: string;
  village: string;
}

interface AddressDropdownsProps {
  district: string;           // "bhadohi" | "mirzapur" | other
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  language: "en" | "hi";
}
```

Internal logic:
- Derives available Nyay Panchayats from selected Tehsil.
- Derives available Gram Panchayats from selected Nyay Panchayat.
- Derives available Villages from selected Gram Panchayat.
- On parent change: clears all child values via `onChange`.

### 4. Address hierarchy data files

```typescript
// src/data/addressHierarchy/types.ts
export interface Village {
  en: string;
  hi: string;
}

export interface GramPanchayat {
  en: string;
  hi: string;
  villages: Village[];
}

export interface NyayPanchayat {
  en: string;
  hi: string;
  gramPanchayats: GramPanchayat[];
}

export interface Tehsil {
  en: string;
  hi: string;
  nyayPanchayats: NyayPanchayat[];
}

export type DistrictHierarchy = Tehsil[];
```

```typescript
// src/data/addressHierarchy/index.ts
export { bhadohiHierarchy } from "./bhadohi";
export { mirzapurHierarchy } from "./mirzapur";

export function getHierarchyForDistrict(district: string): DistrictHierarchy | null {
  const d = district.toLowerCase();
  if (d === "bhadohi" || d === "bhadui") return bhadohiHierarchy;
  if (d === "mirzapur") return mirzapurHierarchy;
  return null;
}
```

### 5. `onboardingOptions.ts` changes

```typescript
// New export
export interface CropsBySeason {
  rabi: SelectOption[];
  kharif: SelectOption[];
  zayed: SelectOption[];
}

export const cropsBySeason: CropsBySeason = {
  rabi: [
    { value: "wheat",    label: "Wheat",   labelHi: "गेहूं" },
    { value: "mustard",  label: "Mustard", labelHi: "सरसों" },
    { value: "gram",     label: "Gram",    labelHi: "चना" },
    { value: "potato",   label: "Potato",  labelHi: "आलू" },
    // ... other rabi crops
  ],
  kharif: [
    { value: "rice",      label: "Rice",      labelHi: "चावल" },
    { value: "maize",     label: "Maize",     labelHi: "मक्का" },
    { value: "soybean",   label: "Soybean",   labelHi: "सोयाबीन" },
    { value: "sugarcane", label: "Sugarcane", labelHi: "गन्ना" },
    // ... other kharif crops
  ],
  zayed: [
    { value: "vegetables", label: "Vegetables", labelHi: "सब्जियां" },
    { value: "fruits",     label: "Fruits",     labelHi: "फल" },
    { value: "groundnut",  label: "Groundnut",  labelHi: "मूंगफली" },
    // ... other zayed crops
  ],
};

// cropTypes is rebuilt from cropsBySeason (no cotton)
export const cropTypes: SelectOption[] = sortOptions([
  ...cropsBySeason.rabi,
  ...cropsBySeason.kharif,
  ...cropsBySeason.zayed,
  { value: "pulses", label: "Pulses", labelHi: "दालें" },
  { value: "tomato", label: "Tomato", labelHi: "टमाटर" },
  { value: "onion",  label: "Onion",  labelHi: "प्याज" },
  { value: "other",  label: "Other",  labelHi: "अन्य" },
]);
```

Cotton (`value: "cotton"`) is removed from all arrays. `cropTypes` is derived from `cropsBySeason` so there is a single source of truth.

### 6. `CropSelector` component (new or updated `MultiSelect` wrapper)

The `land-details.tsx` forms currently use `MultiSelect` directly with `cropOptions`. They will be updated to use a new `CropSelector` component that renders three labelled sections:

```typescript
// src/components/molecules/CropSelector.tsx
interface CropSelectorProps {
  value: string[];
  onValueChange: (crops: string[]) => void;
  language: "en" | "hi";
}
```

Renders:
```
[Section: Rabi / रबी]
  ○ Wheat  ○ Mustard  ○ Gram ...
[Section: Kharif / खरीफ]
  ○ Rice  ○ Maize  ○ Soybean ...
[Section: Zayed / जायद]
  ○ Vegetables  ○ Fruits ...
```

Multi-selection works across all sections. Selected values are stored as a flat `string[]` (unchanged from current `LandEntry.crops`).

---

## Data Models

### ProfileCache (AsyncStorage)

```typescript
interface ProfileCache {
  profile: UserProfile;  // full UserProfile object from apiService.ts
  cachedAt: string;      // new Date().toISOString()
  isDirty: boolean;      // true after any successful updateProfile call
}
```

Stored at AsyncStorage key `"profile_cache"`. Cleared on logout.

### AddressValue (form state)

```typescript
interface AddressValue {
  tehsil: string;        // e.g. "gyanpur"
  nyayPanchayat: string; // e.g. "aurai"
  gramPanchayat: string; // e.g. "rampur"
  village: string;       // e.g. "Rampur Kalan"
}
```

These four fields map directly to the existing `PersonalDetails` fields in `onboardingStore.ts` (`tehsil`, `nyayPanchayat`, `gramPanchayat`, `village`).

### DistrictHierarchy (static data)

```typescript
// Nested tree — no network required
type DistrictHierarchy = Array<{
  en: string;           // Tehsil name in English
  hi: string;           // Tehsil name in Devanagari
  nyayPanchayats: Array<{
    en: string;
    hi: string;
    gramPanchayats: Array<{
      en: string;
      hi: string;
      villages: Array<{ en: string; hi: string }>;
    }>;
  }>;
}>;
```

### CropsBySeason (static data)

```typescript
interface CropsBySeason {
  rabi:   SelectOption[];
  kharif: SelectOption[];
  zayed:  SelectOption[];
}
```

Each `SelectOption` has `{ value: string; label: string; labelHi: string }`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cache freshness prevents network requests

*For any* `ProfileCache` where `isDirty === false` and `Date.now() - Date.parse(cachedAt) < PROFILE_CACHE_TTL_MS`, calling `refreshProfile()` (without `force=true`) should not trigger a network request and should return the cached profile unchanged.

**Validates: Requirements 1.2, 2.3**

---

### Property 2: Stale or dirty cache triggers background re-fetch

*For any* `ProfileCache` where either `isDirty === true` or `Date.now() - Date.parse(cachedAt) >= PROFILE_CACHE_TTL_MS`, calling `refreshProfile()` should trigger exactly one network request.

**Validates: Requirements 1.3**

---

### Property 3: Successful fetch updates cache correctly

*For any* `UserProfile` returned by a successful API call, after `refreshProfile()` completes, the `ProfileCache` in AsyncStorage should contain that profile, a `cachedAt` timestamp within the last second, and `isDirty === false`.

**Validates: Requirements 2.4**

---

### Property 4: Failed fetch preserves cached profile

*For any* `ProfileCache` with a valid profile, if the background re-fetch throws a network error, the in-memory `profile` in `UserProfileContext` should remain equal to the previously cached profile.

**Validates: Requirements 1.5**

---

### Property 5: Successful save marks cache dirty

*For any* successful call to `updateProfile(...)`, the `ProfileCache` in AsyncStorage should have `isDirty === true` after the call completes.

**Validates: Requirements 1.6**

---

### Property 6: Cache persistence round-trip

*For any* `UserProfile` object, after a successful `refreshProfile()` call, serializing and deserializing the `ProfileCache` from AsyncStorage should produce a `ProfileCache` whose `profile` field is deeply equal to the original `UserProfile`.

**Validates: Requirements 2.1**

---

### Property 7: Pull-to-refresh bypasses TTL

*For any* `ProfileCache` state (including non-stale, non-dirty), calling `refreshProfile(true)` should always trigger a network request.

**Validates: Requirements 2.5**

---

### Property 8: Cascade filtering correctness

*For any* Tehsil `t` in the address hierarchy, the Nyay Panchayat options returned by `getChildOptions(hierarchy, "tehsil", t)` should be exactly the set of Nyay Panchayats whose parent Tehsil is `t` — no more, no fewer. The same property holds for Nyay Panchayat → Gram Panchayat and Gram Panchayat → Village.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 9: Parent change clears children

*For any* `AddressValue` with all four fields populated, changing the `tehsil` field should result in `nyayPanchayat`, `gramPanchayat`, and `village` all being reset to empty string. Changing `nyayPanchayat` should reset `gramPanchayat` and `village`. Changing `gramPanchayat` should reset `village`.

**Validates: Requirements 3.5**

---

### Property 10: Address values persist to store

*For any* `AddressValue` selected in the `AddressDropdowns` component, after the form is saved, `useOnboardingStore().personalDetails` should contain the same `tehsil`, `nyayPanchayat`, `gramPanchayat`, and `village` values.

**Validates: Requirements 3.8**

---

### Property 11: Localization completeness

*For any* place name in the address hierarchy data files and any crop name in `cropsBySeason`, when `language === "hi"`, the rendered label should be a non-empty string containing at least one Devanagari character (Unicode range U+0900–U+097F).

**Validates: Requirements 3.10, 4.6**

---

### Property 12: Crop season partitioning

*For any* crop `c` in `cropTypes`, `c` should appear in exactly one of `cropsBySeason.rabi`, `cropsBySeason.kharif`, or `cropsBySeason.zayed` (excluding `"other"` and any crops not assigned to a season).

**Validates: Requirements 4.1, 4.3**

---

### Property 13: Multi-season selection

*For any* combination of crops drawn from different season sections, the `CropSelector` should include all of them in its `value` array after selection.

**Validates: Requirements 4.5**

---

### Property 14: Cotton absent from all crop arrays

*For any* exported array from `onboardingOptions` that contains crop options, no element should have `value === "cotton"`.

**Validates: Requirements 5.1, 5.2**

---

## Error Handling

### Cache read failure
If `AsyncStorage.getItem("profile_cache")` throws or returns malformed JSON, `UserProfileContext` should catch the error, treat the cache as empty, and proceed with a full network fetch. The error should be logged but not surfaced to the user.

### Cache write failure
If `AsyncStorage.setItem(...)` fails after a successful fetch, the in-memory profile is still updated. The next app launch will fetch fresh data. Log the error silently.

### Background re-fetch failure
The in-memory profile and the existing cache entry are retained. No error alert is shown (the user already sees valid data). The `isDirty` flag is not cleared.

### Address hierarchy data missing
If `getHierarchyForDistrict` returns `null` for an unexpected district value, `AddressDropdowns` falls back to free-text inputs. This is the same behaviour as for non-Bhadohi/Mirzapur districts.

### Cascade selection with stale parent
If a stored `AddressValue` references a Nyay Panchayat that no longer exists under the selected Tehsil (e.g. data file updated), the child dropdown renders with no options and the stored value is cleared on the next parent change.

### Backwards compatibility: cotton in saved profiles
`Profile_Screen` renders crop values as plain strings from `profile.landDetails`. It does not filter against `cropTypes`, so a stored `"cotton"` value displays correctly without error.

---

## Testing Strategy

### Unit Tests

Focus on specific examples, edge cases, and integration points:

- `PROFILE_CACHE_TTL_MS` equals `300_000`.
- `cropsBySeason` exports exactly three keys: `rabi`, `kharif`, `zayed`.
- No element in any `onboardingOptions` crop array has `value === "cotton"`.
- `getHierarchyForDistrict("bhadohi")` returns a non-empty array.
- `getHierarchyForDistrict("mirzapur")` returns a non-empty array.
- `getHierarchyForDistrict("lucknow")` returns `null`.
- Rendering a `UserProfile` with `landDetails.rabiCrop = "cotton"` does not throw.
- After logout, `AsyncStorage.getItem("profile_cache")` returns `null`.
- `AddressDropdowns` renders four `Select` components when `district="bhadohi"`.
- `AddressDropdowns` renders free-text inputs when `district="varanasi"`.

### Property-Based Tests

Use [fast-check](https://github.com/dubzzz/fast-check) (already compatible with Jest/Vitest in React Native projects).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: profile-onboarding-data, Property N: <property text>`

**Property 1 — Cache freshness prevents network requests**
```
// Feature: profile-onboarding-data, Property 1: non-stale non-dirty cache → no fetch
fc.property(
  fc.record({ profile: arbUserProfile(), cachedAt: arbRecentTimestamp(), isDirty: fc.constant(false) }),
  (cache) => { /* mock AsyncStorage, call refreshProfile(), assert fetch not called */ }
)
```

**Property 2 — Stale or dirty cache triggers re-fetch**
```
// Feature: profile-onboarding-data, Property 2: stale or dirty cache → fetch triggered
fc.property(
  fc.oneof(arbStaleCache(), arbDirtyCache()),
  (cache) => { /* assert fetch called exactly once */ }
)
```

**Property 3 — Successful fetch updates cache correctly**
```
// Feature: profile-onboarding-data, Property 3: successful fetch → cache updated
fc.property(arbUserProfile(), (profile) => { /* mock API, assert cache shape */ })
```

**Property 4 — Failed fetch preserves cached profile**
```
// Feature: profile-onboarding-data, Property 4: failed fetch → profile unchanged
fc.property(arbProfileCache(), (cache) => { /* mock API to throw, assert profile unchanged */ })
```

**Property 5 — Successful save marks cache dirty**
```
// Feature: profile-onboarding-data, Property 5: successful save → isDirty=true
fc.property(arbProfileUpdate(), (update) => { /* call updateProfile, assert isDirty */ })
```

**Property 6 — Cache persistence round-trip**
```
// Feature: profile-onboarding-data, Property 6: cache round-trip
fc.property(arbUserProfile(), (profile) => {
  const cache: ProfileCache = { profile, cachedAt: new Date().toISOString(), isDirty: false };
  const serialized = JSON.stringify(cache);
  const deserialized: ProfileCache = JSON.parse(serialized);
  expect(deserialized.profile).toEqual(profile);
})
```

**Property 7 — Pull-to-refresh bypasses TTL**
```
// Feature: profile-onboarding-data, Property 7: force=true always fetches
fc.property(arbProfileCache(), (cache) => { /* call refreshProfile(true), assert fetch called */ })
```

**Property 8 — Cascade filtering correctness**
```
// Feature: profile-onboarding-data, Property 8: child options match parent
fc.property(arbTehsilFromHierarchy(), (tehsil) => {
  const options = getChildOptions(hierarchy, "tehsil", tehsil.en);
  expect(options).toEqual(tehsil.nyayPanchayats.map(np => np.en));
})
```

**Property 9 — Parent change clears children**
```
// Feature: profile-onboarding-data, Property 9: parent change clears children
fc.property(arbFullAddressValue(), arbTehsil(), (address, newTehsil) => {
  const result = applyParentChange(address, "tehsil", newTehsil);
  expect(result.nyayPanchayat).toBe("");
  expect(result.gramPanchayat).toBe("");
  expect(result.village).toBe("");
})
```

**Property 10 — Address values persist to store**
```
// Feature: profile-onboarding-data, Property 10: address values persist to store
fc.property(arbAddressValue(), (address) => {
  /* simulate form save, read store, assert equality */
})
```

**Property 11 — Localization completeness**
```
// Feature: profile-onboarding-data, Property 11: Hindi labels contain Devanagari
const DEVANAGARI = /[\u0900-\u097F]/;
fc.property(arbPlaceNameFromHierarchy(), (place) => {
  expect(DEVANAGARI.test(place.hi)).toBe(true);
})
```

**Property 12 — Crop season partitioning**
```
// Feature: profile-onboarding-data, Property 12: each crop in exactly one season
fc.property(arbCropFromCropsBySeason(), (crop) => {
  const seasons = ["rabi", "kharif", "zayed"] as const;
  const count = seasons.filter(s => cropsBySeason[s].some(c => c.value === crop.value)).length;
  expect(count).toBe(1);
})
```

**Property 13 — Multi-season selection**
```
// Feature: profile-onboarding-data, Property 13: multi-season selection works
fc.property(arbCropsFromDifferentSeasons(), (crops) => {
  /* simulate selecting each crop, assert all appear in value array */
})
```

**Property 14 — Cotton absent from all crop arrays**
```
// Feature: profile-onboarding-data, Property 14: cotton absent
fc.property(arbCropOptionArray(), (arr) => {
  expect(arr.every(c => c.value !== "cotton")).toBe(true);
})
```
