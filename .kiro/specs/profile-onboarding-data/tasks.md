# Implementation Plan: Profile & Onboarding Data

## Overview

Incremental implementation across five areas: cotton removal, crop seasonalisation, profile smart caching, address hierarchy data, and cascading address dropdowns. Each task compiles and runs independently, building on the previous.

## Tasks

- [x] 1. Remove cotton from crop options
  - In `Client/src/data/content/onboardingOptions.ts`, delete the `{ value: "cotton", ... }` entry from the `cropTypes` array
  - No other files need changing — `cropTypes` is the single source of truth for all crop dropdowns
  - _Requirements: 5.1, 5.2, 5.4_

  - [x] 1.1 Write property test: cotton absent from all crop arrays
    - **Property 14: Cotton absent from all crop arrays**
    - **Validates: Requirements 5.1, 5.2**
    - Use `fc.constantFrom(...cropTypes)` and assert `c.value !== "cotton"` for every element

- [x] 2. Add `cropsBySeason` export and rebuild `cropTypes` from it
  - In `onboardingOptions.ts`, add the `CropsBySeason` interface and `cropsBySeason` constant with `rabi`, `kharif`, and `zayed` arrays (no cotton in any array)
  - Rebuild `cropTypes` as `sortOptions([...cropsBySeason.rabi, ...cropsBySeason.kharif, ...cropsBySeason.zayed, pulses, tomato, onion, other])` so there is a single source of truth
  - _Requirements: 4.1, 4.3, 5.1_

  - [x] 2.1 Write property test: crop season partitioning
    - **Property 12: Each crop in exactly one season**
    - **Validates: Requirements 4.1, 4.3**
    - For every crop in `cropsBySeason`, assert it appears in exactly one of the three season arrays

  - [x] 2.2 Write unit tests for `cropsBySeason`
    - Assert `cropsBySeason` exports exactly three keys: `rabi`, `kharif`, `zayed`
    - Assert no element in any season array has `value === "cotton"`
    - Assert `cropTypes` contains no `value === "cotton"` element

- [x] 3. Create `CropSelector` component
  - Create `Client/src/components/molecules/CropSelector.tsx`
  - Props: `value: string[]`, `onValueChange: (crops: string[]) => void`, `language: "en" | "hi"`
  - Renders three labelled sections (Rabi / रबी, Kharif / खरीफ, Zayed / जायद) each backed by `cropsBySeason[season]`
  - Multi-selection works across all sections; selected values stored as a flat `string[]`
  - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [x] 3.1 Write property test: multi-season selection
    - **Property 13: Multi-season selection works**
    - **Validates: Requirements 4.5**
    - Simulate selecting crops from different seasons and assert all appear in the `value` array

- [x] 4. Wire `CropSelector` into land-details forms
  - In `Client/src/app/(auth)/land-details.tsx`, replace the `<MultiSelect ... options={cropOptions} />` with `<CropSelector value={entry.crops} onValueChange={...} language={currentLanguage} />`
  - In `Client/src/app/land-details.tsx`, apply the same replacement
  - Remove the now-unused `cropTypes` / `cropOptions` imports from both files
  - _Requirements: 4.4, 5.2, 5.4_

  - [x] 4.1 Write unit test: CropSelector renders three section headers
    - Assert section headers for Rabi, Kharif, and Zayed are present in the rendered output
    - Assert cotton is not present in any rendered option
    - _Requirements: 4.2, 5.2_

- [x] 5. Implement smart caching in `UserProfileContext`
  - Add `PROFILE_CACHE_TTL_MS = 300_000` constant and `ProfileCache` interface (`profile`, `cachedAt`, `isDirty`) to `Client/src/contexts/UserProfileContext.tsx`
  - Update `refreshProfile` signature to `refreshProfile(force?: boolean): Promise<void>`
  - On call: read `AsyncStorage.getItem("profile_cache")`; if non-stale and `!isDirty` and `!force`, return cached data without fetching; otherwise show cached data immediately and fetch in background
  - On successful fetch: write updated `ProfileCache` to AsyncStorage with `isDirty: false`
  - On failed fetch: retain existing in-memory profile; log error silently
  - Update `updateProfile`: after a successful save, read the cache and write it back with `isDirty: true`
  - Update `init()`: hydrate from `ProfileCache` first (instant display), then call `refreshProfile()`
  - Add logout cache clear: expose or hook into `AuthContext.signOut` to call `AsyncStorage.removeItem("profile_cache")`
  - Update `UserProfileContextType` to include `refreshProfile: (force?: boolean) => Promise<void>`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_

  - [x] 5.1 Write property test: cache freshness prevents network requests
    - **Property 1: Non-stale non-dirty cache → no fetch**
    - **Validates: Requirements 1.2, 2.3**
    - Mock AsyncStorage with a fresh cache (`isDirty: false`, `cachedAt` within TTL); call `refreshProfile()`; assert fetch not called

  - [x] 5.2 Write property test: stale or dirty cache triggers re-fetch
    - **Property 2: Stale or dirty cache → fetch triggered**
    - **Validates: Requirements 1.3**
    - Use `fc.oneof(arbStaleCache(), arbDirtyCache())`; assert fetch called exactly once

  - [x] 5.3 Write property test: successful fetch updates cache correctly
    - **Property 3: Successful fetch → cache updated**
    - **Validates: Requirements 2.4**
    - Mock API to return an arbitrary `UserProfile`; assert `ProfileCache` in AsyncStorage has that profile, `isDirty: false`, and `cachedAt` within the last second

  - [x] 5.4 Write property test: failed fetch preserves cached profile
    - **Property 4: Failed fetch → profile unchanged**
    - **Validates: Requirements 1.5**
    - Mock API to throw; assert in-memory profile equals the previously cached profile

  - [x] 5.5 Write property test: successful save marks cache dirty
    - **Property 5: Successful save → isDirty=true**
    - **Validates: Requirements 1.6**
    - Call `updateProfile(...)` with a mock successful API; assert `ProfileCache.isDirty === true`

  - [x] 5.6 Write property test: cache persistence round-trip
    - **Property 6: Cache round-trip**
    - **Validates: Requirements 2.1**
    - Serialize and deserialize `ProfileCache`; assert `profile` field is deeply equal to original

  - [x] 5.7 Write unit tests for cache constants and logout
    - Assert `PROFILE_CACHE_TTL_MS === 300_000`
    - Assert `AsyncStorage.getItem("profile_cache")` returns `null` after logout

- [x] 6. Update `profile.tsx` pull-to-refresh to pass `force=true`
  - In `Client/src/app/(tab)/profile.tsx`, change `onRefresh` to call `await refreshProfile(true)` so pull-to-refresh bypasses the TTL
  - The `useFocusEffect` call stays as `refreshProfile()` (no force) — cache logic decides whether to fetch
  - _Requirements: 1.3, 2.5_

  - [x] 6.1 Write property test: pull-to-refresh bypasses TTL
    - **Property 7: force=true always fetches**
    - **Validates: Requirements 2.5**
    - For any `ProfileCache` state (including non-stale, non-dirty), calling `refreshProfile(true)` should trigger a network request

- [x] 7. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create address hierarchy type definitions and index
  - Create `Client/src/data/addressHierarchy/types.ts` with `Village`, `GramPanchayat`, `NyayPanchayat`, `Tehsil`, and `DistrictHierarchy` interfaces
  - Create `Client/src/data/addressHierarchy/index.ts` exporting `getHierarchyForDistrict(district: string): DistrictHierarchy | null` (handles "bhadohi", "bhadui", "mirzapur" spellings)
  - _Requirements: 3.9_

- [x] 9. Add Bhadohi address hierarchy static data
  - Create `Client/src/data/addressHierarchy/bhadohi.ts` exporting `bhadohiHierarchy: DistrictHierarchy`
  - Populate with the full Tehsil → Nyay Panchayat → Gram Panchayat → Village tree for Bhadohi district
  - Each node has `en` (English) and `hi` (Devanagari) name fields
  - _Requirements: 3.1, 3.9, 3.10_

  - [x] 9.1 Write unit tests for Bhadohi hierarchy
    - Assert `getHierarchyForDistrict("bhadohi")` returns a non-empty array
    - Assert `getHierarchyForDistrict("bhadui")` returns the same array (alias)
    - Assert `getHierarchyForDistrict("lucknow")` returns `null`

  - [x] 9.2 Write property test: localization completeness for Bhadohi
    - **Property 11: Hindi labels contain Devanagari**
    - **Validates: Requirements 3.10**
    - For every place name node in `bhadohiHierarchy`, assert `hi` field matches `/[\u0900-\u097F]/`

- [x] 10. Add Mirzapur address hierarchy static data
  - Create `Client/src/data/addressHierarchy/mirzapur.ts` exporting `mirzapurHierarchy: DistrictHierarchy`
  - Same structure as Bhadohi; populate with Mirzapur's Tehsil → Nyay Panchayat → Gram Panchayat → Village tree
  - _Requirements: 3.1, 3.9, 3.10_

  - [x] 10.1 Write unit tests for Mirzapur hierarchy
    - Assert `getHierarchyForDistrict("mirzapur")` returns a non-empty array

  - [x] 10.2 Write property test: localization completeness for Mirzapur
    - **Property 11: Hindi labels contain Devanagari (Mirzapur)**
    - **Validates: Requirements 3.10**
    - Same Devanagari assertion applied to `mirzapurHierarchy`

- [x] 11. Create `AddressDropdowns` component
  - Create `Client/src/components/molecules/AddressDropdowns.tsx`
  - Props: `district: string`, `value: AddressValue`, `onChange: (value: AddressValue) => void`, `language: "en" | "hi"`
  - When `district` is "bhadohi"/"bhadui"/"mirzapur": render four cascading `Select` components (Tehsil → Nyay Panchayat → Gram Panchayat → Village)
  - Derive child options from selected parent using `getHierarchyForDistrict`
  - On parent change: clear all child values via `onChange({ ...value, nyayPanchayat: "", gramPanchayat: "", village: "" })` etc.
  - When `district` is anything else: render `null` (caller keeps existing free-text inputs)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.10_

  - [x] 11.1 Write property test: cascade filtering correctness
    - **Property 8: Child options match parent**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - For any Tehsil `t` in the hierarchy, assert `getChildOptions(hierarchy, "tehsil", t)` equals exactly the Nyay Panchayats under `t`; repeat for NP→GP and GP→Village

  - [x] 11.2 Write property test: parent change clears children
    - **Property 9: Parent change clears children**
    - **Validates: Requirements 3.5**
    - For any fully-populated `AddressValue`, changing `tehsil` should reset `nyayPanchayat`, `gramPanchayat`, `village` to `""`

  - [x] 11.3 Write unit tests for `AddressDropdowns`
    - Assert four `Select` components render when `district="bhadohi"`
    - Assert `null` is rendered when `district="varanasi"`

- [x] 12. Wire `AddressDropdowns` into the onboarding personal-details form
  - In `Client/src/app/(auth)/personal-details.tsx`, after the district field, conditionally render `<AddressDropdowns>` when `personalDetails.district` is "bhadohi" or "mirzapur"
  - Bind `value` to `{ tehsil, nyayPanchayat, gramPanchayat, village }` from `personalDetails`
  - On `onChange`, call `updatePersonalDetails(...)` with the new address values
  - When district is not Bhadohi/Mirzapur, keep the existing free-text inputs for those fields
  - _Requirements: 3.1, 3.6, 3.7, 3.8_

  - [x] 12.1 Write property test: address values persist to store
    - **Property 10: Address values persist to store**
    - **Validates: Requirements 3.8**
    - Simulate selecting an `AddressValue` via `AddressDropdowns`; assert `useOnboardingStore().personalDetails` contains the same `tehsil`, `nyayPanchayat`, `gramPanchayat`, `village`

- [x] 13. Wire `AddressDropdowns` into the profile-edit personal-details form
  - In `Client/src/app/personal-details.tsx` (profile edit), pass `district` from `initialData.district` to `AddressDropdowns` and bind `value`/`onChange` to the form state managed by `PersonalDetailsForm`
  - Update `Client/src/components/molecules/PersonalDetailsForm.tsx` to accept and render `AddressDropdowns` when district is Bhadohi/Mirzapur, replacing the free-text inputs for those four fields
  - _Requirements: 3.6, 3.7, 3.8_

- [x] 14. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `cropTypes` is always derived from `cropsBySeason` — never edit it directly after task 2
- The `AddressDropdowns` component is purely presentational; all persistence goes through `updatePersonalDetails` / `useOnboardingStore`
- Property tests use [fast-check](https://github.com/dubzzz/fast-check); tag each test with `// Feature: profile-onboarding-data, Property N: <text>`
